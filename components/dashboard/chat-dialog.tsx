"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MessageSquare, 
  Send,
  User,
  Bot,
  FileQuestion,
  Loader2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transcriptId: string;
  suggestedQuestions: string[];
}

export function ChatDialog({ 
  open, 
  onOpenChange, 
  transcriptId, 
  suggestedQuestions 
}: ChatDialogProps) {
  const [chatId, setChatId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [sources, setSources] = useState<string[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Effetto per caricare la cronologia chat quando il dialogo viene aperto
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (open && transcriptId) {
        setIsLoadingHistory(true);
        try {
          // API route GET per recuperare la cronologia
          const historyResponse = await fetch(`/api/chat/history/${transcriptId}`, {
            method: "GET",
            headers: {
              'Accept': 'application/json' 
            }
          });

          console.log("History fetch response:", historyResponse);

          // Controlla se la richiesta all'API route è andata a buon fine
          if (!historyResponse.ok) { 
             let errorData = { detail: `Errore HTTP: ${historyResponse.status}` };
             try {
                // Prova a leggere il corpo dell'errore restituito dall'API route
                errorData = await historyResponse.json();
             } catch (e) { 
                // Se il corpo non è JSON, usa lo status text
                errorData.detail = historyResponse.statusText || errorData.detail;
             } 
             // Lancia un errore che verrà catturato dal blocco catch
             throw new Error(errorData.detail || `Errore ${historyResponse.status} nel recupero cronologia`);
          }

          // Leggi il corpo JSON solo se la risposta è ok
          const historyData = await historyResponse.json(); 

          console.log("Parsed history data:", historyData);
          
          // La route restituisce { messages: [], ... } se non c'è storia
          if (historyData && historyData.messages && historyData.messages.length > 0) {
            setMessages(historyData.messages);
            setChatId(historyData.chat_id); // Assicurati che chat_id sia nel payload
            setSources(historyData.sources || []);
          } else {
            // Inizializza chat vuota se non ci sono messaggi
            setMessages([]);
            setChatId(undefined);
            setSources([]);
          }
        } catch (error: any) { // Tipizza error
          console.error("Errore nel recupero della cronologia chat:", error.message);
          setMessages([]); // Resetta stato in caso di errore
          setChatId(undefined);
          setSources([]);
          // TODO: Mostrare un messaggio di errore all'utente nella UI?
        } finally {
          setIsLoadingHistory(false);
          // Scrolla in fondo dopo il caricamento (anche se vuoto)
          setTimeout(scrollToBottom, 100); 
        }
      }
    };

    fetchChatHistory();
  }, [open, transcriptId]);

  useEffect(() => {
    // Usa un timeout per assicurarsi che il rendering sia completato
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setIsLoading(true);

    // Aggiungi il messaggio dell'utente
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    try {
      // const response = await sendChatMessage(transcriptId, userMessage, chatId);
      const response = await fetch("/api/send-chat-message", {
        method: "POST",
        body: JSON.stringify({ transcriptId, message: userMessage, chatId })
      });

      const responseData = await response.json();

      console.log(responseData);
      
      
      // Aggiorna chatId se è la prima risposta
      if (!chatId) {
        setChatId(responseData.chat_id);
      }
      
      // Aggiungi il messaggio dell'assistente
      setMessages(prev => [...prev, { role: "assistant", content: responseData.response }]);
      
      // Aggiorna le fonti
      setSources(responseData.sources || []);
    } catch (error) {
      console.error("Errore nell'invio del messaggio:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Mi dispiace, si è verificato un errore. Riprova più tardi." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Invia messaggio quando si preme Enter (senza Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    handleSend();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat con il documento
          </DialogTitle>
          <DialogDescription>
            Fai domande sul documento analizzato e ricevi risposte specifiche.
          </DialogDescription>
        </DialogHeader>
        
        {/* Container principale dei messaggi con scrolling nativo */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-6 py-4"
          style={{ 
            height: "calc(60vh - 4rem)", 
            scrollBehavior: "smooth",
            overscrollBehavior: "contain"
          }}
        >
          {isLoadingHistory ? (
            <div className="py-4 text-center text-muted-foreground h-full flex flex-col justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Caricamento della cronologia chat...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground h-full flex flex-col justify-center">
              <p className="mb-6">Inizia facendo una domanda sul documento</p>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {suggestedQuestions.map((question, i) => (
                  <Button 
                    key={i} 
                    variant="outline" 
                    className="justify-start text-left h-auto py-2 hover:text-primary"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    <FileQuestion className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-2">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, i) => (
                <div 
                  key={i} 
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`flex gap-2 max-w-[80%] ${message.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                    } p-3 rounded-lg`}
                  >
                    {message.role === "user" ? (
                      <User className="h-5 w-5 flex-shrink-0 mt-1" />
                    ) : (
                      <Bot className="h-5 w-5 flex-shrink-0 mt-1" />
                    )}
                    <div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Sezione fonti in basso */}
        {sources.length > 0 && (
          <div className="px-6 py-2 border-t border-border/30">
            <Card className="border-primary/20">
              <CardContent className="p-3">
                <p className="text-sm font-medium mb-2">Fonti:</p>
                <div className="text-xs text-muted-foreground space-y-1 max-h-[80px] overflow-y-auto">
                  {sources.map((source, i) => (
                    <p key={i} className="line-clamp-1">{source}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Input sempre in basso */}
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex gap-2">
            <Input
              placeholder="Scrivi un messaggio..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || isLoadingHistory}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading || isLoadingHistory}
              className="h-10 w-10 p-2 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}