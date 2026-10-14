/**
 * Utilitários para renderização de Emojis e Bandeiras no padrão oficial da Apple.
 * Utiliza o catálogo oficial do emoji-datasource-apple servido via CDN de alta performance,
 * garantindo compatibilidade uniforme em qualquer sistema operacional (incluindo Windows,
 * onde bandeiras nativas costumam falhar e exibir letras como "BR" ou "ES").
 */

// Mapeamento de códigos ISO e identificadores especiais para hex code da Apple
const SPECIAL_HEX_MAP: Record<string, string> = {
  // Competições especiais / globais
  WORLD: "1f310", // 🌐
  GLOBAL: "1f310",
  KWCC: "1f3c6", // 🏆
  TROPHY: "1f3c6",
  BALL: "26bd", // ⚽
  FIRE: "1f525", // 🔥
  CROWN: "1f451", // 👑
  MEDAL_1: "1f947", // 🥇
  MEDAL_2: "1f948", // 🥈
  MEDAL_3: "1f949", // 🥉
  MENA: "1f1f8-1f1e6", // SA (Arábia Saudita / MENA)
}

/**
 * Converte um código ISO de país (ex: 'BR', 'ES', 'MX') em seu código hexadecimal da Apple
 * Ex: 'BR' -> '1f1e7-1f1f7'
 */
export function countryIsoToAppleHex(iso: string): string | null {
  if (!iso) return null
  const clean = iso.trim().toUpperCase()

  if (SPECIAL_HEX_MAP[clean]) {
    return SPECIAL_HEX_MAP[clean]
  }

  if (clean.length !== 2) return null

  // Unicode Regional Indicator Symbols: 'A' = 0x1f1e6
  const c1 = (0x1f1e6 + (clean.charCodeAt(0) - 65)).toString(16)
  const c2 = (0x1f1e6 + (clean.charCodeAt(1) - 65)).toString(16)

  return `${c1}-${c2}`
}

/**
 * Converte qualquer emoji Unicode direto (ex: '🇧🇷', '🇪🇸', '🏆', '🥇') para o código hexadecimal da Apple
 */
export function emojiStringToAppleHex(emoji: string): string | null {
  if (!emoji) return null
  const trimmed = emoji.trim()

  // Converte os pontos de código unicode para array de hex
  const codePoints: string[] = []
  for (const char of trimmed) {
    const cp = char.codePointAt(0)
    if (cp !== undefined) {
      const hex = cp.toString(16).toLowerCase()
      // Ignora variation selectors como fe0f
      if (hex !== "fe0f") {
        codePoints.push(hex)
      }
    }
  }

  if (codePoints.length === 0) return null
  return codePoints.join("-")
}

/**
 * Obtém a URL da imagem PNG oficial da Apple para qualquer bandeira ou emoji.
 * @param input Código ISO do país ('BR', 'ES'), emoji direto ('🇧🇷', '🏆') ou chave especial ('WORLD')
 * @returns URL de alta resolução (64x64) do emoji da Apple
 */
export function getAppleEmojiUrl(input: string): string {
  if (!input) return ""

  const clean = input.trim()

  // 1. Tentar por ISO de país ou chave especial
  if (clean.length === 2 || SPECIAL_HEX_MAP[clean.toUpperCase()]) {
    const hex = countryIsoToAppleHex(clean)
    if (hex) {
      return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64/${hex}.png`
    }
  }

  // 2. Tentar por emoji direto
  const hexFromEmoji = emojiStringToAppleHex(clean)
  if (hexFromEmoji) {
    return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64/${hexFromEmoji}.png`
  }

  // Fallback padrão se não encontrar
  return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64/1f310.png`
}
