import TeamPageClient from "@/components/team/team-page-client"

// Pré-renderiza todos os times conhecidos em build time (SSG)
// Isso converte a rota /team/[teamId] de dinâmica para estática,
// evitando invocações de Serverless Functions a cada visita de usuário na Vercel.
export async function generateStaticParams() {
  return [
    { teamId: "49" },
    { teamId: "50" },
    { teamId: "160" },
    { teamId: "161" },
    { teamId: "162" },
    { teamId: "163" },
    { teamId: "164" },
    { teamId: "167" },
    { teamId: "168" },
    { teamId: "220" },
  ]
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>
}) {
  const { teamId } = await params
  return <TeamPageClient teamId={teamId} />
}