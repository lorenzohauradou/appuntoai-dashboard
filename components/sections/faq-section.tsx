import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FaqSection() {
  return (
    <section id="faq" className="bg-slate-50 py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Domande frequenti</h2>
          <p className="mb-12 text-xl text-muted-foreground">Risposte alle domande più comuni su <span className="font-bold text-primary">Appuntoai</span></p>
        </div>

        <div className="mx-auto max-w-[800px]">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Come funziona Appuntoai?</AccordionTrigger>
              <AccordionContent>
                Appuntoai utilizza tecnologie avanzate di intelligenza artificiale per trascrivere audio e video,
                analizzare il contenuto ed estrarre informazioni strutturate come riassunti, decisioni, task e temi
                principali. Puoi caricare file audio/video, registrare direttamente o inserire testo, e l'AI si occupa
                del resto.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Quali lingue sono supportate?</AccordionTrigger>
              <AccordionContent>
                Attualmente Appuntoai supporta italiano, inglese, spagnolo, francese, tedesco e portoghese. Stiamo
                lavorando per aggiungere altre lingue nel prossimo futuro.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>I miei dati sono al sicuro?</AccordionTrigger>
              <AccordionContent>
                Assolutamente sì. La sicurezza e la privacy sono le nostre priorità. Tutti i dati sono crittografati sia
                in transito che a riposo. Non condividiamo mai i tuoi contenuti con terze parti e rispettiamo pienamente
                il GDPR. Puoi anche richiedere la cancellazione dei tuoi dati in qualsiasi momento.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Quanto è accurata la trascrizione?</AccordionTrigger>
              <AccordionContent>
                La nostra tecnologia di trascrizione ha un'accuratezza superiore al 96% per audio di buona qualità.
                L'accuratezza può variare in base alla qualità dell'audio, agli accenti e alla terminologia
                specialistica, ma continuiamo a migliorare costantemente i nostri modelli.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Le mie analisi sono sempre consultabili?</AccordionTrigger>
              <AccordionContent>
                Assolutamente sì, puoi sempre consultare le tue analisi in qualsiasi momento. Anche la chat si ricorderà sempre del tuo contenuto!
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6" className="hidden">
              <AccordionTrigger>Posso modificare i risultati generati dall'AI?</AccordionTrigger>
              <AccordionContent>
                Funzionalità in fase di sviluppo.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  )
}
