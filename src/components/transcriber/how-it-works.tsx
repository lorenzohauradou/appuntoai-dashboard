export function HowItWorks() {
    const steps = [
        {
            number: 1,
            title: 'Incolla l\'URL',
            description: 'Copia e incolla l\'URL del video YouTube che vuoi trascrivere'
        },
        {
            number: 2,
            title: 'Clicca Trascrivi',
            description: 'Il nostro sistema scarica automaticamente i sottotitoli'
        },
        {
            number: 3,
            title: 'Ottieni il Testo',
            description: 'Copia la trascrizione e usala come preferisci'
        }
    ]

    return (
        <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Come funziona
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {steps.map((step) => (
                    <div key={step.number} className="bg-white rounded-lg p-6 shadow-md">
                        <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold text-primary">{step.number}</span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                        <p className="text-slate-600 text-sm">
                            {step.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}

