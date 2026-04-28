"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-lg p-8 max-w-sm w-full text-center">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <Image src="/peek-logo.png" alt="Peek" width={32} height={32} />
          <span className="text-2xl font-bold text-foreground">Peek Monitor</span>
        </div>
        <p className="text-muted-foreground mb-8 text-sm">
          Dashboard interno de monitoreo
        </p>

        {error === "not_member" && (
          <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-3 mb-6 text-sm text-destructive">
            Acceso restringido a miembros del servidor de Discord de Peek.
          </div>
        )}

        {error === "auth_failed" && (
          <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-3 mb-6 text-sm text-destructive">
            Error de autenticación. Intentá de nuevo.
          </div>
        )}

        {error === "invalid_state" && (
          <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-3 mb-6 text-sm text-destructive">
            Sesión de autenticación inválida. Intentá de nuevo.
          </div>
        )}

        <a
          href="/api/auth/login"
          className="inline-flex items-center justify-center gap-2 w-full bg-[#00C896] hover:bg-[#00b083] text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
          </svg>
          Iniciar sesión con Discord
        </a>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
