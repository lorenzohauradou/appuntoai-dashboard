'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { BackgroundPattern } from "@/src/components/ui/background-pattern";

const Logo = () => (
  <Link href="/" className="inline-flex items-center gap-2 mb-10">
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
    <span className="text-xl font-bold text-slate-900">Appuntoai</span>
  </Link>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessageSent(false);

    try {
      const result = await signIn('resend', {
        email,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        if (result.error === 'EmailSignin') {
          setError('Impossibile inviare il link. Controlla l\'email e riprova.');
        } else {
          setError('Si è verificato un errore. Riprova.');
        }
        console.error("Sign in error:", result.error);
      } else if (result?.ok) {
        setMessageSent(true);
        setEmail('');
      } else {
        setError('Qualcosa è andato storto. Riprova.');
      }
    } catch (err) {
      setError('Si è verificato un errore inaspettato.');
      console.error("Unexpected sign in error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 overflow-hidden">
      <BackgroundPattern />
      <div className="relative z-10 flex flex-col items-center w-full">
        <Logo />

        <Card className="w-full max-w-md shadow-xl border-t-4 border-primary bg-card">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Accedi ad AppuntoAI</CardTitle>
            <CardDescription>Inserisci la tua email per ricevere un magic link.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {messageSent ? (
              <div className="text-center p-4 border border-green-300 bg-green-50 rounded-lg shadow-sm">
                <MailCheck className="mx-auto h-12 w-12 text-green-500 mb-3" />
                <h3 className="text-lg font-semibold text-green-800">Controlla la tua email!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Ti abbiamo inviato un link magico per accedere.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  (Potrebbe richiedere qualche minuto)
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="iltuonome@esempio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className={`h-10 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 text-sm font-semibold">
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

            {!messageSent && (
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Oppure
                  </span>
                </div>
              </div>
            )}

            {!messageSent && (
              <Button
                variant="outline"
                className="w-full h-10 flex items-center justify-center gap-2 text-sm border-slate-300 hover:bg-slate-100 text-slate-700"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <img src="/google_icon.png" alt="Google logo" className="h-5 w-5" />
                Accedi con Google
              </Button>
            )}
          </CardContent>
          {!messageSent && (
            <CardFooter className="flex justify-center text-center text-sm text-muted-foreground pt-2 pb-6">
              <p>Non hai un account? Verrà creato al primo accesso.</p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}