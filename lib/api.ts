export async function analyzeMeeting(file: File, category?: string) {
    const formData = new FormData();
    formData.append('file', file);

    // mappa categorie frontend a quelle backend
    const categoryMap: { [key: string]: string } = {
      "Meeting": "Meeting",
      "Lezione": "Lesson",       // <-- Mappatura
      "Intervista": "Interview" // <-- Mappatura
    };

    // aggiungi categoria mappata al FormData usando la chiave 'content_type'
    if (category && categoryMap[category]) {
      const backendCategory = categoryMap[category];
      formData.append('content_type', backendCategory);
      console.log(`Mapping frontend category '${category}' to backend category '${backendCategory}'`);
    } else if (category) {
      // se la cat non in map: originale o errore
      console.warn(`Categoria frontend '${category}' non trovata nella mappa, invio originale.`);
      formData.append('content_type', category); 
    }

    try {
      console.log("Inizio richiesta al backend con file e categoria (come content_type):");
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });
      console.log("Risposta ricevuta:", response);
  
      if (!response.ok) {
        let errorDetail = "Errore sconosciuto durante l'analisi";
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || JSON.stringify(errorData);
        } catch (jsonError) {
            // Se non riusciamo a leggere il JSON, usiamo il testo della risposta
            errorDetail = await response.text();
        } 
        throw new Error(errorDetail);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Errore API analyzeMeeting:', error);
      throw error;
    }
  }
// chat
export async function sendChatMessage(transcriptId: string, message: string, chatId?: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORKER_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript_id: transcriptId,
        message,
        chat_id: chatId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Errore durante la chat");
    }

    return await response.json();
  } catch (error) {
    console.error('Errore chat:', error);
    throw error;
  }
}

// Funzione per recuperare la cronologia delle analisi
export async function getAnalysisHistory() {
  try {
    // Assicurati che l'URL corrisponda al tuo endpoint backend
    const response = await fetch('http://localhost:8000/analyses/history', {
      method: 'GET',
      // Aggiungi headers se necessario (es. per autenticazione)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Errore durante il recupero della cronologia");
    }

    return await response.json(); 
  } catch (error) {
    console.error('Errore API getAnalysisHistory:', error);
    throw error;
  }
}

// Funzione per recuperare la cronologia di una chat specifica
export async function getChatHistory(transcriptId: string) {
  try {
    // Assicurati che l'URL corrisponda al tuo endpoint backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORKER_URL}/chat/history/${transcriptId}`, {
      method: 'GET',
      // Aggiungi headers se necessario (es. per autenticazione)
    });

    if (!response.ok) {
      // Se non trova la cronologia (404), non è un errore bloccante, restituisce null
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json();
      throw new Error(errorData.detail || "Errore durante il recupero della cronologia chat");
    }

    return await response.json(); 
  } catch (error) {
    console.error(`Errore API getChatHistory per ${transcriptId}:`, error);
    throw error;
  }
}

// Funzione per eliminare un'analisi
export const deleteAnalysis = async (transcriptId: string): Promise<void> => {
  try {
    const response = await fetch(`http://localhost:8000/analyses/${transcriptId}`, { 
      method: 'DELETE',
    });

    if (!response.ok) {
      // Se lo status code non è 204 No Content o un altro successo (es. 200 OK, 202 Accepted)
      if (response.status === 404) {
         console.warn(`Analisi con ID ${transcriptId} non trovata sul server.`);
         // Potresti voler gestire questo caso specificamente, ma per ora lanciamo un errore generico
      }
      const errorData = await response.json().catch(() => ({ detail: "Errore sconosciuto durante l'eliminazione" }));
      throw new Error(errorData.detail || `Errore ${response.status} durante l'eliminazione`);
    }

    // Non ci aspettiamo un body per una risposta 204 No Content
    console.log(`Analisi con ID ${transcriptId} eliminata con successo.`);

  } catch (error) {
    console.error("Errore API durante l'eliminazione dell'analisi:", error);
    throw error; // Rilancia l'errore per gestirlo nel chiamante (Dashboard)
  }
};