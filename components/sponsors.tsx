import Image from "next/image"
import { Marquee } from "@/components/ui/marquee"

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  url?: string;
}

interface SponsorsProps {
  sponsors: Sponsor[]
  className?: string
}

export function Sponsors({ sponsors, className }: SponsorsProps) {
  return (
    <Marquee
      pauseOnHover
      repeat={2}
    >
      <div className="mx-auto py-4">
        <div className="flex justify-items-center">
          {sponsors.map((sponsor) => (
            <div key={sponsor.id} className="flex justify-center px-8">
              {sponsor.url ? (
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={sponsor.name}
                >
                  <SponsorImage logo={sponsor.logo} name={sponsor.name} />
                </a>
              ) : (
                <SponsorImage logo={sponsor.logo} name={sponsor.name} />
              )}
            </div>
          ))}
        </div>
      </div>
    </Marquee>
  )
}

function SponsorImage({ logo, name }: { logo: string, name: string }) {
  return (
    <div className="flex items-center justify-center h-14 w-auto relative">
      <Image
        className="object-contain transition duration-300 ease-in-out hover:scale-105 rounded-full"
        src={logo}
        alt={name}
        width={80}
        height={80}
        style={{
          height: "100%",
          width: "auto",
          maxWidth: "none"
        }}
        quality={90}
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.onerror = null
          target.src = "/placeholder-logo.svg"
        }}
      />
    </div>
  )
}