import { useState } from 'react';
import { toast } from 'sonner';
import { ResultsType } from "@/components/dashboard/types"; // Assicurati che il percorso sia corretto

type ProcessingPhase = 'idle' | 'gettingUrl' | 'uploading' | 'processing' | 'failed';
type ContentCategory = "Meeting" | "Lesson" | "Interview"; // Mantieni coerenza con il componente

interface UploaderParams {
    onAnalysisComplete: (results: ResultsType) => void;
    formatApiResult: (result: any) => ResultsType | null;
}

export function useUploader({ onAnalysisComplete, formatApiResult }: UploaderParams) {
    const [currentPhase, setCurrentPhase] = useState<ProcessingPhase>('idle');
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const resetState = () => {
        setCurrentPhase('idle');
        setUploadProgress(0);
    };

    // Funzione helper per gestire errori API (simile a quella nel componente)
    const handleApiError = (response: Response, result: any) => {
        // ... (stessa logica di handleApiError che avevi nel componente) ...
        if (response.status === 403 && result.error === "LIMIT_REACHED") {
            toast.error("Limite Raggiunto", { description: result.message || "Analisi gratuite esaurite.", duration: 9000 });
            if (result.checkoutUrl) window.location.href = result.checkoutUrl;
            else toast.error("Errore Upgrade", { description: "Contatta supporto." });
        } else {
            toast.error("Errore Elaborazione", { description: result.error || result.message || "Errore imprevisto." });
        }
        setCurrentPhase('failed'); // Imposta stato fallito
        setUploadProgress(0); // Resetta progresso
    };


    // --- LOGICA DI UPLOAD E PROCESSING ---
    const startProcessing = async (
        data: File | string, // File o testo
        category: ContentCategory,
        type: 'video' | 'audio' | 'text' // Tipo tab attiva
    ) => {
        resetState(); // Resetta stato all'inizio

        // --- Gestione Testo ---
        if (typeof data === 'string') {
            setCurrentPhase('processing');
            try {
                const response = await fetch('/api/process-transcription', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: data, category: category.toLowerCase(), type: 'text' }),
                });
                const result = await response.json();
                if (response.ok) {
                    toast.success("Successo!", { description: result.message || "Testo elaborato." });
                    const formatted = formatApiResult(result.results);
                    if (formatted) onAnalysisComplete(formatted); else throw new Error("Formattazione fallita");
                    resetState(); // Torna a idle dopo successo
                    return true; // Indica successo
                } else {
                    handleApiError(response, result);
                    return false; // Indica fallimento
                }
            } catch (error) {
                console.error("Errore elaborazione testo:", error);
                toast.error("Errore Elaborazione Testo", { description: "Impossibile elaborare il testo." });
                setCurrentPhase('failed');
                return false;
            }
        }

        // --- Gestione File ---
        if (data instanceof File) {
            const fileToUpload = data;
            let signedUrlData: { signedUrl: string; filePath: string } | null = null;

            try {
                // 1. Get Signed URL
                setCurrentPhase('gettingUrl');
                const urlResponse = await fetch('/api/generate-upload-url', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileName: fileToUpload.name, contentType: fileToUpload.type }),
                });
                if (!urlResponse.ok) { const e = await urlResponse.json(); throw new Error(e.error || 'Errore URL upload'); }
                signedUrlData = await urlResponse.json();
                if (!signedUrlData?.signedUrl || !signedUrlData?.filePath) throw new Error("Dati URL firmato non validi.");

                // 2. Upload to Supabase via XHR
                setCurrentPhase('uploading');
                await new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.upload.onprogress = (event) => { if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100)); };
                    xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) { setUploadProgress(100); resolve(); } else { reject(new Error(`Upload fallito: Status ${xhr.status}`)); }};
                    xhr.onerror = () => { reject(new Error('Errore di rete upload.')); };
                    xhr.open('PUT', signedUrlData!.signedUrl, true);
                    xhr.setRequestHeader('Content-Type', fileToUpload.type);
                    xhr.send(fileToUpload);
                });

                // 3. Call Process API
                setCurrentPhase('processing');
                setUploadProgress(0); // Resetta progress per fase processing
                const processResponse = await fetch('/api/process-transcription', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filePath: signedUrlData.filePath, originalFileName: fileToUpload.name,
                        category: category.toLowerCase(), type: type,
                    }),
                });
                const processResult = await processResponse.json();
                if (processResponse.ok) {
                    toast.success("Successo!", { description: processResult.message || "File elaborato." });
                    const formatted = formatApiResult(processResult.results);
                    if (formatted) onAnalysisComplete(formatted); else throw new Error("Formattazione fallita");
                    resetState(); // Torna a idle dopo successo
                    return true; // Indica successo
                } else {
                    handleApiError(processResponse, processResult);
                    return false; // Indica fallimento
                }

            } catch (error) {
                console.error("Errore upload/elaborazione file:", error);
                const message = error instanceof Error ? error.message : "Errore sconosciuto";
                toast.error("Errore", { description: message });
                setCurrentPhase('failed');
                setUploadProgress(0);
                return false; // Indica fallimento
            }
        }

         // Se non è né stringa né File (non dovrebbe accadere)
         toast.error("Errore Interno", { description: "Tipo di dato non valido per l'upload." });
         setCurrentPhase('failed');
         return false;
    };

    return {
        currentPhase,
        uploadProgress,
        startProcessing,
        resetUploaderState: resetState // Esponi funzione per resettare esternamente se necessario
    };
}
