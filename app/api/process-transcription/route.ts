import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripeInstance } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { FileType } from '@prisma/client';

const FREE_TRANSCRIPTION_LIMIT = 3; // limite gratis

// Funzione helper per creare URL Checkout Stripe per l'upgrade
async function createUpgradeCheckoutUrl(userId: string, userEmail: string | null | undefined, plan: 'pro' | 'business' = 'pro'): Promise<string | null> {
  const stripe = getStripeInstance();
  const PRICE_IDS = {
    pro: process.env.STRIPE_PRO_PRICE_ID, // DEVI aggiungere questi ID al tuo .env.local / Vercel
    business: process.env.STRIPE_BUSINESS_PRICE_ID,
  };
  const priceId = PRICE_IDS[plan];

  // Assicurati che NEXT_PUBLIC_APP_URL sia definito in .env.local / Vercel
  const DOMAIN = process.env.NEXT_PUBLIC_APP_URL;

  try {
    // Cerca l'utente nel DB per ottenere stripeCustomerId, se esiste
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true }
    });
    const customerId = user?.stripeCustomerId;

    console.log(`Creazione checkout per user ${userId}, customerId: ${customerId}, email: ${userEmail}`);

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${DOMAIN}/dashboard?upgraded=true`,
      cancel_url: `${DOMAIN}/dashboard?canceled_upgrade=true`,
      // Se hai il customerId, usalo, altrimenti Stripe lo crea/trova tramite email
      customer: customerId || undefined,
      customer_email: !customerId ? userEmail || undefined : undefined,
      // Utile per identificare l'utente nei webhook dopo il pagamento
      client_reference_id: userId,
       metadata: { userId: userId }, // Aggiungi metadati se servono ai webhook
      allow_promotion_codes: true, // Permetti codici sconto
    });

    console.log(`Sessione checkout creata: ${session.id} per user ${userId}`);
    return session.url;

  } catch (error) {
    console.error(`Errore creazione sessione checkout Stripe per user ${userId}:`, error);
    return null;
  }
}

// Handler POST per l'API
export async function POST(req: Request) {
  const session = await auth();

  // 1. Controllo Autenticazione
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato. Effettua il login." }, { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email;
  console.log(`Richiesta elaborazione da user ${userId}`);

  // --- ESTRAZIONE DATI CON VALIDAZIONE ---
  let fileInput: File | null = null;
  let textInput: string | null = null;
  let categoryForm: string = "meeting"; // Default
  let fileTypeForDb: FileType = FileType.audio; // Default, verrà sovrascritto
  let originalFileName = "Testo"; // Default per testo

  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      fileInput = formData.get('file') as File | null;
      categoryForm = (formData.get('category') as string | null)?.toLowerCase() || "meeting"; // Normalizza a lowercase
      const receivedType = formData.get('type') as string | null; // 'video', 'audio', 'text'

      if (!fileInput) throw new Error("File non trovato nel FormData.");
      originalFileName = fileInput.name;

      // Determina fileTypeForDb
      if (receivedType === 'video') fileTypeForDb = FileType.video;
      else if (receivedType === 'audio') fileTypeForDb = FileType.audio;
      else if (receivedType === 'text' && fileInput.type.startsWith('text/')) fileTypeForDb = FileType.testo;
      else throw new Error(`Tipo file non supportato ricevuto: ${receivedType} / ${fileInput.type}`);

    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      textInput = body.text as string | null;
      categoryForm = (body.category as string | null)?.toLowerCase() || "meeting"; // Normalizza

      if (!textInput) throw new Error("Testo non trovato nel body JSON.");
      fileTypeForDb = FileType.testo;

      // === CONVERSIONE TESTO IN FILE BLOB ===
      // Crea un Blob (sottotipo di File) dal testo
      const textBlob = new Blob([textInput], { type: 'text/plain' });
      // Crea un oggetto File dal Blob (necessario per FormData)
      fileInput = new File([textBlob], "testo.txt", { type: 'text/plain' });
      console.log("Testo incollato convertito in File object per l'invio.");

    } else {
      throw new Error(`Content-Type non supportato: ${contentType}`);
    }

    // Validazione categoria (content_type per Python)
    if (!["meeting", "lesson", "interview"].includes(categoryForm)) {
       throw new Error(`Categoria non valida: ${categoryForm}. Usare 'meeting', 'lesson' o 'interview'.`);
    }

  } catch (e) {
     const errorMessage = e instanceof Error ? e.message : 'Errore sconosciuto';
     console.error("Errore lettura/validazione body request:", errorMessage);
     return NextResponse.json({ error: `Dati richiesta non validi: ${errorMessage}` }, { status: 400 });
  }

  // 'fileInput' (sempre, anche per testo), 'categoryForm' (lowercase), 'fileTypeForDb', 'originalFileName'


  try {
    // 2. Recupera Utente dal DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
       console.error(`Utente ${userId} non trovato nel DB.`);
       return NextResponse.json({ error: "Utente non trovato." }, { status: 404 });
    }

    // 3. Controllo Limite per Utenti "Free"
    if (user.subscriptionStatus === "free") {
      const now = new Date();
      // Trova l'inizio del mese corrente (alle 00:00:00)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); 

      // Conta le trascrizioni create dall'utente da inizio mese
      const transcriptionsThisMonth = await prisma.transcription.count({
        where: {
          userId: userId,
          createdAt: {
            gte: startOfMonth, // >= inizio mese
          },
        },
      });
      console.log(`Utente ${userId} (Free): ${transcriptionsThisMonth} trascrizioni questo mese (Limite: ${FREE_TRANSCRIPTION_LIMIT})`);


      // Se il limite è raggiunto o superato
      if (transcriptionsThisMonth >= FREE_TRANSCRIPTION_LIMIT) {
        console.log(`Limite trascrizioni raggiunto per utente free ${userId}`);

        // Genera l'URL per l'upgrade (es. al piano Pro)
        const checkoutUrl = await createUpgradeCheckoutUrl(userId, userEmail, 'pro');

        return NextResponse.json({
          error: "LIMIT_REACHED", // Codice errore specifico per il frontend
          message: `Hai usato ${transcriptionsThisMonth}/${FREE_TRANSCRIPTION_LIMIT} analisi gratuite questo mese. Fai l'upgrade per continuare!`,
          checkoutUrl: checkoutUrl // Invia l'URL al frontend
        }, { status: 403 }); // 403 Forbidden è appropriato
      }
    } else {
        console.log(`Utente ${userId} con stato ${user.subscriptionStatus}, controllo limite saltato.`);
    }

    // --- SE IL CONTROLLO LIMITE PASSA (O UTENTE NON È FREE) ---

    // 4. PREPARA E INVIA LA RICHIESTA AL BACKEND PYTHON
    console.log(`Inoltro richiesta a Python backend per ${userId}...`);
    const pythonBackendUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    if (!pythonBackendUrl) {
        console.error("URL del backend Python non configurato (NEXT_PUBLIC_WORKER_URL)");
        throw new Error("Configurazione del servizio di elaborazione mancante.");
    }

    // Prepara FormData per Python
    const pythonFormData = new FormData();
    pythonFormData.append('file', fileInput as Blob, originalFileName); // Invia il file (o il blob di testo)
    pythonFormData.append('content_type', categoryForm); // Invia la categoria normalizzata
    pythonFormData.append('user_id', userId); // Invia l'ID utente

    // Esegui fetch a Python
    const pythonResponse = await fetch(`${pythonBackendUrl}/analyze`, {
        method: 'POST',
        body: pythonFormData,
        // Non impostare Content-Type qui, fetch lo fa per FormData
    });

    console.log(`Risposta da Python: ${pythonResponse.status}`);

    // Gestione risposta Python
    if (!pythonResponse.ok) {
      let errorDetail = "Errore sconosciuto dal servizio di elaborazione.";
      try {
         const errorJson = await pythonResponse.json();
         errorDetail = errorJson.detail || errorDetail;
      } catch (e) {
         errorDetail = await pythonResponse.text(); //fallback
      }
      console.error(`Errore da Python (${pythonResponse.status}): ${errorDetail}`);
      throw new Error(`Errore elaborazione (${pythonResponse.status}): ${errorDetail}`);
    }

    // Estrai risultati COMPLETI da Python
    const resultsFromPython = await pythonResponse.json(); // { transcript_id, riassunto, decisioni, tasks, etc... }
    console.log(`Elaborazione Python completata con successo per ${userId}. Transcript ID da Python: ${resultsFromPython.transcript_id}`);

    // 5. CREA RECORD Transcription NEL DB PRISMA (per tracciare l'uso)
    const titleToSave = `${categoryForm.charAt(0).toUpperCase() + categoryForm.slice(1)} - ${originalFileName}`;

    const newTranscription = await prisma.transcription.create({
      data: {
        // id generato da Prisma, ma potremmo voler allineare gli ID.
        // id: resultsFromPython.transcript_id, // Opzionale: dipende se vuoi usare lo stesso ID
        title: titleToSave.substring(0, 191), // Limita per DB
        transcript: resultsFromPython.riassunto || "Elaborazione completata", // Salva riassunto o testo placeholder
        cleanedTranscript: resultsFromPython.riassunto || "Elaborazione completata", // Idem
        fileType: fileTypeForDb,
        userId: userId,
      }
    });
    console.log(`Record Transcription ${newTranscription.id} creato in Prisma DB per ${userId}.`);

    return NextResponse.json({
        success: true,
        message: "Elaborazione completata!",
        // Passiamo l'intero oggetto dei risultati formattati dal BE
        results: resultsFromPython 
    });

  } catch (error) {
    console.error(`Errore API process-transcription per user ${userId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Errore generico';
    return NextResponse.json({ error: `Errore interno del server: ${errorMessage}` }, { status: 500 });
  }
}