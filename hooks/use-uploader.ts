import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ResultsType } from "@/components/dashboard/types";

type ProcessingPhase = 'idle' | 'gettingUrl' | 'uploading' | 'processing' | 'failed';
type ContentCategory = "Meeting" | "Lesson" | "Interview";

interface UploaderParams {
    onAnalysisComplete: (results: ResultsType) => void;
    formatApiResult: (result: any) => ResultsType | null;
}

interface JobStatus {
    job_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    message: string;
    result?: any;
    error?: string;
}

export function useUploader({ onAnalysisComplete, formatApiResult }: UploaderParams) {
    const [currentPhase, setCurrentPhase] = useState<ProcessingPhase>('idle');
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [jobProgress, setJobProgress] = useState<number>(0);
    const [jobMessage, setJobMessage] = useState<string>("");
    const [isUploadBlocked, setIsUploadBlocked] = useState<boolean>(false);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Gestore per avvisare l'utente se prova a chiudere la pagina durante l'upload
    const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
        if (isUploadBlocked) {
            e.preventDefault();
            e.returnValue = 'Upload in corso. Se chiudi questa pagina, l\'upload verrà interrotto e dovrai ricominciare.';
        }
    }, [isUploadBlocked]);

    // Effetto per gestire il listener beforeunload
    useEffect(() => {
        if (isUploadBlocked) {
            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [isUploadBlocked, handleBeforeUnload]);

    const resetState = useCallback(() => {
        setCurrentPhase('idle');
        setUploadProgress(0);
        setJobProgress(0);
        setJobMessage("");
        setIsUploadBlocked(false);
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, []);

    const handleApiError = (response: Response, result: any) => {
        if (response.status === 403 && result.error === "LIMIT_REACHED") {
            toast.error("Limite Raggiunto", { 
                description: result.message || "Analisi gratuite esaurite.", 
                duration: 9000 
            });
            if (result.checkoutUrl) {
                window.location.href = result.checkoutUrl;
            } else {
                toast.error("Errore Upgrade", { description: "Contatta supporto." });
            }
        } else {
            toast.error("Errore Elaborazione", { 
                description: result.detail || result.error || result.message || "Errore imprevisto." 
            });
        }
        setCurrentPhase('failed');
        setUploadProgress(0);
        setJobProgress(0);
        setIsUploadBlocked(false);
    };

    const startJobPolling = useCallback(async (jobId: string) => {
        const checkJobStatus = async () => {
            try {
                const response = await fetch(`/api/job-status/${jobId}`);
                const jobStatus: JobStatus = await response.json();
                
                if (!response.ok) {
                    throw new Error(jobStatus.error || `Errore ${response.status}`);
                }
                
                setJobProgress(jobStatus.progress);
                setJobMessage(jobStatus.message);
                
                switch (jobStatus.status) {
                    case 'completed':
                        if (pollingIntervalRef.current) {
                            clearInterval(pollingIntervalRef.current);
                            pollingIntervalRef.current = null;
                        }
                        
                        toast.success("Elaborazione Completata!", { 
                            description: "L'analisi è stata completata con successo." 
                        });
                        
                        if (jobStatus.result) {
                            const formatted = formatApiResult(jobStatus.result);
                            if (formatted) {
                                onAnalysisComplete(formatted);
                            } else {
                                throw new Error("Errore nella formattazione del risultato");
                            }
                        } else {
                            throw new Error("Risultato dell'analisi non disponibile");
                        }
                        
                        resetState();
                        return true;
                        
                    case 'failed':
                        if (pollingIntervalRef.current) {
                            clearInterval(pollingIntervalRef.current);
                            pollingIntervalRef.current = null;
                        }
                        
                        toast.error("Elaborazione Fallita", { 
                            description: jobStatus.error || "Errore durante l'elaborazione." 
                        });
                        
                        setCurrentPhase('failed');
                        setIsUploadBlocked(false);
                        return false;
                        
                    case 'processing':
                    case 'pending':
                        break;
                        
                    default:
                        console.warn(`Stato job sconosciuto: ${jobStatus.status}`);
                }
                
            } catch (error) {
                console.error("Errore durante il controllo dello stato del job:", error);
                
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                }
                
                toast.error("Errore Elaborazione", { 
                    description: error instanceof Error ? error.message : "Errore sconosciuto" 
                });
                
                setCurrentPhase('failed');
                setIsUploadBlocked(false);
                return false;
            }
        };
        
        // Controllo immediato
        await checkJobStatus();
        
        // Avvia polling ogni 2 secondi
        pollingIntervalRef.current = setInterval(checkJobStatus, 2000);
    }, [formatApiResult, onAnalysisComplete, resetState]);

    const startProcessing = async (
        data: File | string,
        category: ContentCategory,
        type: 'video' | 'audio' | 'text'
    ) => {
        resetState();

        try {
            let requestData: any = {
                content_type: category.toLowerCase(),
            };

            // Gestione testo
            if (typeof data === 'string') {
                requestData.text_content = data;
                setCurrentPhase('processing');
                
            } else if (data instanceof File) {
                // Gestione file - prima upload, poi processing
                setCurrentPhase('gettingUrl');
                
                // Blocca la navigazione durante l'upload
                setIsUploadBlocked(true);
                
                // Mostra avviso importante
                toast.warning("Upload in corso", {
                    description: "Non chiudere questa pagina durante l'upload. L'operazione potrebbe richiedere diversi minuti.",
                    duration: 8000,
                });
                
                // 1. Ottieni URL firmato
                const urlResponse = await fetch('/api/generate-upload-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        fileName: data.name, 
                        contentType: data.type 
                    }),
                });
                
                if (!urlResponse.ok) {
                    const error = await urlResponse.json();
                    throw new Error(error.error || 'Errore generazione URL upload');
                }
                
                const signedUrlData = await urlResponse.json();
                
                if (!signedUrlData?.signedUrl || !signedUrlData?.filePath) {
                    throw new Error("Dati URL firmato non validi");
                }
                
                // 2. Upload file
                setCurrentPhase('uploading');
                
                await new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    
                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const progress = Math.round((event.loaded / event.total) * 100);
                            setUploadProgress(progress);
                        }
                    };
                    
                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            setUploadProgress(100);
                            resolve();
                        } else {
                            reject(new Error(`Upload fallito: Status ${xhr.status}`));
                        }
                    };
                    
                    xhr.onerror = () => {
                        reject(new Error('Errore di rete durante l\'upload'));
                    };
                    
                    xhr.ontimeout = () => {
                        reject(new Error('Timeout durante l\'upload'));
                    };
                    
                    xhr.open('PUT', signedUrlData.signedUrl, true);
                    xhr.setRequestHeader('Content-Type', data.type);
                    xhr.send(data);
                });
                
                // 3. Prepara dati per processing
                requestData.file_path = signedUrlData.filePath;
                requestData.original_file_name = data.name;
                
                setCurrentPhase('processing');
                
                // Upload completato, ora l'utente può navigare
                setIsUploadBlocked(false);
                
                toast.success("Upload completato!", {
                    description: "File caricato con successo. Elaborazione in corso...",
                    duration: 3000,
                });
            }
            
            // Avvia il job di elaborazione
            const jobResponse = await fetch('/api/process-transcription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });
            
            const jobResult = await jobResponse.json();
            
            if (!jobResponse.ok) {
                handleApiError(jobResponse, jobResult);
                return false;
            }
            
            // Ottieni job_id e avvia polling
            const jobId = jobResult.job_id;
            if (!jobId) {
                throw new Error("Impossibile avviare l'elaborazione");
            }
            
            toast.success("Elaborazione Avviata", { 
                description: "L'elaborazione è stata avviata. Sarà completata in pochi secondi." 
            });
            
            // Avvia polling dello stato
            return await startJobPolling(jobId);
            
        } catch (error) {
            console.error("Errore durante l'avvio dell'elaborazione:", error);
            
            const message = error instanceof Error ? error.message : "Errore sconosciuto";
            toast.error("Errore", { description: message });
            
            setCurrentPhase('failed');
            setUploadProgress(0);
            setJobProgress(0);
            setIsUploadBlocked(false);
            
            return false;
        }
    };

    return {
        currentPhase,
        uploadProgress,
        jobProgress,
        jobMessage,
        isUploadBlocked,
        startProcessing,
        resetUploaderState: resetState
    };
}
