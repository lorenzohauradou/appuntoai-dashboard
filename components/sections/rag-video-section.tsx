"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { BackgroundPattern } from "@/components/ui/background-pattern"
import { MessageSquare, ArrowRight, ListTodo } from "lucide-react"
import { Button } from "@/components/ui/button"

export function RagVideoSection() {
  const [isVideoZoomed, setIsVideoZoomed] = useState(false);

  const handleVideoClick = () => {
    if (window.innerWidth < 768) {
      setIsVideoZoomed(true);
    }
  };

  const handleCloseZoom = () => {
    setIsVideoZoomed(false);
  };

  return (
    <section id="rag-video" className="relative py-16 md:py-24 overflow-hidden">
      <BackgroundPattern />
      <div className="container relative z-10">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Interagisci con i tuoi contenuti</h2>
          <p className="mb-12 text-xl text-muted-foreground">
            Analizza i tuoi video e fai domande specifiche sui contenuti
          </p>
        </div>

        <div className="mx-auto max-w-[1000px]">
          <Card className="overflow-hidden shadow-lg mb-8">
            <div className="bg-primary p-4 text-white">
            </div>
            <CardContent className="p-6">
              <div
                className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center mb-6 overflow-hidden md:cursor-default cursor-pointer"
                onClick={handleVideoClick}
              >
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="/showcase_video.mp4" type="video/mp4" />
                  Il tuo browser non supporta il tag video.
                </video>
              </div>
              
              {isVideoZoomed && (
                <div
                  className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:hidden"
                  onClick={handleCloseZoom}
                >
                  <video
                    className="max-w-full max-h-full rounded-lg"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    preload="metadata"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <source src="/showcase_video.mp4" type="video/mp4" />
                    Il tuo browser non supporta il tag video.
                  </video>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-6 items-center mt-6"> 
                <div className="flex-1 flex items-start gap-4 p-4 bg-slate-50 rounded-lg"> 
                  <ListTodo className="h-8 w-8 text-primary shrink-0 mt-1" /> 
                  <div>
                    <p className="font-semibold text-base mb-1">Chatta con il documento</p> 
                    <p className="text-sm text-muted-foreground">
                      Chiedi qualsiasi cosa alla chat ai che conosce tutti i dettagli del tuo meeting!
                    </p>
                  </div>
                </div>
                
                <div className="w-full md:w-auto md:ml-4"> 
                  <Button className="w-full md:w-auto" size="lg">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Scopri di più
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="bg-slate-50 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-2 items-center">
                  <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm font-medium">"Quali decisioni sono state prese nel meeting?"</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-50 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-2 items-center">
                  <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm font-medium">"Riassumi i compiti assegnati a Marco"</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-50 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-2 items-center">
                  <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm font-medium">"Quali sono i principali temi discussi?"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
} 