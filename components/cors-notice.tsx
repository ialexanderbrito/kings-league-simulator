"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export default function CorsNotice() {
  const handleUnlockCors = () => {
    window.open("https://cors-anywhere.herokuapp.com/", "_blank")
  }

  return (
    <Alert className="mb-6">
      <AlertTitle className="text-amber-500 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-alert-triangle"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
        Aviso CORS
      </AlertTitle>
      <AlertDescription className="text-sm">
        <p className="mb-2">
          Este aplicativo usa CORS Anywhere para acessar a API da Kings League. Para que funcione corretamente, você
          precisa desbloquear temporariamente o acesso ao proxy CORS.
        </p>
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleUnlockCors}>
          <ExternalLink className="w-3 h-3" />
          Desbloquear acesso CORS
        </Button>
      </AlertDescription>
    </Alert>
  )
}
