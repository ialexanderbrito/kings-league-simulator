import { Metadata } from "next"
import { default as PlayoffsPage } from "./Playoffs"

export const metadata: Metadata = {
  title: 'Playoffs',
  description: 'Acompanhe os playoffs da Kings League',
};

export default function Playoffs() {
  return (
    <PlayoffsPage />
  )
}