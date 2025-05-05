"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MessageSquare, 
  Send,
  User,
  Bot,
  FileQuestion,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Maximize,
  Minimize,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

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

  const [isSourcesExpanded, setIsSourcesExpanded] = useState(true);
  const [isSourcesDetailOpen, setIsSourcesDetailOpen] = useState(false);
  const [assistantResponseCount, setAssistantResponseCount] = useState(0);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (open && transcriptId) {
        setIsLoadingHistory(true);
        setMessages([]);
        setSources([]);
        setChatId(undefined);
        setIsSourcesExpanded(false);
        try {
          const historyResponse = await fetch(`/api/chat/history/${transcriptId}`);
          if (!historyResponse.ok) {
             let errorData = { detail: `Errore HTTP: ${historyResponse.status}` };
             try { errorData = await historyResponse.json(); } catch (e) { errorData.detail = historyResponse.statusText || errorData.detail; }
             throw new Error(errorData.detail || `Errore ${historyResponse.status} nel recupero cronologia`);
          }
          const historyData = await historyResponse.json();
          if (historyData && historyData.messages && historyData.messages.length > 0) {
            setMessages(historyData.messages);
            setChatId(historyData.chat_id);
            setSources(historyData.sources || []);
          }
        } catch (error: any) {
          console.error("Errore nel recupero della cronologia chat:", error.message);
        } finally {
          setIsLoadingHistory(false);
          setTimeout(scrollToBottom, 100);
        }
      }
    };
    fetchChatHistory();
  }, [open, transcriptId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  useEffect(() => {
    if (isSourcesExpanded && assistantResponseCount > 0) {
      const timer = setTimeout(() => {
        console.log("Auto-collapsing sources");
        setIsSourcesExpanded(false);
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [isSourcesExpanded, assistantResponseCount]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput("");
    setIsLoading(true);
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setSources([]);
    setIsSourcesExpanded(true);

    try {
      const response = await fetch("/api/send-chat-message", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcriptId, message: userMessage, chatId })
      });

      if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Errore sconosciuto'}));
          throw new Error(errorData.detail || `Errore ${response.status}`);
      }

      const responseData = await response.json();

      if (!chatId) { setChatId(responseData.chat_id); }

      setMessages(prev => [...prev, { role: "assistant", content: responseData.response }]);
      setSources(responseData.sources || []);
      setAssistantResponseCount(prev => prev + 1);

    } catch (error: any) {
      console.error("Errore nell'invio del messaggio:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Mi dispiace, si è verificato un errore: ${error.message || 'Riprova più tardi.'}`
      }]);
      setSources([]);
      setIsSourcesExpanded(false);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const toggleSourcesExpansion = () => {
    setIsSourcesExpanded(prev => !prev);
  };

  const openSourcesDetail = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsSourcesDetailOpen(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "flex flex-col p-0 gap-0 overflow-hidden transition-all duration-300 ease-in-out border",
        isFullscreen
          ? "w-screen h-screen max-w-screen max-h-screen rounded-none border-none"
          : "sm:max-w-[600px] max-h-[85vh] sm:rounded-lg"
       )}>
        <DialogHeader className="px-4 pt-4 pb-2 shrink-0 flex flex-row items-start justify-between">
            <div className="flex flex-col gap-1">
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                   Chat con il documento
                 </DialogTitle>
                 <DialogDescription className="text-sm text-muted-foreground">
                    Fai domande sul documento analizzato.
                 </DialogDescription>
            </div>
            <div className="flex items-center shrink-0">
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleFullscreen} 
                    className="h-8 w-8 mr-6"
                 >
                     {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                     <span className="sr-only">{isFullscreen ? "Riduci" : "Schermo intero"}</span>
                 </Button>
            </div>
         </DialogHeader>
         <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-6 py-4 min-h-[200px]"
        >
          {isLoadingHistory ? (
            <div className="py-4 text-center text-muted-foreground h-full flex flex-col justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Caricamento cronologia...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground h-full flex flex-col justify-center">
              <p className="mb-6">Inizia facendo una domanda o clicca un suggerimento:</p>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {suggestedQuestions.map((question, i) => (
                  <Button 
                    key={i} 
                    variant="outline"
                    className="justify-start text-left h-auto py-2 hover:bg-muted"
                    onClick={() => setInput(question)}
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
                    className={`flex gap-2 max-w-[85%] ${message.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                    } p-3 rounded-lg shadow-sm`}
                  >
                    {message.role === "user" ? (
                      <User className="h-5 w-5 flex-shrink-0 mt-1" />
                    ) : (
                      <Bot className="h-5 w-5 flex-shrink-0 mt-1" />
                    )}
                    <div>
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
               {isLoading && (
                 <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[80%] bg-muted p-3 rounded-lg shadow-sm animate-pulse">
                       <Bot className="h-5 w-5 flex-shrink-0 mt-1 text-muted-foreground" />
                       <div><p className="text-muted-foreground">...</p></div>
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>
        
        {sources.length > 0 && (
          <div className="px-6 py-2 border-t border-border/30 shrink-0">
            <Card className="border-primary/20 overflow-hidden shadow-sm">
              <CardHeader
                  className="flex flex-row items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={toggleSourcesExpansion}
              >
                  <p className="text-sm font-medium">Fonti ({sources.length})</p>
                  {isSourcesExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground"/> : <ChevronDown className="h-4 w-4 text-muted-foreground"/>}
              </CardHeader>

              {isSourcesExpanded && (
                 <CardContent className="p-3 border-t border-border/30 bg-muted/20">
                    <Button variant="ghost" size="sm" className="w-full mb-2 gap-2 justify-start text-xs text-muted-foreground hover:text-foreground" onClick={openSourcesDetail}>
                        <ExternalLink className="h-3 w-3"/>
                        Visualizza contenuto fonti
                    </Button>
                    <div className="text-xs text-muted-foreground space-y-1 max-h-[60px] overflow-y-auto">
                      {sources.map((source, i) => (
                        <p key={i} className="line-clamp-1" title={source}>{`Fonte #${i+1}: ${source}`}</p>
                      ))}
                    </div>
                 </CardContent>
              )}
            </Card>
          </div>
        )}
        
        <div className="p-4 border-t border-border mt-auto shrink-0">
          <div className="flex gap-2">
            <Input
              placeholder="Scrivi un messaggio..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || isLoadingHistory}
              className="flex-1 h-10"
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading || isLoadingHistory}
              className="h-10 w-10 p-0 flex items-center justify-center shrink-0"
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        <Sheet open={isSourcesDetailOpen} onOpenChange={setIsSourcesDetailOpen}>
             <SheetContent className="sm:max-w-lg w-[90vw] flex flex-col">
                 <SheetHeader>
                     <SheetTitle>Dettaglio Fonti Utilizzate</SheetTitle>
                     <SheetDescription>
                         Contenuto specifico estratto dal documento per generare l'ultima risposta.
                     </SheetDescription>
                 </SheetHeader>
                 <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-6">
                     {sources.length > 0 ? (
                         sources.map((source, index) => (
                             <div key={index} className="p-4 border rounded-md bg-muted/50">
                                 <p className="text-sm font-semibold mb-2 text-primary">Fonte #{index + 1}</p>
                                 <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words"> 
                                    {source || "Contenuto fonte non disponibile."} 
                                 </p>
                             </div>
                         ))
                     ) : (
                         <p className="text-center text-muted-foreground py-10">Nessuna fonte disponibile per l'ultima risposta.</p>
                     )}
                 </div>
                  <SheetClose asChild className="mt-auto shrink-0">
                     <Button type="button" variant="outline">Chiudi</Button>
                  </SheetClose>
             </SheetContent>
         </Sheet>

      </DialogContent>
    </Dialog>
  )
}