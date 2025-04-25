import { Metadata } from "next"
import { default as StandingsPage } from "./Standings"

export const metadata: Metadata = {
  title: 'Classificação',
  description: 'Acompanhe a classificação dos times na Kings League',
}

export default function Standings() {
  return (
    <StandingsPage />
  )
}