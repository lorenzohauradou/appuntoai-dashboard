import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripeInstance } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { FileType } from '@prisma/client';

const FREE_TRANSCRIPTION_LIMIT = 2; // limite gratis

// Funzione helper per creare URL Checkout Stripe per l'upgrade
async function createUpgradeCheckoutUrl(userId: string, userEmail: string | null | undefined, plan: 'pro' | 'business' = 'pro'): Promise<string | null> {
  const stripe = getStripeInstance();
  const PRICE_IDS = {
    pro: process.env.STRIPE_PRO_PRICE_ID,
    business: process.env.STRIPE_BUSINESS_PRICE_ID,
  };
  const priceId = PRICE_IDS[plan];

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
  console.log(`API /process-transcription: Richiesta da user ${userId}`);

  // LOGICA ESTRAZIONE DATI (Solo JSON)
  let requestPayload: {
      text?: string;              // Per testo diretto
      filePath?: string;          // Per file uploadato su storage
      originalFileName?: string; // Necessario se c'è filePath
      category: string;         // Categoria (meeting, lesson, interview) - lowercase
      type: string;             // Tipo originale (video, audio, text)
  };

  try {
    // Aspettiamo JSON
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
       throw new Error(`Content-Type non supportato: ${contentType}. Atteso application/json.`);
    }

    requestPayload = await req.json();
    console.log("API /process-transcription: Payload ricevuto:", requestPayload);


    // Validazione payload
    if (!requestPayload.category || !requestPayload.type) {
        throw new Error("Campi 'category' o 'type' mancanti nel payload.");
    }
    requestPayload.category = requestPayload.category.toLowerCase(); // Assicura lowercase

    if (!requestPayload.text && !requestPayload.filePath) {
       throw new Error("Né 'text' né 'filePath' forniti nel payload.");
    }
    if (requestPayload.filePath && !requestPayload.originalFileName) {
       throw new Error("'originalFileName' è richiesto quando si fornisce 'filePath'.");
    }
    if (!["meeting", "lesson", "interview"].includes(requestPayload.category)) {
       throw new Error(`Categoria non valida: ${requestPayload.category}.`);
    }

  } catch (e) {
     const errorMessage = e instanceof Error ? e.message : 'Errore sconosciuto';
     console.error("Errore lettura/validazione body request JSON:", errorMessage);
     return NextResponse.json({ error: `Dati richiesta non validi: ${errorMessage}` }, { status: 400 });
  }

  // Determina il fileType per il DB Prisma basato sul 'type' ricevuto
  let fileTypeForDb: FileType;
  switch(requestPayload.type) {
      case 'video': fileTypeForDb = FileType.video; break;
      case 'audio': fileTypeForDb = FileType.audio; break;
      case 'text': fileTypeForDb = FileType.testo; break;
      default:
          console.warn(`Tipo file non riconosciuto: ${requestPayload.type}, imposto audio di default.`);
          fileTypeForDb = FileType.audio; // Fallback sicuro? O errore? Meglio errore forse
          return NextResponse.json({ error: `Tipo file non valido: ${requestPayload.type}` }, { status: 400 });
  }

  const originalFileName = requestPayload.originalFileName || (requestPayload.text ? "Testo Incollato" : "File Sconosciuto");

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
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); 

      // Conta le trascrizioni create dall'utente da inizio mese
      const transcriptionsThisMonth = await prisma.transcription.count({
        where: {
          userId: userId,
          createdAt: {
            gte: startOfMonth,
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

    // Prepara il payload JSON per Python
    const pythonPayload: any = {
        user_id: userId,
        content_type: requestPayload.category, // Inoltra categoria
    };

    // Aggiungi 'filePath' o 'text' al payload per Python
    if (requestPayload.filePath) {
        pythonPayload.file_path = requestPayload.filePath; // Python dovrà gestire questo
        pythonPayload.original_file_name = requestPayload.originalFileName; // Invia anche nome originale
        console.log("Invio a Python: filePath, original_file_name, content_type, user_id");
    } else if (requestPayload.text) {
        pythonPayload.text_content = requestPayload.text; // Python dovrà gestire questo
         console.log("Invio a Python: text_content, content_type, user_id");
    } else {
        // Questo non dovrebbe accadere per la validazione precedente, ma per sicurezza
        throw new Error("Dati input mancanti per Python (né filePath né text).");
    }

    // Esegui fetch a Python inviando JSON
    const pythonResponse = await fetch(`${pythonBackendUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Ora inviamo JSON
        body: JSON.stringify(pythonPayload),
    });

    console.log(`Risposta da Python: ${pythonResponse.status}`);

    // Gestione risposta Python
    if (!pythonResponse.ok) {
      let errorDetail = `Errore ${pythonResponse.status} dal servizio Python.`; // Messaggio default
      let fullErrorJson = null; // Per loggare l'errore completo
      try {
         // Prova a parsare la risposta JSON completa
         fullErrorJson = await pythonResponse.json(); 
         // Estrai il dettaglio se esiste e è una stringa, altrimenti usa un messaggio generico
         if (fullErrorJson && typeof fullErrorJson.detail === 'string') {
             errorDetail = fullErrorJson.detail;
         } else if (fullErrorJson && Array.isArray(fullErrorJson.detail)) {
             // Se detail è un array (comune per errori validazione FastAPI), prova a formattarlo
             try {
                errorDetail = fullErrorJson.detail.map((err: any) => 
                    `${err.loc?.join('.') || 'campo'}: ${err.msg}`
                ).join('; ');
             } catch(formatErr) {
                 errorDetail = "Errore di validazione dettagliato ricevuto da Python.";
             }
         } else {
              errorDetail = `Errore ${pythonResponse.status} da Python (dettaglio non disponibile o non stringa).`;
         }
      } catch (e) { 
          // Se il parsing JSON fallisce, prova a leggere come testo
          try {
             errorDetail = await pythonResponse.text(); 
          } catch(textErr) {
              errorDetail = `Errore ${pythonResponse.status} da Python (risposta non leggibile).`;
          }
      }
      // Logga sia il dettaglio estratto/formattato SIA l'oggetto JSON completo (se disponibile)
      console.error(`Errore da Python (${pythonResponse.status}): ${errorDetail}`); 
      if (fullErrorJson) {
         console.error("JSON completo dell'errore da Python:", JSON.stringify(fullErrorJson, null, 2)); 
      }
      // Lancia l'errore con il messaggio estratto/formattato
      throw new Error(`Errore elaborazione Python (${pythonResponse.status}): ${errorDetail}`); 
    }

    // Estrai risultati COMPLETI da Python
    const resultsFromPython = await pythonResponse.json();
    // Assicurati che Python restituisca ancora 'transcript_id' nel suo JSON
    if (!resultsFromPython.transcript_id) {
        console.error("Risposta da Python non contiene 'transcript_id':", resultsFromPython);
        throw new Error("Risposta dal servizio di elaborazione incompleta (manca transcript_id).");
    }
    console.log(`Elaborazione Python completata con successo per ${userId}. Transcript ID: ${resultsFromPython.transcript_id}`);

    // 5. CREA O AGGIORNA RECORD Transcription NEL DB PRISMA (per tracciare l'uso)
    const titleToSave = `${requestPayload.category.charAt(0).toUpperCase() + requestPayload.category.slice(1)} - ${originalFileName}`;

    // Prepara i dati per la creazione o l'aggiornamento
    const dataToUpsert = {
      id: resultsFromPython.transcript_id, // Usa l'ID da Python
      title: titleToSave.substring(0, 191), // Limita per DB
      transcript: resultsFromPython.riassunto || "Elaborazione completata", // Salva riassunto o placeholder
      cleanedTranscript: resultsFromPython.riassunto || "Elaborazione completata", // Idem
      fileType: fileTypeForDb,
      userId: userId,
    };

    // Usa upsert: cerca per ID, se esiste aggiorna, altrimenti crea.
    const upsertedTranscription = await prisma.transcription.upsert({
      where: {
        id: resultsFromPython.transcript_id, // Criterio di ricerca
      },
      update: dataToUpsert, // Dati da usare se il record esiste
      create: dataToUpsert, // Dati da usare se il record NON esiste
    });
    console.log(`Record Transcription ${upsertedTranscription.id} creato/aggiornato in Prisma DB per ${userId}.`);

    return NextResponse.json({
        success: true,
        message: "Elaborazione completata!",
        results: resultsFromPython
    });

  } catch (error) {
    console.error(`Errore API process-transcription per user ${userId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Errore generico';
    return NextResponse.json({ error: `Errore interno del server: ${errorMessage}` }, { status: 500 });
  }
}