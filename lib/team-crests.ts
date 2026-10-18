// Kings League Team Crests Library
// 18 handcrafted, vibrant, esports-grade vector badges with custom gradients and heraldic iconography.

function createSvgDataUri(svg: string): string {
  const cleaned = svg.replace(/\s+/g, " ").trim();
  const base64 = typeof Buffer !== "undefined"
    ? Buffer.from(cleaned).toString("base64")
    : btoa(unescape(encodeURIComponent(cleaned)));
  return `data:image/svg+xml;base64,${base64}`;
}

export interface TeamCrest {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  dataUrl: string;
}

export const TEAM_CRESTS: TeamCrest[] = [
  // 1. Dourado Real (Golden Imperial Crown)
  {
    id: "crest-gold-crown",
    name: "Dourado Real",
    primaryColor: "#F59E0B",
    secondaryColor: "#78350F",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="gold_grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FEF08A"/>
            <stop offset="45%" stop-color="#F59E0B"/>
            <stop offset="100%" stop-color="#B45309"/>
          </linearGradient>
          <linearGradient id="bg_gold1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#3B2305"/>
            <stop offset="100%" stop-color="#180E02"/>
          </linearGradient>
        </defs>
        <path d="M50 6 L86 20 V50 C86 72 50 94 50 94 C50 94 14 72 14 50 V20 Z" fill="url(#bg_gold1)" stroke="url(#gold_grad1)" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M50 13 L80 25 V48 C80 66 50 86 50 86 C50 86 20 66 20 48 V25 Z" fill="none" stroke="url(#gold_grad1)" stroke-width="1.2" stroke-opacity="0.45"/>
        <path d="M30 62 L28 42 L39 49 L50 35 L61 49 L72 42 L70 62 Z" fill="url(#gold_grad1)"/>
        <circle cx="28" cy="40" r="2.5" fill="#FFF"/>
        <circle cx="50" cy="33" r="3" fill="#FFF"/>
        <circle cx="72" cy="40" r="2.5" fill="#FFF"/>
        <path d="M30 66 H70 V70 H30 Z" fill="url(#gold_grad1)"/>
        <circle cx="50" cy="78" r="3" fill="url(#gold_grad1)"/>
        <circle cx="41" cy="78" r="2" fill="url(#gold_grad1)"/>
        <circle cx="59" cy="78" r="2" fill="url(#gold_grad1)"/>
      </svg>
    `)
  },

  // 2. Fúria Flamejante (Crimson Phoenix / Fire)
  {
    id: "crest-crimson-fire",
    name: "Fúria Flamejante",
    primaryColor: "#EF4444",
    secondaryColor: "#991B1B",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="fire_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FCA5A5"/>
            <stop offset="40%" stop-color="#EF4444"/>
            <stop offset="100%" stop-color="#991B1B"/>
          </linearGradient>
          <linearGradient id="bg_fire" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#450A0A"/>
            <stop offset="100%" stop-color="#240404"/>
          </linearGradient>
          <linearGradient id="fire_inner" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FEF08A"/>
            <stop offset="60%" stop-color="#F97316"/>
            <stop offset="100%" stop-color="#DC2626"/>
          </linearGradient>
        </defs>
        <path d="M50 6 L88 22 V52 C88 74 50 94 50 94 C50 94 12 74 12 52 V22 Z" fill="url(#bg_fire)" stroke="url(#fire_grad)" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M50 20 C54 32 64 36 68 46 C72 55 68 66 60 70 C58 64 56 60 52 58 C50 66 45 74 38 72 C33 70 31 64 33 58 C35 52 40 48 42 42 C44 37 42 30 50 20 Z" fill="url(#fire_inner)"/>
        <path d="M50 36 C52 44 58 48 56 56 C52 64 45 62 47 54 C47 50 49 46 50 36 Z" fill="#FEF08A"/>
      </svg>
    `)
  },

  // 3. Cyber Neon (Cyan Lightning)
  {
    id: "crest-cyber-neon",
    name: "Cyber Neon",
    primaryColor: "#06B6D4",
    secondaryColor: "#0369A1",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="cyber_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#67E8F9"/>
            <stop offset="50%" stop-color="#06B6D4"/>
            <stop offset="100%" stop-color="#1D4ED8"/>
          </linearGradient>
          <linearGradient id="bg_cyber" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#082F49"/>
            <stop offset="100%" stop-color="#041525"/>
          </linearGradient>
        </defs>
        <path d="M50 5 L88 18 V50 C88 74 50 95 50 95 C50 95 12 74 12 50 V18 Z" fill="url(#bg_cyber)" stroke="url(#cyber_grad)" stroke-width="4.5" stroke-linejoin="round"/>
        <polygon points="56,22 36,50 48,50 42,78 66,46 52,46" fill="url(#cyber_grad)"/>
        <polygon points="54,28 40,49 49,49 45,68 61,47 51,47" fill="#E0F2FE"/>
      </svg>
    `)
  },

  // 4. Pantera Negra (Stealth Panther)
  {
    id: "crest-panther-stealth",
    name: "Pantera Negra",
    primaryColor: "#E2E8F0",
    secondaryColor: "#334155",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="silver_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="50%" stop-color="#94A3B8"/>
            <stop offset="100%" stop-color="#475569"/>
          </linearGradient>
          <linearGradient id="bg_panther" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1E293B"/>
            <stop offset="100%" stop-color="#0B1120"/>
          </linearGradient>
        </defs>
        <path d="M50 6 L88 20 V52 C88 73 50 94 50 94 C50 94 12 73 12 52 V20 Z" fill="url(#bg_panther)" stroke="url(#silver_grad)" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M30 32 L36 46 L42 40 L50 44 L58 40 L64 46 L70 32 L66 52 C64 66 50 74 50 74 C50 74 36 66 34 52 Z" fill="#334155" stroke="url(#silver_grad)" stroke-width="2"/>
        <polygon points="38,48 44,52 38,54" fill="#FBBF24"/>
        <polygon points="62,48 56,52 62,54" fill="#FBBF24"/>
        <circle cx="50" cy="62" r="3" fill="#E2E8F0"/>
        <path d="M46 66 L50 69 L54 66" stroke="#E2E8F0" stroke-width="2" fill="none"/>
      </svg>
    `)
  },

  // 5. Dragão Esmeralda (Emerald Dragon)
  {
    id: "crest-emerald-dragon",
    name: "Dragão Esmeralda",
    primaryColor: "#10B981",
    secondaryColor: "#047857",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="emerald_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6EE7B7"/>
            <stop offset="50%" stop-color="#10B981"/>
            <stop offset="100%" stop-color="#047857"/>
          </linearGradient>
          <linearGradient id="bg_emerald" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#064E3B"/>
            <stop offset="100%" stop-color="#02241C"/>
          </linearGradient>
        </defs>
        <path d="M50 6 L88 22 V52 C88 74 50 94 50 94 C50 94 12 74 12 52 V22 Z" fill="url(#bg_emerald)" stroke="url(#emerald_grad)" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M50 22 C56 26 66 28 72 38 C76 45 74 54 66 62 L64 56 C60 64 52 70 50 74 C48 70 40 64 36 56 L34 62 C26 54 24 45 28 38 C34 28 44 26 50 22 Z" fill="url(#emerald_grad)"/>
        <polygon points="50,34 54,42 63,43 56,49 58,58 50,53 42,58 44,49 37,43 46,42" fill="#ECFDF5"/>
      </svg>
    `)
  },

  // 6. Raio Dourado (Thunder Volt)
  {
    id: "crest-thunder-volt",
    name: "Raio Dourado",
    primaryColor: "#EAB308",
    secondaryColor: "#854D0E",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="volt_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FEF08A"/>
            <stop offset="50%" stop-color="#EAB308"/>
            <stop offset="100%" stop-color="#A16207"/>
          </linearGradient>
          <linearGradient id="bg_volt" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#422006"/>
            <stop offset="100%" stop-color="#1F0E02"/>
          </linearGradient>
        </defs>
        <path d="M50 6 L86 18 V52 C86 74 50 94 50 94 C50 94 14 74 14 52 V18 Z" fill="url(#bg_volt)" stroke="url(#volt_grad)" stroke-width="4.5" stroke-linejoin="round"/>
        <polygon points="54,18 30,50 46,50 38,82 70,44 52,44" fill="url(#volt_grad)"/>
        <polygon points="52,24 35,48 48,48 42,72 64,45 51,45" fill="#FFFFFF"/>
      </svg>
    `)
  },

  // 7. Tigre Violeta (Royal Violet)
  {
    id: "crest-royal-violet",
    name: "Tigre Violeta",
    primaryColor: "#8B5CF6",
    secondaryColor: "#5B21B6",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="violet_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#C4B5FD"/>
            <stop offset="50%" stop-color="#8B5CF6"/>
            <stop offset="100%" stop-color="#5B21B6"/>
          </linearGradient>
          <linearGradient id="bg_violet" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#3B0764"/>
            <stop offset="100%" stop-color="#1F0438"/>
          </linearGradient>
        </defs>
        <path d="M50 6 L88 22 V52 C88 74 50 94 50 94 C50 94 12 74 12 52 V22 Z" fill="url(#bg_violet)" stroke="url(#violet_grad)" stroke-width="4.5" stroke-linejoin="round"/>
        <circle cx="50" cy="50" r="22" fill="#581C87" stroke="url(#violet_grad)" stroke-width="2"/>
        <polygon points="50,32 55,44 67,45 57,53 60,65 50,58 40,65 43,53 33,45 45,44" fill="url(#violet_grad)"/>
        <circle cx="50" cy="50" r="5" fill="#EDE9FE"/>
      </svg>
    `)
  },

  // 8. Vulcão Magma (Solar Flare)
  {
    id: "crest-solar-flare",
    name: "Vulcão Magma",
    primaryColor: "#F97316",
    secondaryColor: "#9A3412",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="magma_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FED7AA"/>
            <stop offset="50%" stop-color="#F97316"/>
            <stop offset="100%" stop-color="#C2410C"/>
          </linearGradient>
          <linearGradient id="bg_magma" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#431407"/>
            <stop offset="100%" stop-color="#210803"/>
          </linearGradient>
        </defs>
        <path d="M50 5 L88 18 V50 C88 74 50 95 50 95 C50 95 12 74 12 50 V18 Z" fill="url(#bg_magma)" stroke="url(#magma_grad)" stroke-width="4.5" stroke-linejoin="round"/>
        <circle cx="50" cy="50" r="24" fill="#9A3412"/>
        <circle cx="50" cy="50" r="18" fill="url(#magma_grad)"/>
        <circle cx="50" cy="50" r="11" fill="#FEF08A"/>
        <path d="M50 20 L50 28 M50 72 L50 80 M20 50 L28 50 M72 50 L80 50 M29 29 L35 35 M65 65 L71 71 M29 71 L35 65 M65 35 L71 29" stroke="url(#magma_grad)" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `)
  },

  // 9. Diamante Glacial (Glacier Diamond)
  {
    id: "crest-glacier-diamond",
    name: "Diamante Glacial",
    primaryColor: "#38BDF8",
    secondaryColor: "#0369A1",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="glacier_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#BAE6FD"/>
            <stop offset="50%" stop-color="#38BDF8"/>
            <stop offset="100%" stop-color="#0369A1"/>
          </linearGradient>
          <linearGradient id="bg_glacier" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#075985"/>
            <stop offset="100%" stop-color="#04273E"/>
          </linearGradient>
        </defs>
        <path d="M50 6 L88 22 V52 C88 74 50 94 50 94 C50 94 12 74 12 52 V22 Z" fill="url(#bg_glacier)" stroke="url(#glacier_grad)" stroke-width="4.5" stroke-linejoin="round"/>
        <polygon points="50,26 72,44 50,74 28,44" fill="#0284C7" stroke="url(#glacier_grad)" stroke-width="2.5"/>
        <polygon points="50,26 62,44 50,74 38,44" fill="url(#glacier_grad)"/>
        <polygon points="50,26 56,44 50,74 44,44" fill="#F0F9FF"/>
      </svg>
    `)
  },

  // 10. Estrela Rubel (Ruby Star)
  {
    id: "crest-ruby-star",
    name: "Estrela Rubel",
    primaryColor: "#F43F5E",
    secondaryColor: "#9F1239",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ruby_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FECDD3"/>
            <stop offset="50%" stop-color="#F43F5E"/>
            <stop offset="100%" stop-color="#9F1239"/>
          </linearGradient>
          <linearGradient id="bg_ruby" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#4C0519"/>
            <stop offset="100%" stop-color="#26020C"/>
          </linearGradient>
        </defs>
        <path d="M50 6 L88 20 V52 C88 74 50 94 50 94 C50 94 12 74 12 52 V20 Z" fill="url(#bg_ruby)" stroke="url(#ruby_grad)" stroke-width="4.5" stroke-linejoin="round"/>
        <polygon points="50,24 57,40 75,41 61,52 66,69 50,59 34,69 39,52 25,41 43,40" fill="url(#ruby_grad)" stroke="#FFFFFF" stroke-width="1.5"/>
        <circle cx="50" cy="48" r="6" fill="#FFF1F2"/>
      </svg>
    `)
  },

  // 11. Guerreiro Espartano (Spartan Helm)
  {
    id: "crest-spartan-helm",
    name: "Guerreiro Espartano",
    primaryColor: "#FB923C",
    secondaryColor: "#9A3412",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="spartan_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FED7AA"/>
            <stop offset="50%" stop-color="#FB923C"/>
            <stop offset="100%" stop-color="#9A3412"/>
          </linearGradient>
          <linearGradient id="bg_spartan" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#3B1C10"/>
            <stop offset="100%" stop-color="#1D0B05"/>
          </linearGradient>
        </defs>
        <path d="M50 6 L88 22 V52 C88 74 50 94 50 94 C50 94 12 74 12 52 V22 Z" fill="url(#bg_spartan)" stroke="url(#spartan_grad)" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M48 20 H52 V36 H48 Z" fill="#DC2626"/>
        <path d="M34 40 C34 30 66 30 66 40 V54 C66 64 56 70 50 72 C44 70 34 64 34 54 Z" fill="url(#spartan_grad)"/>
        <polygon points="46,46 54,46 54,64 50,66 46,64" fill="#0F172A"/>
        <polygon points="38,48 44,48 42,54 38,52" fill="#0F172A"/>
        <polygon points="62,48 56,48 58,54 62,52" fill="#0F172A"/>
      </svg>
    `)
  },

  // 12. Águia Real (Imperial Eagle)
  {
    id: "crest-imperial-eagle",
    name: "Águia Real",
    primaryColor: "#F59E0B",
    secondaryColor: "#1E3A8A",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="eagle_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FEF08A"/>
            <stop offset="50%" stop-color="#F59E0B"/>
            <stop offset="100%" stop-color="#B45309"/>
          </linearGradient>
          <linearGradient id="bg_eagle" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#172554"/>
            <stop offset="100%" stop-color="#0A132E"/>
          </linearGradient>
        </defs>
        <path d="M50 6 L88 20 V52 C88 74 50 94 50 94 C50 94 12 74 12 52 V20 Z" fill="url(#bg_eagle)" stroke="url(#eagle_grad)" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M50 26 C53 32 60 36 74 34 C68 46 62 52 50 56 C38 52 32 46 26 34 C40 36 47 32 50 26 Z" fill="url(#eagle_grad)"/>
        <polygon points="50,42 55,54 45,54" fill="#FEF08A"/>
        <path d="M50 56 L50 74 M42 58 L36 70 M58 58 L64 70" stroke="url(#eagle_grad)" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `)
  },

  // 13. Tridente Oceano (Ocean Trident)
  {
    id: "crest-ocean-trident",
    name: "Tridente Oceano",
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="trident_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#93C5FD"/>
            <stop offset="50%" stop-color="#3B82F6"/>
            <stop offset="100%" stop-color="#1E40AF"/>
          </linearGradient>
          <linearGradient id="bg_trident" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1E3A8A"/>
            <stop offset="100%" stop-color="#0F1D45"/>
          </linearGradient>
        </defs>
        <path d="M50 6 L88 22 V52 C88 74 50 94 50 94 C50 94 12 74 12 52 V22 Z" fill="url(#bg_trident)" stroke="url(#trident_grad)" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M48 24 L52 24 L52 74 L48 74 Z" fill="#FBBF24"/>
        <polygon points="50,18 45,28 55,28" fill="#FBBF24"/>
        <path d="M34 32 C34 46 44 48 48 48 L48 44 C42 44 38 42 38 34 Z" fill="#FBBF24"/>
        <polygon points="34,26 30,34 38,34" fill="#FBBF24"/>
        <path d="M66 32 C66 46 56 48 52 48 L52 44 C58 44 62 42 62 34 Z" fill="#FBBF24"/>
        <polygon points="66,26 62,34 70,34" fill="#FBBF24"/>
      </svg>
    `)
  },

  // 14. Touro de Ouro (Golden Taurus)
  {
    id: "crest-golden-taurus",
    name: "Touro de Ouro",
    primaryColor: "#EAB308",
    secondaryColor: "#854D0E",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="taurus_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FEF08A"/>
            <stop offset="50%" stop-color="#EAB308"/>
            <stop offset="100%" stop-color="#854D0E"/>
          </linearGradient>
          <linearGradient id="bg_taurus" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#3F2207"/>
            <stop offset="100%" stop-color="#1E0F03"/>
          </linearGradient>
        </defs>
        <path d="M50 6 L88 20 V52 C88 74 50 94 50 94 C50 94 12 74 12 52 V20 Z" fill="url(#bg_taurus)" stroke="url(#taurus_grad)" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M26 28 C26 40 38 44 42 44 C38 40 38 34 42 30 C34 30 28 26 26 28 Z" fill="url(#taurus_grad)"/>
        <path d="M74 28 C74 40 62 44 58 44 C62 40 62 34 58 30 C66 30 72 26 74 28 Z" fill="url(#taurus_grad)"/>
        <polygon points="40,36 60,36 66,54 50,72 34,54" fill="url(#taurus_grad)"/>
        <circle cx="44" cy="46" r="2.5" fill="#18181B"/>
        <circle cx="56" cy="46" r="2.5" fill="#18181B"/>
        <circle cx="50" cy="62" r="4" fill="none" stroke="#FFFFFF" stroke-width="2"/>
      </svg>
    `)
  },

  // 15. Lobo Lunar (Moonlit Wolf)
  {
    id: "crest-moon-wolf",
    name: "Lobo Lunar",
    primaryColor: "#818CF8",
    secondaryColor: "#4338CA",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="wolf_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#C7D2FE"/>
            <stop offset="50%" stop-color="#818CF8"/>
            <stop offset="100%" stop-color="#4338CA"/>
          </linearGradient>
          <linearGradient id="bg_wolf" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1E1B4B"/>
            <stop offset="100%" stop-color="#0E0C26"/>
          </linearGradient>
        </defs>
        <path d="M50 6 L88 22 V52 C88 74 50 94 50 94 C50 94 12 74 12 52 V22 Z" fill="url(#bg_wolf)" stroke="url(#wolf_grad)" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M50 28 C56 36 66 38 68 50 C70 60 62 68 50 74 C38 68 30 60 32 50 C34 38 44 36 50 28 Z" fill="url(#wolf_grad)"/>
        <polygon points="38,36 44,46 36,44" fill="#E0E7FF"/>
        <polygon points="62,36 56,46 64,44" fill="#E0E7FF"/>
        <polygon points="44,52 48,54 44,56" fill="#FBBF24"/>
        <polygon points="56,52 52,54 56,56" fill="#FBBF24"/>
        <polygon points="50,60 47,64 53,64" fill="#1E1B4B"/>
      </svg>
    `)
  },

  // 16. Espadas Cruzadas (Crossed Swords / Vanguarda)
  {
    id: "crest-crossed-swords",
    name: "Vanguarda",
    primaryColor: "#E2E8F0",
    secondaryColor: "#DC2626",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="swords_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="50%" stop-color="#CBD5E1"/>
            <stop offset="100%" stop-color="#64748B"/>
          </linearGradient>
          <linearGradient id="bg_swords" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#350810"/>
            <stop offset="100%" stop-color="#1B0307"/>
          </linearGradient>
        </defs>
        <path d="M50 6 L88 20 V52 C88 74 50 94 50 94 C50 94 12 74 12 52 V20 Z" fill="url(#bg_swords)" stroke="#DC2626" stroke-width="4.5" stroke-linejoin="round"/>
        <line x1="30" y1="30" x2="70" y2="70" stroke="url(#swords_grad)" stroke-width="4" stroke-linecap="round"/>
        <line x1="70" y1="30" x2="30" y2="70" stroke="url(#swords_grad)" stroke-width="4" stroke-linecap="round"/>
        <line x1="28" y1="38" x2="38" y2="28" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/>
        <line x1="72" y1="38" x2="62" y2="28" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/>
        <circle cx="50" cy="50" r="6" fill="#DC2626" stroke="#FFFFFF" stroke-width="2"/>
      </svg>
    `)
  },

  // 17. Cobra Venenosa (Viper Strike)
  {
    id: "crest-viper-strike",
    name: "Cobra Venenosa",
    primaryColor: "#84CC16",
    secondaryColor: "#3F6212",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="viper_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#D9F99D"/>
            <stop offset="50%" stop-color="#84CC16"/>
            <stop offset="100%" stop-color="#3F6212"/>
          </linearGradient>
          <linearGradient id="bg_viper" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1A2E05"/>
            <stop offset="100%" stop-color="#0C1702"/>
          </linearGradient>
        </defs>
        <path d="M50 6 L88 22 V52 C88 74 50 94 50 94 C50 94 12 74 12 52 V22 Z" fill="url(#bg_viper)" stroke="url(#viper_grad)" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M50 26 C42 32 36 40 38 52 C40 64 54 62 58 54 C62 46 54 44 48 46 C44 48 44 52 46 54" fill="none" stroke="url(#viper_grad)" stroke-width="5" stroke-linecap="round"/>
        <polygon points="50,22 44,30 56,30" fill="url(#viper_grad)"/>
        <circle cx="47" cy="27" r="1.5" fill="#EF4444"/>
        <circle cx="53" cy="27" r="1.5" fill="#EF4444"/>
      </svg>
    `)
  },

  // 18. Valkíria Imperial (Valkyrie Wings)
  {
    id: "crest-valkyrie-wings",
    name: "Valkíria",
    primaryColor: "#EC4899",
    secondaryColor: "#9D174D",
    dataUrl: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="valk_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FBCFE8"/>
            <stop offset="50%" stop-color="#EC4899"/>
            <stop offset="100%" stop-color="#9D174D"/>
          </linearGradient>
          <linearGradient id="bg_valk" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#500724"/>
            <stop offset="100%" stop-color="#260311"/>
          </linearGradient>
        </defs>
        <path d="M50 6 L88 20 V52 C88 74 50 94 50 94 C50 94 12 74 12 52 V20 Z" fill="url(#bg_valk)" stroke="url(#valk_grad)" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M50 34 L66 42 L72 32 C66 52 56 64 50 72 C44 64 34 52 28 32 L34 42 Z" fill="url(#valk_grad)"/>
        <circle cx="50" cy="46" r="5" fill="#FDF2F8"/>
      </svg>
    `)
  }
];

export const GENERIC_LOGOS: string[] = TEAM_CRESTS.map(c => c.dataUrl);
