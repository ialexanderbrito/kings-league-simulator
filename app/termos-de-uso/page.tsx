import { Metadata } from 'next'
import { TermosView } from './TermosView'

export const metadata: Metadata = {
  title: 'Termos de Uso & Isenção Comunitária | Kings League Simulador',
  description: 'Diretrizes, isenção de responsabilidade de marca (fair use) e termos de uso do Kings League Simulador, um projeto independente e gratuito feito por e para a comunidade.',
  alternates: {
    canonical: 'https://kings-league-simulator.vercel.app/termos-de-uso',
  },
  openGraph: {
    title: 'Termos de Uso & Isenção Legal | Kings League Simulador',
    description: 'Transparência sobre marcas, algoritmos e propósito comunitário do Kings League Simulador.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermosPage() {
  return <TermosView />
}