import { Metadata } from "next"
import { default as TeamsPage } from "./Teams"

export const metadata: Metadata = {
  title: 'Times',
  description: 'Conheça os times e seus presidentes na Kings League',
}

export default function Teams() {
  return (
    <TeamsPage />
  )
}