export function StructuredData() {
    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": "https://www.appuntoai.com/#website",
                "url": "https://www.appuntoai.com",
                "name": "AppuntoAI",
                "description": "Trasforma lezioni e riunioni in appunti strutturati con intelligenza artificiale",
                "publisher": {
                    "@id": "https://www.appuntoai.com/#organization"
                },
                "inLanguage": "it-IT"
            },
            {
                "@type": "Organization",
                "@id": "https://www.appuntoai.com/#organization",
                "name": "AppuntoAI",
                "url": "https://www.appuntoai.com",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.appuntoai.com/appuntoai_logo.png",
                    "width": 512,
                    "height": 512
                },
                "sameAs": [
                    "https://twitter.com/appuntoai"
                ]
            },
            {
                "@type": "WebPage",
                "@id": "https://www.appuntoai.com/#webpage",
                "url": "https://www.appuntoai.com",
                "name": "AppuntoAI - Appunti Automatici con Intelligenza Artificiale",
                "isPartOf": {
                    "@id": "https://www.appuntoai.com/#website"
                },
                "about": {
                    "@id": "https://www.appuntoai.com/#organization"
                },
                "description": "Trasforma lezioni, riunioni e video in appunti strutturati con AI. Trascrizione automatica, riassunti intelligenti e quiz personalizzati.",
                "inLanguage": "it-IT"
            },
            {
                "@type": "SoftwareApplication",
                "name": "AppuntoAI",
                "applicationCategory": "EducationalApplication",
                "operatingSystem": "Web",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "EUR"
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "ratingCount": "150"
                },
                "description": "Intelligenza artificiale per trasformare audio e video in appunti strutturati, riassunti e quiz interattivi",
                "featureList": [
                    "Trascrizione automatica",
                    "Riassunti intelligenti",
                    "Quiz personalizzati",
                    "Chat con documenti",
                    "Analisi lezioni"
                ]
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Come funziona AppuntoAI?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "AppuntoAI utilizza l'intelligenza artificiale per trascrivere automaticamente audio e video, generare riassunti dettagliati, estrarre i concetti chiave e creare quiz interattivi. Basta caricare il tuo file e l'AI analizza tutto in pochi secondi."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Quali formati di file sono supportati?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "AppuntoAI supporta file video (MP4, MOV, AVI, WebM, MKV) e audio (MP3, WAV, M4A, OGG, FLAC, AAC) fino a 7GB di dimensione."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "È possibile chattare con i documenti?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Sì! AppuntoAI include una chat AI che ti permette di fare domande sui tuoi documenti e ottenere risposte immediate basate sul contenuto analizzato."
                        }
                    }
                ]
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}

