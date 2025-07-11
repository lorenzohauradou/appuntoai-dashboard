import { useState, useRef } from 'react';
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
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const resetState = () => {
        setCurrentPhase('idle');
        setUploadProgress(0);
        setJobProgress(0);
        setJobMessage("");
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };

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
    };

    const startJobPolling = async (jobId: string) => {
        console.log(`Avvio polling per job: ${jobId}`);
        
        const checkJobStatus = async () => {
            try {
                const response = await fetch(`/api/job-status/${jobId}`);
                const jobStatus: JobStatus = await response.json();
                
                if (!response.ok) {
                    throw new Error(jobStatus.error || `Errore ${response.status}`);
                }
                
                console.log(`Job ${jobId} - Status: ${jobStatus.status}, Progress: ${jobStatus.progress}%`);
                
                setJobProgress(jobStatus.progress);
                setJobMessage(jobStatus.message);
                
                switch (jobStatus.status) {
                    case 'completed':
                        // Job completato con successo
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
                        // Job fallito
                        if (pollingIntervalRef.current) {
                            clearInterval(pollingIntervalRef.current);
                            pollingIntervalRef.current = null;
                        }
                        
                        toast.error("Elaborazione Fallita", { 
                            description: jobStatus.error || "Errore durante l'elaborazione." 
                        });
                        
                        setCurrentPhase('failed');
                        return false;
                        
                    case 'processing':
                    case 'pending':
                        // Job ancora in corso, continua il polling
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
                
                toast.error("Errore Controllo Stato", { 
                    description: error instanceof Error ? error.message : "Errore sconosciuto" 
                });
                
                setCurrentPhase('failed');
                return false;
            }
        };
        
        // Controllo immediato
        await checkJobStatus();
        
        // Avvia polling ogni 2 secondi
        pollingIntervalRef.current = setInterval(checkJobStatus, 2000);
    };

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
                
                console.log("Avvio elaborazione testo...");
                
            } else if (data instanceof File) {
                // Gestione file - prima upload, poi processing
                setCurrentPhase('gettingUrl');
                
                console.log("Ottenimento URL firmato...");
                
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
                
                console.log("Upload file in corso...");
                
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
                    
                    xhr.open('PUT', signedUrlData.signedUrl, true);
                    xhr.setRequestHeader('Content-Type', data.type);
                    xhr.send(data);
                });
                
                // 3. Prepara dati per processing
                requestData.file_path = signedUrlData.filePath;
                requestData.original_file_name = data.name;
                
                setCurrentPhase('processing');
            }
            
            console.log("Avvio job di elaborazione...");
            
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
                throw new Error("Job ID non ricevuto dal server");
            }
            
            console.log(`Job creato: ${jobId}`);
            
            toast.success("Elaborazione Avviata", { 
                description: "Il job è stato avviato. Monitoraggio in corso..." 
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
            
            return false;
        }
    };

    return {
        currentPhase,
        uploadProgress,
        jobProgress,
        jobMessage,
        startProcessing,
        resetUploaderState: resetState
    };
}
