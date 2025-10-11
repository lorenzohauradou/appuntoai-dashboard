export async function POST(request: Request) {
    
// export async function sendChatMessage(transcriptId: string, message: string, chatId?: string) {
    try {
      const { transcriptId, message, chatId } = await request.json();
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
  
      return new Response(JSON.stringify(await response.json()), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Errore chat:', error);
      throw error;
    }
  }