"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Progress } from "@/src/components/ui/progress"
import { Loader2, CheckCircle2, XCircle, Trophy, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface QuizQuestion {
    domanda: string
    risposte: string[]
    risposta_corretta: string
}

interface QuizData {
    flashcards: {
        quiz: QuizQuestion[]
    }
}

export default function QuizPage() {
    const params = useParams()
    const router = useRouter()
    const transcriptId = params.transcriptId as string

    const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [isAnswered, setIsAnswered] = useState(false)
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(30)
    const [isQuizComplete, setIsQuizComplete] = useState(false)

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await fetch(`/api/quiz/${transcriptId}`)
                if (!response.ok) throw new Error("Errore caricamento quiz")

                const data: QuizData = await response.json()

                // Randomizza l'ordine delle risposte per ogni domanda
                const shuffledQuiz = data.flashcards.quiz.map(question => {
                    const shuffledAnswers = [...question.risposte].sort(() => Math.random() - 0.5)
                    return {
                        ...question,
                        risposte: shuffledAnswers
                    }
                })

                setQuizData(shuffledQuiz)
            } catch (error) {
                toast.error("Errore", { description: "Impossibile caricare il quiz" })
                router.push("/dashboard")
            } finally {
                setIsLoading(false)
            }
        }

        fetchQuiz()
    }, [transcriptId, router])

    useEffect(() => {
        if (!quizData || isAnswered || isQuizComplete) return

        if (timeLeft === 0) {
            handleTimeout()
            return
        }

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1)
        }, 1000)

        return () => clearTimeout(timer)
    }, [timeLeft, isAnswered, quizData, isQuizComplete])

    const handleTimeout = () => {
        setIsAnswered(true)
        toast.error("Tempo scaduto!", { description: "Passiamo alla prossima domanda" })

        setTimeout(() => {
            moveToNext()
        }, 2000)
    }

    const handleAnswerClick = (answer: string) => {
        if (isAnswered) return

        setSelectedAnswer(answer)
        setIsAnswered(true)

        const isCorrect = answer === quizData![currentQuestion].risposta_corretta
        if (isCorrect) {
            setScore(score + 1)
            toast.success("Corretto! 🎉")
        } else {
            toast.error("Sbagliato!", {
                description: `La risposta corretta era: ${quizData![currentQuestion].risposta_corretta}`
            })
        }

        setTimeout(() => {
            moveToNext()
        }, 2500)
    }

    const moveToNext = () => {
        if (currentQuestion + 1 < quizData!.length) {
            setCurrentQuestion(currentQuestion + 1)
            setSelectedAnswer(null)
            setIsAnswered(false)
            setTimeLeft(30)
        } else {
            setIsQuizComplete(true)
        }
    }

    const getAnswerStyle = (answer: string) => {
        if (!isAnswered) {
            return "border-2 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all"
        }

        const correctAnswer = quizData![currentQuestion].risposta_corretta
        const isCorrect = answer === correctAnswer
        const isSelected = answer === selectedAnswer

        if (isCorrect) {
            return "border-2 border-green-500 bg-green-50 text-green-900"
        }
        if (isSelected && !isCorrect) {
            return "border-2 border-red-500 bg-red-50 text-red-900"
        }
        return "border-2 opacity-50"
    }

    const getAnswerIcon = (answer: string) => {
        if (!isAnswered) return null

        const correctAnswer = quizData![currentQuestion].risposta_corretta
        const isCorrect = answer === correctAnswer
        const isSelected = answer === selectedAnswer

        if (isCorrect) {
            return <CheckCircle2 className="h-5 w-5 text-green-600" />
        }
        if (isSelected && !isCorrect) {
            return <XCircle className="h-5 w-5 text-red-600" />
        }
        return null
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">Generazione quiz in corso...</p>
                </div>
            </div>
        )
    }

    if (isQuizComplete) {
        const percentage = Math.round((score / quizData!.length) * 100)

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="max-w-lg w-full">
                    <CardHeader className="text-center pb-6">
                        <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <Trophy className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="text-3xl">Quiz Completato!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center space-y-2">
                            <p className="text-6xl font-bold text-primary">{score}/{quizData!.length}</p>
                            <p className="text-xl text-muted-foreground">Punteggio: {percentage}%</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Risposte corrette</span>
                                <span>{score}</span>
                            </div>
                            <Progress value={percentage} className="h-3" />
                        </div>

                        <div className="pt-4 space-y-2">
                            <Button
                                onClick={() => router.push("/dashboard")}
                                className="w-full gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Torna alla Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!quizData || quizData.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <Card className="max-w-lg w-full">
                    <CardContent className="text-center py-12">
                        <p className="text-lg text-muted-foreground">Nessuna domanda disponibile</p>
                        <Button onClick={() => router.push("/dashboard")} className="mt-4">
                            Torna alla Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const question = quizData[currentQuestion]
    const progressPercentage = ((currentQuestion + 1) / quizData.length) * 100
    const timePercentage = (timeLeft / 30) * 100

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/dashboard")}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Esci
                    </Button>
                    <div className="text-sm font-medium">
                        Domanda {currentQuestion + 1} di {quizData.length}
                    </div>
                </div>

                <div className="space-y-2">
                    <Progress value={progressPercentage} className="h-2" />
                </div>

                <Card className="border-2">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Tempo rimanente</span>
                            <span className={`text-2xl font-bold ${timeLeft <= 3 ? 'text-red-600' : 'text-primary'}`}>
                                {timeLeft}s
                            </span>
                        </div>
                        <Progress
                            value={timePercentage}
                            className={`h-2 ${timeLeft <= 3 ? '[&>div]:bg-red-600' : ''}`}
                        />
                    </CardContent>
                </Card>

                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="text-2xl leading-relaxed">
                            {question.domanda}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {question.risposte.map((answer, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerClick(answer)}
                                disabled={isAnswered}
                                className={`w-full p-4 rounded-lg text-left flex items-center justify-between gap-3 ${getAnswerStyle(answer)}`}
                            >
                                <div className="flex items-start gap-3 flex-1">
                                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="text-base leading-relaxed">{answer}</span>
                                </div>
                                {getAnswerIcon(answer)}
                            </button>
                        ))}
                    </CardContent>
                </Card>
                <div className="text-center text-sm text-muted-foreground">
                    Punteggio attuale: <span className="font-bold text-primary">{score}/{quizData.length}</span>
                </div>
            </div>
        </div>
    )
}

