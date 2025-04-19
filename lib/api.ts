export async function analyzeMeeting(file: File) {
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      console.log("Inizio richiesta al backend");
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });
      console.log("Risposta ricevuta:", response);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Errore durante l'analisi");
      }
  
      return await response.json();
    } catch (error) {
      console.error('Errore:', error);
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