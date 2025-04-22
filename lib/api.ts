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
    const response = await fetch('http://localhost:8000/chat', {
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