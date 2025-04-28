'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";

// Componente Logo separato per chiarezza
const Logo = () => (
  <Link href="/" className="inline-flex items-center gap-2 mb-8">
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 12H23M9 16H19M9 20H16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M24 19L26 21L22 25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="text-xl font-bold">Appuntoai</span>
  </Link>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messageSent, setMessageSent] = useState(false); // Stato per mostrare messaggio di successo

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessageSent(false); // Resetta messaggio successo

    try {
      // Chiama signIn con il provider 'resend'
      const result = await signIn('resend', {
        email,
        redirect: false, // Non reindirizzare automaticamente
        // Puoi specificare una callbackUrl se vuoi che l'utente atterri lì
        // dopo aver cliccato il link nell'email
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        // Gestisci errori specifici se necessario, altrimenti mostra un errore generico
        if (result.error === 'EmailSignin') { // Questo potrebbe essere un errore comune
             setError('Impossibile inviare il link. Riprova.');
        } else {
            setError('Si è verificato un errore. Riprova.');
        }
        console.error("Sign in error:", result.error);
      } else if (result?.ok) {
        // L'email è stata inviata (NextAuth non solleva errore)
        setMessageSent(true);
        setEmail(''); // Pulisci l'input email
      } else {
         // Caso imprevisto
         setError('Qualcosa è andato storto. Riprova.');
      }
    } catch (err) {
      setError('Si è verificato un errore inaspettato.');
      console.error("Unexpected sign in error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <Logo />

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Accedi ad AppuntoAI</CardTitle>
          <CardDescription>Inserisci la tua email per ricevere un link magico e accedere.</CardDescription>
        </CardHeader>
        <CardContent>
          {messageSent ? (
            <div className="text-center p-4 border border-green-200 bg-green-50 rounded-md">
              <MailCheck className="mx-auto h-12 w-12 text-green-500 mb-3" />
              <h3 className="text-lg font-semibold text-green-800">Controlla la tua email!</h3>
              <p className="text-sm text-green-700 mt-1">
                Ti abbiamo inviato un link magico. Cliccalo per completare l'accesso.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                (Potrebbe volerci qualche minuto e finire nello spam)
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="iltuonome@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-10" // Altezza standard
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary/90 h-10">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Invio in corso...
                  </>
                ) : (
                  'Invia Magic Link'
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-center text-sm text-muted-foreground pt-4">
          <p>Non hai un account? Verrà creato automaticamente.</p>
        </CardFooter>
      </Card>
    </div>
  );
}