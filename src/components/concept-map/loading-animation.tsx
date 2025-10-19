'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const mockNodes = [
    { id: 'root', label: 'Concetto Principale', type: 'root', delay: 0 },
    { id: 'c1', label: 'Tema Primario 1', type: 'concept', delay: 0.3 },
    { id: 'c2', label: 'Tema Primario 2', type: 'concept', delay: 0.5 },
    { id: 'c3', label: 'Tema Primario 3', type: 'concept', delay: 0.7 },
    { id: 'd1', label: 'Definizione', type: 'definition', delay: 1 },
    { id: 'd2', label: 'Sottoconcetto', type: 'definition', delay: 1.2 },
    { id: 'e1', label: 'Esempio Pratico', type: 'example', delay: 1.4 },
]

const getNodeColor = (type: string) => {
    if (type === 'root') return 'from-purple-500 to-purple-700'
    if (type === 'concept') return 'from-blue-500 to-blue-600'
    if (type === 'definition') return 'from-green-500 to-green-600'
    if (type === 'example') return 'from-yellow-500 to-yellow-600'
    return 'from-gray-400 to-gray-500'
}

const getNodeSize = (type: string) => {
    if (type === 'root') return 'w-72 h-28'
    if (type === 'concept') return 'w-56 h-24'
    return 'w-44 h-20'
}

export function MapLoadingAnimation() {
    const [visibleNodes, setVisibleNodes] = useState<string[]>([])
    const [currentStep, setCurrentStep] = useState(0)

    const steps = [
        'Analizzando la trascrizione...',
        'Identificando concetti chiave...',
        'Creando relazioni semantiche...',
        'Organizzando la struttura...',
        'Finalizzando la mappa...',
    ]

    useEffect(() => {
        // Mostra i nodi progressivamente
        mockNodes.forEach((node) => {
            setTimeout(() => {
                setVisibleNodes((prev) => [...prev, node.id])
            }, node.delay * 1000)
        })

        // Cambia step progressivamente
        const stepInterval = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % steps.length)
        }, 1500)

        return () => clearInterval(stepInterval)
    }, [])

    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
            <div className="relative w-full max-w-4xl h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                {/* Nodi animati */}
                <AnimatePresence>
                    {mockNodes.map((node, index) => {
                        const isVisible = visibleNodes.includes(node.id)
                        if (!isVisible) return null

                        // Calcola posizione pseudo-gerarchica (centrate perfettamente)
                        const positions = [
                            { left: '50%', top: '18%' }, // root - centrato in alto
                            { left: '17%', top: '48%' }, // concept 1 - sinistra
                            { left: '50%', top: '48%' }, // concept 2 - centro
                            { left: '83%', top: '48%' }, // concept 3 - destra
                            { left: '27%', top: '78%' }, // def 1
                            { left: '50%', top: '78%' }, // def 2 - centrato
                            { left: '73%', top: '78%' }, // example
                        ]

                        const pos = positions[index] || { left: '50%', top: '50%' }

                        return (
                            <motion.div
                                key={node.id}
                                initial={{ opacity: 0, scale: 0, y: -20 }}
                                animate={{
                                    opacity: [0, 0.7, 0.7, 0],
                                    scale: [0, 1, 1, 0.9],
                                    y: [-20, 0, 0, 10]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                    ease: "easeInOut",
                                }}
                                className="absolute -translate-x-1/2 -translate-y-1/2"
                                style={{ left: pos.left, top: pos.top }}
                            >
                                <div
                                    className={`${getNodeSize(node.type)} bg-gradient-to-br ${getNodeColor(
                                        node.type
                                    )} text-white rounded-lg shadow-xl flex items-center justify-center px-6 py-3 border-2 border-white/30 backdrop-blur-sm`}
                                    style={{ opacity: 0.85 }}
                                >
                                    <div className="text-center">
                                        <div className="font-semibold text-sm drop-shadow-sm">{node.label}</div>
                                        {/* Pulse effect */}
                                        <motion.div
                                            className="absolute inset-0 bg-white/20 rounded-lg"
                                            animate={{
                                                scale: [1, 1.05, 1],
                                                opacity: [0.2, 0, 0.2]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Linee di connessione animate */}
                                {index > 0 && index < 4 && (
                                    <motion.div
                                        className="absolute w-0.5 bg-gradient-to-b from-purple-400 to-blue-400 origin-top"
                                        style={{
                                            height: '80px',
                                            top: '-80px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                        }}
                                        initial={{ scaleY: 0, opacity: 0 }}
                                        animate={{ scaleY: 1, opacity: 0.6 }}
                                        transition={{ duration: 0.4, delay: 0.2 }}
                                    />
                                )}
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {/* Effetto particelle */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-blue-400 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -30, 0],
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </motion.div>
            </div>

            {/* Status text con animazione */}
            <div className="text-center space-y-3">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-lg font-medium text-gray-700"
                >
                    {steps[currentStep]}
                </motion.div>

                {/* Progress bar */}
                <div className="w-80 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"
                        initial={{ width: '0%' }}
                        animate={{ width: ['0%', '30%', '60%', '90%'] }}
                        transition={{
                            duration: 20,
                            times: [0, 0.3, 0.6, 1],
                            ease: 'easeInOut'
                        }}
                    />
                </div>

                <p className="text-sm text-muted-foreground">L'AI sta analizzando i concetti...</p>
            </div>
        </div>
    )
}

