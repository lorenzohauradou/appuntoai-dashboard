import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripeInstance } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { FileType } from '@prisma/client';

const FREE_TRANSCRIPTION_LIMIT = 3; // limite gratis

// Funzione helper per creare URL Checkout Stripe per l'upgrade
async function createUpgradeCheckoutUrl(userId: string, userEmail: string | null | undefined, plan: 'pro' | 'business' = 'pro'): Promise<string | null> {
  const stripe = getStripeInstance(); // Ottieni l'istanza Stripe qui
  const PRICE_IDS = {
    pro: process.env.STRIPE_PRO_PRICE_ID, // DEVI aggiungere questi ID al tuo .env.local / Vercel
    business: process.env.STRIPE_BUSINESS_PRICE_ID,
  };
  const priceId = PRICE_IDS[plan];

  if (!priceId) {
    console.error(`ID Prezzo Stripe per il piano '${plan}' non trovato nelle variabili d'ambiente.`);
    // Considera di lanciare un errore o restituire un URL di fallback alla pagina prezzi
    return null;
  }

  // Assicurati che NEXT_PUBLIC_APP_URL sia definito in .env.local / Vercel
  const DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
      success_url: `${DOMAIN}/dashboard?upgraded=true`, // Pagina successo dopo upgrade
      cancel_url: `${DOMAIN}/dashboard?canceled_upgrade=true`, // Pagina se annulla upgrade
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
    // In caso di errore nella creazione sessione, ritorna null
    // Il frontend gestirà il messaggio d'errore generico
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

  // --- ESTRAI I DATI DAL BODY (ADATTA AL TUO CASO) ---
  // Questo dipenderà se invii FormData (file) o JSON (testo)
  // Qui ipotizziamo che arrivi qualcosa nel body, ma dovrai gestirlo
  // let fileData: File | null = null;
  // let textData: string | null = null;
  // let category: string = "Meeting"; // Default o estratto
  // try {
  //   const formData = await req.formData();
  //   fileData = formData.get('file') as File | null;
  //   category = formData.get('category') as string || "Meeting";
  //   if (!fileData) {
  //     // Prova a leggere come JSON se non è FormData
  //      const body = await req.json();
  //      textData = body.text;
  //      category = body.category || "Meeting";
  //   }
  // } catch (e) {
  //    console.error("Errore lettura body request:", e);
  //    return NextResponse.json({ error: "Dati richiesta non validi" }, { status: 400 });
  // }
   console.log(`Richiesta elaborazione da user ${userId}`); // Log inizio


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

    // 4. ESEGUI L'ELABORAZIONE REALE QUI
    //    (Chiama la tua API esterna, elabora il file/testo, ecc.)
    //    Questa è la parte "pesante".
    console.log(`Inizio elaborazione contenuto per ${userId}...`);
    // Esempio: Sostituisci con la tua logica asincrona
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simula lavoro
    const transcriptionText = "Questo è il testo trascritto..."; // Risultato fittizio
    const cleanedText = "Testo pulito..."; // Risultato fittizio
    const fileTypeToSave: FileType = 'audio'; // Adatta dinamicamente
    const titleToSave = `Trascrizione ${new Date().toLocaleDateString()}`; // Titolo esempio


    // 5. *DOPO* SUCCESSO ELABORAZIONE: Crea record nel DB
    // Questo registra l'uso e verrà contato al prossimo controllo limite
    const newTranscription = await prisma.transcription.create({
      data: {
        title: titleToSave, // Usa un titolo significativo
        transcript: transcriptionText,
        cleanedTranscript: cleanedText,
        fileType: fileTypeToSave, // Assicurati sia uno dei valori Enum
        userId: userId,
        // analisi e chat verranno collegate dopo, se necessario
      }
    });
    console.log(`Trascrizione ${newTranscription.id} creata per utente ${userId}`);


    // 6. Restituisci Successo al Frontend
    return NextResponse.json({
        success: true,
        message: "Elaborazione completata!",
        transcriptionId: newTranscription.id // Invia l'ID se utile al frontend
    });

  } catch (error) {
    console.error(`Errore API process-transcription per user ${userId}:`, error);
    // Errore generico per problemi interni
    return NextResponse.json({ error: "Errore interno del server durante l'elaborazione." }, { status: 500 });
  }
}