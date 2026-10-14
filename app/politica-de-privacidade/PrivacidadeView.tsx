"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, EyeOff, HardDrive, Lock, Github, ExternalLink } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useLocale } from "@/contexts/locale-context"

export function PrivacidadeView() {
  const { t, locale } = useLocale()
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const copy = locale === "en" ? {
    title: "Privacy Policy & Data", intro: t.page.legal.privacyIntro, local: "You use the simulator without providing email, phone, ID, or sensitive personal data.", storage: "Lineups, scenarios, language, and 12a0 progress are stored only in your browser.", sale: "We do not sell data or use invasive advertising networks.", sections: [
      ["1. Data minimization", "The safest privacy policy is to avoid collecting unnecessary data. The simulator works without accounts, passwords, or personal profiles."],
      ["2. Local storage", "Preferences and simulation progress remain in localStorage on your device. Clearing browser data or using private browsing removes them."],
      ["3. Public sports data", "Match calendars, rosters, statistics, and standings come from public sports sources. Cached requests are not connected to personal identifiers."],
      ["4. Cookies", "The simulator does not use advertising cookies, cross-site trackers, third-party pixels, or login sessions."],
      ["5. Your rights", "Because we do not maintain an account database with identifiable personal data, you control the information stored locally on your device."],
      ["6. Transparency and contact", "The source code is public. Questions, suggestions, and privacy feedback can be submitted through the project repository."],
    ]
  } : locale === "es" ? {
    title: "Política de privacidad y datos", intro: t.page.legal.privacyIntro, local: "Puedes usar el simulador sin proporcionar correo, teléfono, documento ni datos personales sensibles.", storage: "Las alineaciones, escenarios, idioma y progreso de 12a0 se guardan solo en tu navegador.", sale: "No vendemos datos ni usamos redes publicitarias invasivas.", sections: [
      ["1. Minimización de datos", "La política más segura es no recopilar datos innecesarios. El simulador funciona sin cuentas, contraseñas ni perfiles personales."],
      ["2. Almacenamiento local", "Las preferencias y el progreso permanecen en localStorage en tu dispositivo. Al borrar los datos del navegador se eliminan."],
      ["3. Datos deportivos públicos", "Calendarios, plantillas, estadísticas y clasificaciones proceden de fuentes deportivas públicas y no se vinculan a identificadores personales."],
      ["4. Cookies", "El simulador no usa cookies publicitarias, rastreadores entre sitios, píxeles de terceros ni sesiones de inicio."],
      ["5. Tus derechos", "Como no mantenemos una base de cuentas con datos identificables, controlas la información guardada localmente en tu dispositivo."],
      ["6. Transparencia y contacto", "El código fuente es público. Puedes enviar dudas, sugerencias y comentarios de privacidad mediante el repositorio."],
    ]
  } : {
    title: "Política de Privacidade & Dados", intro: t.page.legal.privacyIntro, local: "Você navega e simula sem fornecer e-mail, telefone, CPF ou qualquer dado pessoal sensível.", storage: "Escalações, cenários, idioma e progresso do 12a0 ficam salvos apenas no seu navegador.", sale: "Não vendemos dados nem usamos redes de anúncios invasivos.", sections: [
      ["1. Minimização de dados", "A política mais segura é não coletar dados desnecessários. O simulador funciona sem contas, senhas ou perfis pessoais."],
      ["2. Armazenamento local", "Preferências e progresso ficam no localStorage do seu dispositivo. Limpar os dados do navegador remove essas informações."],
      ["3. Dados esportivos públicos", "Calendários, elencos, estatísticas e classificações vêm de fontes esportivas públicas e não são vinculados a identificadores pessoais."],
      ["4. Cookies", "O simulador não usa cookies publicitários, rastreadores entre sites, pixels de terceiros ou sessões de login."],
      ["5. Seus direitos", "Como não mantemos uma base de contas com dados identificáveis, você controla as informações salvas localmente no seu dispositivo."],
      ["6. Transparência e contato", "O código-fonte é público. Dúvidas, sugestões e feedback sobre privacidade podem ser enviados pelo repositório."],
    ]
  }
  return <main className="min-h-screen bg-[#040405] text-white flex flex-col"><Header loading={false} selectedTeam={selectedTeam} onTeamSelect={setSelectedTeam} setActiveTab={() => { }} /><div className="container mx-auto px-4 py-8 max-w-5xl flex-1"><div className="mb-6"><p className="text-xs uppercase tracking-widest text-amber-400">{t.page.legal.privacy}</p><h1 className="text-3xl font-black mt-2">{copy.title}</h1><p className="text-sm text-zinc-400 mt-2">{copy.intro}</p></div><div className="flex gap-2 mb-6"><Link href="/" className="px-3 py-2 rounded-xl bg-white/[0.06] text-sm"><ArrowLeft className="inline w-4 h-4 mr-1" />{t.page.legal.back}</Link><Link href="/termos-de-uso" className="px-3 py-2 rounded-xl bg-white/[0.06] text-sm">{t.page.legal.terms}</Link></div><div className="grid md:grid-cols-3 gap-3 mb-6"><div className="p-4 rounded-2xl bg-white/[0.04]"><EyeOff className="text-emerald-400 mb-2" /><h2 className="font-bold">{t.page.legal.privacy}</h2><p className="text-xs text-zinc-400 mt-1">{copy.local}</p></div><div className="p-4 rounded-2xl bg-white/[0.04]"><HardDrive className="text-cyan-400 mb-2" /><h2 className="font-bold">{t.page.legal.localStorage}</h2><p className="text-xs text-zinc-400 mt-1">{copy.storage}</p></div><div className="p-4 rounded-2xl bg-white/[0.04]"><Lock className="text-amber-400 mb-2" /><h2 className="font-bold">{t.page.legal.noSale}</h2><p className="text-xs text-zinc-400 mt-1">{copy.sale}</p></div></div><div className="space-y-3">{copy.sections.map(([heading, body]) => <article key={heading} className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08]"><h2 className="font-bold">{heading}</h2><p className="text-sm text-zinc-300 mt-2 leading-relaxed">{body}</p></article>)}</div><Link href="https://github.com/ialexanderbrito/kings-league-simulator" target="_blank" className="inline-flex items-center gap-2 mt-6 text-sm text-amber-400">{t.page.legal.inspectCode}<Github className="w-4 h-4" /><ExternalLink className="w-3 h-3" /></Link></div><Footer /></main>
}
