import { Sponsors, Sponsor } from "@/components/sponsors"

const defaultSponsors: Sponsor[] = [
  {
    id: "twitter",
    name: "Twitter",
    logo: "/public/sponsors/favicon1.svg",
    url: "https://twitter.com"
  },
  {
    id: "github",
    name: "GitHub",
    logo: "/public/sponsors/favicon2.svg",
    url: "https://github.com"
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    logo: "/public/sponsors/favicon3.svg",
    url: "https://linkedin.com"
  },
]

interface SponsorsSectionProps {
  sponsors?: Sponsor[]
  className?: string
}

export function SponsorsSection({ sponsors = defaultSponsors, className }: SponsorsSectionProps) {
  return (
    <div className={className}>
      <div className="flex flex-col items-center justify-center">
        <p className="text-center text-gray-400 uppercase text-sm">
          Apoiadores
        </p>
        <Sponsors sponsors={sponsors} />
      </div>
    </div>
  )
}