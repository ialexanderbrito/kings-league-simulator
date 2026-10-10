import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const workspaceRoot = process.cwd();

// Find Chromium / Edge / Chrome executable on Windows, Linux, macOS
function findBrowserExecutable() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return 'msedge';
}

// Ensure logo files exist
const logosDir = path.join(workspaceRoot, 'scripts', 'assets', 'logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

function getLogoBase64(name) {
  const file = path.join(logosDir, `${name}.png`);
  if (fs.existsSync(file)) {
    return `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`;
  }
  return '';
}

// Load team crests
const logos = {
  g3x: getLogoBase64('g3x'),
  furia: getLogoBase64('furia'),
  fluxo: getLogoBase64('fluxo'),
  loud: getLogoBase64('loud'),
  dendele: getLogoBase64('dendele'),
  capim: getLogoBase64('capim'),
  podpah: getLogoBase64('podpah'),
  nyvelados: getLogoBase64('nyvelados'),
  dibrados: getLogoBase64('dibrados'),
  desimpain: getLogoBase64('desimpain'),
};

// Official Shield Crown SVG (Fusão 3+5)
const kingsLeagueCrownSvg = `
<svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="og-shield-border" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFBEB"/>
      <stop offset="30%" stop-color="#FDE047"/>
      <stop offset="70%" stop-color="#F4AF23"/>
      <stop offset="100%" stop-color="#92400E"/>
    </linearGradient>
    <linearGradient id="og-shield-bg" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1E1E24"/>
      <stop offset="60%" stop-color="#0E0E12"/>
      <stop offset="100%" stop-color="#050507"/>
    </linearGradient>
    <linearGradient id="og-shield-crown" x1="7" y1="8" x2="25" y2="24" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFBEB"/>
      <stop offset="25%" stop-color="#FEF08A"/>
      <stop offset="60%" stop-color="#F4AF23"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <path d="M16 2.5L26.5 6.2V15.8C26.5 22.3 22 27.4 16 29.5C10 27.4 5.5 22.3 5.5 15.8V6.2L16 2.5Z" fill="url(#og-shield-bg)" stroke="url(#og-shield-border)" stroke-width="1.4" stroke-linejoin="round"/>
  <path d="M8.5 7.2L16 4.4L23.5 7.2" stroke="#FFFFFF" stroke-width="0.7" stroke-linecap="round" opacity="0.3"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 11.5L12 18.5L16 8.5L20 18.5L23.5 11.5L21.5 20.5H10.5L8.5 11.5ZM16 11.8L17.5 14.5L16 17.2L14.5 14.5L16 11.8Z" fill="url(#og-shield-crown)" stroke="#FFFBEB" stroke-width="0.4" stroke-linejoin="round"/>
  <rect x="9.5" y="22" width="13" height="1.8" rx="0.9" fill="url(#og-shield-crown)"/>
  <rect x="11" y="22.3" width="10" height="0.6" rx="0.3" fill="#FFFFFF" opacity="0.4"/>
</svg>
`;

// HTML template for the Master OG Image (1200x630)
function generateMasterHtml() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
  }

  body {
    width: 1200px;
    height: 630px;
    overflow: hidden;
    background: #040405;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    position: relative;
    display: flex;
    flex-direction: column;
    color: #FFFFFF;
  }

  .canvas-border {
    position: absolute;
    inset: 0;
    border: 1px solid rgba(255, 255, 255, 0.08);
    pointer-events: none;
    z-index: 50;
  }

  .ambient-glow {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    height: 320px;
    border-radius: 9999px;
    background: radial-gradient(circle, rgba(244, 175, 35, 0.16) 0%, rgba(244, 175, 35, 0.04) 45%, transparent 75%);
    filter: blur(130px);
    pointer-events: none;
    z-index: 1;
  }

  .grid-pattern {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(to right, #ffffff 1px, transparent 1px),
      linear-gradient(to bottom, #ffffff 1px, transparent 1px);
    background-size: 48px 48px;
    opacity: 0.018;
    mask-image: radial-gradient(ellipse at center, black 40%, transparent 85%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 85%);
    z-index: 2;
  }

  .content-wrapper {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 32px 52px 32px 52px;
    justify-content: space-between;
  }

  .nav-shell {
    width: 100%;
    background: rgba(12, 12, 16, 0.76);
    backdrop-filter: blur(24px) saturate(160%);
    -webkit-backdrop-filter: blur(24px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 9999px;
    padding: 8px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 
      inset 0 1px 0 0 rgba(255, 255, 255, 0.14),
      0 12px 32px -8px rgba(0, 0, 0, 0.6);
  }

  .brand-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo-icon {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand-name {
    font-size: 13.5px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .brand-gold { color: #F4AF23; }

  .brand-badge {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #A1A1AA;
    padding: 2.5px 8px;
    border-radius: 9999px;
    margin-left: 2px;
  }

  .nav-pills {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .nav-pill {
    font-size: 11.5px;
    font-weight: 500;
    color: #71717A;
    padding: 4px 12px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .nav-pill.active {
    background: rgba(255, 255, 255, 0.10);
    color: #FFFFFF;
    font-weight: 600;
    box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.14);
  }

  .nav-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #F4AF23;
    box-shadow: 0 0 6px #F4AF23;
  }

  .status-badge {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    font-weight: 600;
    color: #A1A1AA;
    padding: 3px 10px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10B981;
    box-shadow: 0 0 8px #10B981;
  }

  .main-split {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 48px;
    flex: 1;
    margin-top: 18px;
  }

  .left-content {
    flex: 1;
    max-width: 530px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .status-pill-subtle {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 4px 12px;
    border-radius: 9999px;
    background: rgba(14, 14, 18, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 11px;
    color: #A1A1AA;
    margin-bottom: 14px;
    width: fit-content;
  }

  .status-pill-subtle strong {
    color: #FFFFFF;
    font-family: 'JetBrains Mono', monospace;
  }

  .headline {
    font-size: 38px;
    font-weight: 900;
    letter-spacing: -0.035em;
    line-height: 1.14;
    color: #FFFFFF;
    margin-bottom: 12px;
  }

  .headline-gradient {
    color: #F4AF23;
    display: inline;
  }

  .description {
    font-size: 14px;
    line-height: 1.5;
    color: #A1A1AA;
    margin-bottom: 22px;
    max-width: 480px;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    max-width: 490px;
    margin-bottom: 20px;
  }

  .tool-card {
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 14px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .tool-info {
    display: flex;
    flex-direction: column;
  }

  .tool-name {
    font-size: 12px;
    font-weight: 700;
    color: #F4F4F5;
  }

  .tool-desc {
    font-size: 10px;
    color: #71717A;
    margin-top: 1px;
  }

  .tool-badge {
    font-size: 9px;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 2px 7px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: #A1A1AA;
  }

  .tool-badge.highlight {
    background: rgba(244, 175, 35, 0.1);
    border-color: rgba(244, 175, 35, 0.25);
    color: #F4AF23;
  }

  .domain-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: #52525B;
    font-family: 'JetBrains Mono', monospace;
  }

  .right-preview {
    width: 490px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .simulator-card {
    background: rgba(14, 14, 18, 0.78);
    backdrop-filter: blur(24px) saturate(140%);
    -webkit-backdrop-filter: blur(24px) saturate(140%);
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 22px;
    padding: 18px 20px 16px;
    box-shadow: 
      inset 0 1px 0 0 rgba(255, 255, 255, 0.16),
      0 20px 40px -15px rgba(0, 0, 0, 0.7);
    position: relative;
    overflow: hidden;
  }

  .card-top-glow {
    position: absolute;
    top: -24px;
    left: 50%;
    transform: translateX(-50%);
    width: 180px;
    height: 60px;
    background: rgba(244, 175, 35, 0.15);
    border-radius: 9999px;
    filter: blur(24px);
    pointer-events: none;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    margin-bottom: 14px;
    position: relative;
    z-index: 10;
  }

  .header-tag {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #A1A1AA;
  }

  .header-tag-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #F4AF23;
    box-shadow: 0 0 6px #F4AF23;
  }

  .engine-tag {
    font-size: 9.5px;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: #A1A1AA;
  }

  .matchup-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 10;
    padding: 0 4px;
  }

  .team-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 120px;
    text-align: center;
  }

  .crest-box {
    width: 58px;
    height: 58px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
  }

  .crest-img {
    width: 52px;
    height: 52px;
    object-fit: contain;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
  }

  .team-label {
    font-size: 13.5px;
    font-weight: 700;
    color: #FFFFFF;
    line-height: 1.1;
    margin-bottom: 2px;
  }

  .president-sub {
    font-size: 10px;
    color: #71717A;
    white-space: nowrap;
  }

  .score-capsule-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .score-capsule {
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 7px 18px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .score-digit {
    font-family: 'JetBrains Mono', monospace;
    font-size: 27px;
    font-weight: 900;
    color: #FFFFFF;
    width: 22px;
    text-align: center;
    line-height: 1;
  }

  .score-colon {
    font-size: 15px;
    font-weight: 300;
    color: #52525B;
  }

  .result-pill {
    font-size: 9.5px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700;
    color: #F4AF23;
    background: rgba(244, 175, 35, 0.1);
    border: 1px solid rgba(244, 175, 35, 0.2);
    padding: 2px 8px;
    border-radius: 9999px;
  }

  .card-footer-insight {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    text-align: center;
    font-size: 11.5px;
    color: #A1A1AA;
    position: relative;
    z-index: 10;
  }

  .card-footer-insight strong { color: #FFFFFF; }

  .standings-widget {
    background: rgba(14, 14, 18, 0.70);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 12px 18px;
    box-shadow: 
      inset 0 1px 0 0 rgba(255, 255, 255, 0.12),
      0 12px 28px -10px rgba(0, 0, 0, 0.5);
  }

  .standings-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .standings-title {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #A1A1AA;
  }

  .standings-sub {
    font-size: 9.5px;
    font-family: 'JetBrains Mono', monospace;
    color: #10B981;
    background: rgba(16, 185, 129, 0.1);
    padding: 1.5px 7px;
    border-radius: 9999px;
  }

  .table-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 3.5px 0;
    font-size: 11.5px;
  }

  .row-team-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #F4F4F5;
  }

  .rank-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    font-weight: 700;
    color: #F4AF23;
    width: 14px;
  }

  .rank-num.other { color: #71717A; }

  .mini-crest {
    width: 17px;
    height: 17px;
    object-fit: contain;
  }

  .row-stats-cell {
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #71717A;
  }

  .pts-val {
    color: #FFFFFF;
    font-weight: 700;
  }

</style>
</head>
<body>
  <div class="canvas-border"></div>
  <div class="ambient-glow"></div>
  <div class="grid-pattern"></div>

  <div class="content-wrapper">
    <header class="nav-shell">
      <div class="brand-group">
        <div class="logo-icon">
          ${kingsLeagueCrownSvg}
        </div>
        <div class="brand-name">
          <span class="brand-gold">Kings</span>
          <span>League</span>
          <span class="brand-badge">Simulador</span>
        </div>
      </div>

      <nav class="nav-pills">
        <div class="nav-pill active">
          <span class="nav-dot"></span>
          <span>Simulador</span>
        </div>
        <div class="nav-pill">Classificação</div>
        <div class="nav-pill">Playoffs</div>
        <div class="nav-pill">Tier List</div>
        <div class="nav-pill">12a0</div>
      </nav>

      <div class="status-badge">
        <span class="pulse-dot"></span>
        <span>Temporada Oficial 2026</span>
      </div>
    </header>

    <div class="main-split">
      <div class="left-content">
        <div class="status-pill-subtle">
          <span>+</span>
          <strong>100.000</strong>
          <span>simulações realizadas • 100% Gratuito</span>
        </div>

        <h1 class="headline">
          Descubra o Futuro do seu Time na
          <span class="headline-gradient">Kings League</span>
        </h1>

        <p class="description">
          Simule os placares de cada rodada, veja a tabela mudar em tempo real e descubra as chances reais de classificação para os Playoffs e a Final Four.
        </p>

        <div class="tools-grid">
          <div class="tool-card">
            <div class="tool-info">
              <span class="tool-name">Simulador de Rodadas</span>
              <span class="tool-desc">Projete jogos e cruze os Playoffs</span>
            </div>
            <span class="tool-badge highlight">Principal</span>
          </div>

          <div class="tool-card">
            <div class="tool-info">
              <span class="tool-name">Tabela & Classificação</span>
              <span class="tool-desc">Pontos e saldo em tempo real</span>
            </div>
            <span class="tool-badge">Ao Vivo</span>
          </div>

          <div class="tool-card">
            <div class="tool-info">
              <span class="tool-name">Tier List dos Times</span>
              <span class="tool-desc">Ranqueie os clubes da liga</span>
            </div>
            <span class="tool-badge">Comunidade</span>
          </div>

          <div class="tool-card">
            <div class="tool-info">
              <span class="tool-name">Modo 12a0</span>
              <span class="tool-desc">Desafios e cartas especiais</span>
            </div>
            <span class="tool-badge">Modo</span>
          </div>
        </div>

        <div class="domain-row">
          <span>kings-league-simulator.vercel.app</span>
        </div>
      </div>

      <div class="right-preview">
        <div class="simulator-card">
          <div class="card-top-glow"></div>

          <div class="card-header">
            <div class="header-tag">
              <span class="header-tag-dot"></span>
              <span>Confronto Direto</span>
            </div>
            <span class="engine-tag">Motor Preditivo</span>
          </div>

          <div class="matchup-row">
            <div class="team-unit">
              <div class="crest-box">
                <img class="crest-img" src="${logos.g3x}" alt="G3X FC">
              </div>
              <span class="team-label">G3X FC</span>
              <span class="president-sub">Gaules + Kelvin</span>
            </div>

            <div class="score-capsule-wrap">
              <div class="score-capsule">
                <span class="score-digit">3</span>
                <span class="score-colon">:</span>
                <span class="score-digit">2</span>
              </div>
              <span class="result-pill">Fim de Jogo</span>
            </div>

            <div class="team-unit">
              <div class="crest-box">
                <img class="crest-img" src="${logos.furia}" alt="FURIA FC">
              </div>
              <span class="team-label">FURIA FC</span>
              <span class="president-sub">Neymar + Falcão</span>
            </div>
          </div>

          <div class="card-footer-insight">
            <span>🔥 <strong>G3X FC</strong> vence e assume a liderança provisória na tabela!</span>
          </div>
        </div>

        <div class="standings-widget">
          <div class="standings-top-bar">
            <span class="standings-title">Tabela de Classificação</span>
            <span class="standings-sub">Playoffs Top 4</span>
          </div>

          <div class="table-row">
            <div class="row-team-cell">
              <span class="rank-num">1º</span>
              <img class="mini-crest" src="${logos.g3x}" alt="G3X">
              <span>G3X FC</span>
            </div>
            <div class="row-stats-cell">
              <span>8V - 1D</span>
              <span class="pts-val">24 pts</span>
            </div>
          </div>

          <div class="table-row">
            <div class="row-team-cell">
              <span class="rank-num">2º</span>
              <img class="mini-crest" src="${logos.furia}" alt="FURIA">
              <span>FURIA FC</span>
            </div>
            <div class="row-stats-cell">
              <span>7V - 2D</span>
              <span class="pts-val">22 pts</span>
            </div>
          </div>

          <div class="table-row">
            <div class="row-team-cell">
              <span class="rank-num other">3º</span>
              <img class="mini-crest" src="${logos.fluxo}" alt="FLUXO">
              <span>Fluxo FC</span>
            </div>
            <div class="row-stats-cell">
              <span>6V - 3D</span>
              <span class="pts-val">20 pts</span>
            </div>
          </div>

          <div class="table-row">
            <div class="row-team-cell">
              <span class="rank-num other">4º</span>
              <img class="mini-crest" src="${logos.dendele}" alt="DENDELÊ">
              <span>Dendelê FC</span>
            </div>
            <div class="row-stats-cell">
              <span>6V - 3D</span>
              <span class="pts-val">18 pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// HTML template for the Tier List OG Image (1200x630)
function generateTierListHtml() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
  }

  body {
    width: 1200px;
    height: 630px;
    overflow: hidden;
    background: #040405;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    position: relative;
    display: flex;
    flex-direction: column;
    color: #FFFFFF;
  }

  .canvas-border {
    position: absolute;
    inset: 0;
    border: 1px solid rgba(255, 255, 255, 0.08);
    pointer-events: none;
    z-index: 50;
  }

  .ambient-glow {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    height: 320px;
    border-radius: 9999px;
    background: radial-gradient(circle, rgba(244, 175, 35, 0.14) 0%, rgba(244, 175, 35, 0.03) 45%, transparent 75%);
    filter: blur(130px);
    pointer-events: none;
    z-index: 1;
  }

  .grid-pattern {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(to right, #ffffff 1px, transparent 1px),
      linear-gradient(to bottom, #ffffff 1px, transparent 1px);
    background-size: 48px 48px;
    opacity: 0.018;
    mask-image: radial-gradient(ellipse at center, black 40%, transparent 85%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 85%);
    z-index: 2;
  }

  .content-wrapper {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 32px 52px 32px 52px;
    justify-content: space-between;
  }

  .nav-shell {
    width: 100%;
    background: rgba(12, 12, 16, 0.76);
    backdrop-filter: blur(24px) saturate(160%);
    -webkit-backdrop-filter: blur(24px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 9999px;
    padding: 8px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 
      inset 0 1px 0 0 rgba(255, 255, 255, 0.14),
      0 12px 32px -8px rgba(0, 0, 0, 0.6);
  }

  .brand-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo-icon {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand-name {
    font-size: 13.5px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .brand-gold { color: #F4AF23; }

  .brand-badge {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #A1A1AA;
    padding: 2.5px 8px;
    border-radius: 9999px;
    margin-left: 2px;
  }

  .nav-pills {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .nav-pill {
    font-size: 11.5px;
    font-weight: 500;
    color: #71717A;
    padding: 4px 12px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .nav-pill.active {
    background: rgba(255, 255, 255, 0.10);
    color: #FFFFFF;
    font-weight: 600;
    box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.14);
  }

  .nav-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #F4AF23;
    box-shadow: 0 0 6px #F4AF23;
  }

  .status-badge {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    font-weight: 600;
    color: #A1A1AA;
    padding: 3px 10px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #F4AF23;
    box-shadow: 0 0 8px #F4AF23;
  }

  .main-split {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 48px;
    flex: 1;
    margin-top: 18px;
  }

  .left-content {
    flex: 1;
    max-width: 510px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .status-pill-subtle {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 4px 12px;
    border-radius: 9999px;
    background: rgba(14, 14, 18, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 11px;
    color: #A1A1AA;
    margin-bottom: 14px;
    width: fit-content;
  }

  .headline {
    font-size: 38px;
    font-weight: 900;
    letter-spacing: -0.035em;
    line-height: 1.14;
    color: #FFFFFF;
    margin-bottom: 12px;
  }

  .headline-gradient {
    color: #F4AF23;
    display: inline;
  }

  .description {
    font-size: 14px;
    line-height: 1.5;
    color: #A1A1AA;
    margin-bottom: 22px;
    max-width: 470px;
  }

  .feature-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
  }

  .feature-chip {
    font-size: 11px;
    font-weight: 600;
    color: #D4D4D8;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 4px 11px;
    border-radius: 9999px;
  }

  .domain-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: #52525B;
    font-family: 'JetBrains Mono', monospace;
  }

  .right-preview {
    width: 520px;
    display: flex;
    flex-direction: column;
  }

  .tier-container {
    background: #09090D;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 
      inset 0 1px 0 0 rgba(255, 255, 255, 0.12),
      0 20px 45px -12px rgba(0, 0, 0, 0.7);
  }

  .tier-board-header {
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .tier-board-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #A1A1AA;
  }

  .tier-board-status {
    font-size: 9.5px;
    font-family: 'JetBrains Mono', monospace;
    color: #F4AF23;
  }

  .tier-row-block {
    display: flex;
    align-items: stretch;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    height: 60px;
  }

  .tier-row-block:last-child {
    border-bottom: none;
  }

  .tier-tag-label {
    width: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 900;
    color: #000000;
    flex-shrink: 0;
  }

  .tier-s { background: #FF7F7F; }
  .tier-a { background: #FFBF7F; }
  .tier-b { background: #FFDF7F; }
  .tier-c { background: #BFFF7F; }
  .tier-d { background: #7FBFFF; }

  .tier-team-tray {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 16px;
    flex: 1;
    background: #09090D;
  }

  .team-chip-minimal {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 4px 12px 4px 6px;
    border-radius: 12px;
  }

  .chip-crest {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chip-crest img {
    width: 28px;
    height: 28px;
    object-fit: contain;
  }

  .chip-name {
    font-size: 12px;
    font-weight: 700;
    color: #FFFFFF;
  }

</style>
</head>
<body>
  <div class="canvas-border"></div>
  <div class="ambient-glow"></div>
  <div class="grid-pattern"></div>

  <div class="content-wrapper">
    <header class="nav-shell">
      <div class="brand-group">
        <div class="logo-icon">
          ${kingsLeagueCrownSvg}
        </div>
        <div class="brand-name">
          <span class="brand-gold">Kings</span>
          <span>League</span>
          <span class="brand-badge">Tier List</span>
        </div>
      </div>

      <nav class="nav-pills">
        <div class="nav-pill">Simulador</div>
        <div class="nav-pill">Classificação</div>
        <div class="nav-pill">Playoffs</div>
        <div class="nav-pill active">
          <span class="nav-dot"></span>
          <span>Tier List</span>
        </div>
        <div class="nav-pill">12a0</div>
      </nav>

      <div class="status-badge">
        <span class="pulse-dot"></span>
        <span>Ranking da Comunidade</span>
      </div>
    </header>

    <div class="main-split">
      <div class="left-content">
        <div class="status-pill-subtle">
          <span>Ranking Interativo dos Torcedores • 100% Gratuito</span>
        </div>

        <h1 class="headline">
          Crie sua Tier List dos Times da
          <span class="headline-gradient">Kings League</span>
        </h1>

        <p class="description">
          Classifique os 10 clubes oficiais de S a D, customize os nomes das categorias e compartilhe o seu ranking definitivo com a comunidade.
        </p>

        <div class="feature-row">
          <span class="feature-chip">10 Clubes Oficiais</span>
          <span class="feature-chip">Drag & Drop Interativo</span>
          <span class="feature-chip">Exportação HD</span>
        </div>

        <div class="domain-row">
          <span>kings-league-simulator.vercel.app/tier-list</span>
        </div>
      </div>

      <div class="right-preview">
        <div class="tier-container">
          <div class="tier-board-header">
            <span class="tier-board-title">Tier List • Clubes 2026</span>
            <span class="tier-board-status">10 times classificados</span>
          </div>

          <div class="tier-row-block">
            <div class="tier-tag-label tier-s">S</div>
            <div class="tier-team-tray">
              <div class="team-chip-minimal">
                <div class="chip-crest"><img src="${logos.g3x}" alt="G3X"></div>
                <span class="chip-name">G3X FC</span>
              </div>
              <div class="team-chip-minimal">
                <div class="chip-crest"><img src="${logos.furia}" alt="FURIA"></div>
                <span class="chip-name">FURIA FC</span>
              </div>
            </div>
          </div>

          <div class="tier-row-block">
            <div class="tier-tag-label tier-a">A</div>
            <div class="tier-team-tray">
              <div class="team-chip-minimal">
                <div class="chip-crest"><img src="${logos.fluxo}" alt="FLUXO"></div>
                <span class="chip-name">Fluxo FC</span>
              </div>
              <div class="team-chip-minimal">
                <div class="chip-crest"><img src="${logos.loud}" alt="LOUD"></div>
                <span class="chip-name">LOUD SC</span>
              </div>
            </div>
          </div>

          <div class="tier-row-block">
            <div class="tier-tag-label tier-b">B</div>
            <div class="tier-team-tray">
              <div class="team-chip-minimal">
                <div class="chip-crest"><img src="${logos.dendele}" alt="DENDELÊ"></div>
                <span class="chip-name">Dendelê FC</span>
              </div>
              <div class="team-chip-minimal">
                <div class="chip-crest"><img src="${logos.capim}" alt="CAPIM"></div>
                <span class="chip-name">Capim FC</span>
              </div>
            </div>
          </div>

          <div class="tier-row-block">
            <div class="tier-tag-label tier-c">C</div>
            <div class="tier-team-tray">
              <div class="team-chip-minimal">
                <div class="chip-crest"><img src="${logos.podpah}" alt="PODPAH"></div>
                <span class="chip-name">Podpah FC</span>
              </div>
              <div class="team-chip-minimal">
                <div class="chip-crest"><img src="${logos.nyvelados}" alt="NYVELADOS"></div>
                <span class="chip-name">Nyvelados</span>
              </div>
            </div>
          </div>

          <div class="tier-row-block">
            <div class="tier-tag-label tier-d">D</div>
            <div class="tier-team-tray">
              <div class="team-chip-minimal">
                <div class="chip-crest"><img src="${logos.dibrados}" alt="DIBRADOS"></div>
                <span class="chip-name">Dibrados</span>
              </div>
              <div class="team-chip-minimal">
                <div class="chip-crest"><img src="${logos.desimpain}" alt="DESIMPAIN"></div>
                <span class="chip-name">DesimpaiN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// HTML template for the 12a0 Mode OG Image (1200x630)
function generate12a0Html() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
  }

  body {
    width: 1200px;
    height: 630px;
    overflow: hidden;
    background: #040405;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    position: relative;
    display: flex;
    flex-direction: column;
    color: #FFFFFF;
  }

  .canvas-border {
    position: absolute;
    inset: 0;
    border: 1px solid rgba(255, 255, 255, 0.08);
    pointer-events: none;
    z-index: 50;
  }

  .ambient-glow {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    height: 320px;
    border-radius: 9999px;
    background: radial-gradient(circle, rgba(244, 175, 35, 0.16) 0%, rgba(244, 175, 35, 0.04) 45%, transparent 75%);
    filter: blur(130px);
    pointer-events: none;
    z-index: 1;
  }

  .grid-pattern {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(to right, #ffffff 1px, transparent 1px),
      linear-gradient(to bottom, #ffffff 1px, transparent 1px);
    background-size: 48px 48px;
    opacity: 0.018;
    mask-image: radial-gradient(ellipse at center, black 40%, transparent 85%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 85%);
    z-index: 2;
  }

  .content-wrapper {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 32px 52px 32px 52px;
    justify-content: space-between;
  }

  /* Top Navigation Shell */
  .nav-shell {
    width: 100%;
    background: rgba(12, 12, 16, 0.76);
    backdrop-filter: blur(24px) saturate(160%);
    -webkit-backdrop-filter: blur(24px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 9999px;
    padding: 8px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 
      inset 0 1px 0 0 rgba(255, 255, 255, 0.14),
      0 12px 32px -8px rgba(0, 0, 0, 0.6);
  }

  .brand-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo-icon {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand-name {
    font-size: 13.5px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .brand-gold { color: #F4AF23; }

  .brand-badge {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #A1A1AA;
    padding: 2.5px 8px;
    border-radius: 9999px;
    margin-left: 2px;
  }

  .nav-pills {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .nav-pill {
    font-size: 11.5px;
    font-weight: 500;
    color: #71717A;
    padding: 4px 12px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .nav-pill.active {
    background: rgba(255, 255, 255, 0.10);
    color: #FFFFFF;
    font-weight: 600;
    box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.14);
  }

  .nav-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #F4AF23;
    box-shadow: 0 0 6px #F4AF23;
  }

  .status-badge {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    font-weight: 600;
    color: #A1A1AA;
    padding: 3px 10px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #F4AF23;
    box-shadow: 0 0 8px #F4AF23;
  }

  .main-split {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 48px;
    flex: 1;
    margin-top: 18px;
  }

  .left-content {
    flex: 1;
    max-width: 530px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .status-pill-subtle {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 4px 12px;
    border-radius: 9999px;
    background: rgba(14, 14, 18, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 11px;
    color: #A1A1AA;
    margin-bottom: 14px;
    width: fit-content;
  }

  .headline {
    font-size: 38px;
    font-weight: 900;
    letter-spacing: -0.035em;
    line-height: 1.14;
    color: #FFFFFF;
    margin-bottom: 12px;
  }

  .headline-gradient {
    color: #F4AF23;
    display: inline;
  }

  .description {
    font-size: 14px;
    line-height: 1.5;
    color: #A1A1AA;
    margin-bottom: 22px;
    max-width: 480px;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    max-width: 490px;
    margin-bottom: 20px;
  }

  .tool-card {
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 14px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .tool-info {
    display: flex;
    flex-direction: column;
  }

  .tool-name {
    font-size: 12px;
    font-weight: 700;
    color: #F4F4F5;
  }

  .tool-desc {
    font-size: 10px;
    color: #71717A;
    margin-top: 1px;
  }

  .tool-badge {
    font-size: 9px;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 2px 7px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: #A1A1AA;
  }

  .tool-badge.highlight {
    background: rgba(244, 175, 35, 0.1);
    border-color: rgba(244, 175, 35, 0.25);
    color: #F4AF23;
  }

  .domain-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: #52525B;
    font-family: 'JetBrains Mono', monospace;
  }

  /* Right column - Tactical 7v7 Pitch Showcase */
  .right-preview {
    width: 490px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Sorteio Card */
  .sorteio-card {
    background: rgba(14, 14, 18, 0.78);
    backdrop-filter: blur(24px) saturate(140%);
    -webkit-backdrop-filter: blur(24px) saturate(140%);
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 18px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 
      inset 0 1px 0 0 rgba(255, 255, 255, 0.14),
      0 12px 28px -10px rgba(0, 0, 0, 0.5);
  }

  .sorteio-team {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sorteio-crest {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sorteio-crest img {
    width: 34px;
    height: 34px;
    object-fit: contain;
  }

  .sorteio-title-sub {
    font-size: 9px;
    font-bold;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #71717A;
  }

  .sorteio-name {
    font-size: 15px;
    font-weight: 800;
    color: #FFFFFF;
    line-height: 1.1;
  }

  .sorteio-tag {
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    color: #F4AF23;
    background: rgba(244, 175, 35, 0.1);
    border: 1px solid rgba(244, 175, 35, 0.25);
    padding: 4px 10px;
    border-radius: 9999px;
  }

  /* Tactical 7v7 Pitch Field */
  .pitch-card {
    background: #07070B;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 22px;
    padding: 18px 20px 14px;
    position: relative;
    overflow: hidden;
    box-shadow: 
      inset 0 1px 0 0 rgba(255, 255, 255, 0.12),
      0 20px 45px -12px rgba(0, 0, 0, 0.7);
  }

  .pitch-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .pitch-title {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #A1A1AA;
  }

  .pitch-chemistry {
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    color: #10B981;
    background: rgba(16, 185, 129, 0.1);
    padding: 2px 8px;
    border-radius: 9999px;
  }

  /* Tactical Pitch Outline */
  .pitch-surface {
    height: 185px;
    background: rgba(255, 255, 255, 0.015);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 14px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 10px 0;
  }

  .pitch-half-line {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .pitch-center-circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  /* Formation Lines (1-2-3-1) */
  .formation-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 36px;
    z-index: 10;
  }

  .player-node {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .node-pill {
    background: rgba(14, 14, 18, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
    padding: 3px 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .node-pill.star {
    border-color: rgba(244, 175, 35, 0.5);
    background: rgba(244, 175, 35, 0.12);
  }

  .node-name {
    font-size: 10px;
    font-weight: 700;
    color: #FFFFFF;
  }

  .node-ovr {
    font-size: 9.5px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 800;
    color: #F4AF23;
  }

  .pitch-footer-stats {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 10.5px;
    color: #71717A;
    font-family: 'JetBrains Mono', monospace;
  }

  .pitch-footer-stats strong {
    color: #FFFFFF;
  }

</style>
</head>
<body>
  <div class="canvas-border"></div>
  <div class="ambient-glow"></div>
  <div class="grid-pattern"></div>

  <div class="content-wrapper">
    <header class="nav-shell">
      <div class="brand-group">
        <div class="logo-icon">
          ${kingsLeagueCrownSvg}
        </div>
        <div class="brand-name">
          <span class="brand-gold">Kings</span>
          <span>League</span>
          <span class="brand-badge">Modo 12a0</span>
        </div>
      </div>

      <nav class="nav-pills">
        <div class="nav-pill">Simulador</div>
        <div class="nav-pill">Classificação</div>
        <div class="nav-pill">Playoffs</div>
        <div class="nav-pill">Tier List</div>
        <div class="nav-pill active">
          <span class="nav-dot"></span>
          <span>12a0</span>
        </div>
      </nav>

      <div class="status-badge">
        <span class="pulse-dot"></span>
        <span>Draft Tático & Campanha</span>
      </div>
    </header>

    <div class="main-split">
      <div class="left-content">
        <div class="status-pill-subtle">
          <span>Desafio Tático 7v7 • Modo Campanha Kings League</span>
        </div>

        <h1 class="headline">
          Monte seu Esquadrão e Vença no
          <span class="headline-gradient">Modo 12a0</span>
        </h1>

        <p class="description">
          Escale seu esquadrão no campo tático 7v7, role o dado para sortear os clubes, equilibre a química do elenco e vença a campanha contra os 10 adversários.
        </p>

        <div class="tools-grid">
          <div class="tool-card">
            <div class="tool-info">
              <span class="tool-name">Campo Tático 7v7</span>
              <span class="tool-desc">Formações & posições reais</span>
            </div>
            <span class="tool-badge highlight">1-2-3-1</span>
          </div>

          <div class="tool-card">
            <div class="tool-info">
              <span class="tool-name">Desafio do Dado</span>
              <span class="tool-desc">Sorteio dinâmico de clubes</span>
            </div>
            <span class="tool-badge">Sorteio</span>
          </div>

          <div class="tool-card">
            <div class="tool-info">
              <span class="tool-name">Modo Campanha</span>
              <span class="tool-desc">Enfrente a liga rodada a rodada</span>
            </div>
            <span class="tool-badge">Campanha</span>
          </div>

          <div class="tool-card">
            <div class="tool-info">
              <span class="tool-name">Química & Overalls</span>
              <span class="tool-desc">Avaliações reais dos atletas</span>
            </div>
            <span class="tool-badge">OVR 88.5</span>
          </div>
        </div>

        <div class="domain-row">
          <span>kings-league-simulator.vercel.app/12a0</span>
        </div>
      </div>

      <div class="right-preview">
        <!-- Sorteio Card -->
        <div class="sorteio-card">
          <div class="sorteio-team">
            <div class="sorteio-crest">
              <img src="${logos.g3x}" alt="G3X FC">
            </div>
            <div>
              <div class="sorteio-title-sub">Time Sorteado</div>
              <div class="sorteio-name">G3X FC</div>
            </div>
          </div>
          <span class="sorteio-tag">3 Re-sorteios</span>
        </div>

        <!-- Tactical Pitch Field -->
        <div class="pitch-card">
          <div class="pitch-header">
            <span class="pitch-title">Campo Tático 7v7 • Formação 1-2-3-1</span>
            <span class="pitch-chemistry">88.5 OVR • Química Alta</span>
          </div>

          <div class="pitch-surface">
            <div class="pitch-half-line"></div>
            <div class="pitch-center-circle"></div>

            <!-- FWD Row -->
            <div class="formation-row">
              <div class="player-node">
                <div class="node-pill star">
                  <span class="node-name">Kelvin</span>
                  <span class="node-ovr">92</span>
                </div>
              </div>
            </div>

            <!-- MID Row -->
            <div class="formation-row">
              <div class="player-node">
                <div class="node-pill star">
                  <span class="node-name">Falcão</span>
                  <span class="node-ovr">94</span>
                </div>
              </div>
              <div class="player-node">
                <div class="node-pill">
                  <span class="node-name">Lipão</span>
                  <span class="node-ovr">88</span>
                </div>
              </div>
              <div class="player-node">
                <div class="node-pill">
                  <span class="node-name">Leletti</span>
                  <span class="node-ovr">87</span>
                </div>
              </div>
            </div>

            <!-- DEF Row -->
            <div class="formation-row">
              <div class="player-node">
                <div class="node-pill">
                  <span class="node-name">Well</span>
                  <span class="node-ovr">86</span>
                </div>
              </div>
              <div class="player-node">
                <div class="node-pill">
                  <span class="node-name">Victor</span>
                  <span class="node-ovr">85</span>
                </div>
              </div>
            </div>

            <!-- GK Row -->
            <div class="formation-row">
              <div class="player-node">
                <div class="node-pill">
                  <span class="node-name">Barata</span>
                  <span class="node-ovr">89</span>
                </div>
              </div>
            </div>
          </div>

          <div class="pitch-footer-stats">
            <span>Dificuldade: <strong>Clássico</strong></span>
            <span>Estilo: <strong>Equilibrado</strong></span>
            <span>Campanha: <strong>Rodada 1 de 10</strong></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function renderCard(htmlContent, outputFilenames) {
  const tempDir = path.join(workspaceRoot, '.temp-og');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const htmlPath = path.join(tempDir, `og-preview-${Date.now()}.html`);
  fs.writeFileSync(htmlPath, htmlContent);

  const rawPngPath = path.join(tempDir, `og-raw-2x-${Date.now()}.png`);
  const browserPath = findBrowserExecutable();

  console.log(`[OG Generator] Rendering 2x screenshot via ${browserPath}...`);

  const fileUri = `file:///${htmlPath.replace(/\\/g, '/')}`;
  const cmd = `"${browserPath}" --headless=new --screenshot="${rawPngPath}" --window-size=1200,630 --force-device-scale-factor=2 --hide-scrollbars "${fileUri}"`;

  try {
    execSync(cmd, { stdio: 'pipe' });
  } catch (err) {
    console.error('[OG Generator] Error launching headless browser:', err.message);
    throw err;
  }

  if (!fs.existsSync(rawPngPath)) {
    throw new Error(`Screenshot file was not generated: ${rawPngPath}`);
  }

  console.log(`[OG Generator] Downsampling to 1200x630 with Sharp Lanczos3 & compressing...`);

  for (const filename of outputFilenames) {
    const targetPath = path.join(workspaceRoot, 'public', filename);
    await sharp(rawPngPath)
      .resize(1200, 630, {
        kernel: sharp.kernel.lanczos3,
      })
      .png({
        compressionLevel: 9,
        palette: false,
      })
      .toFile(targetPath);
    console.log(`  ✓ Generated: public/${filename} (1200x630)`);
  }

  // Clean temp files
  try {
    if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);
    if (fs.existsSync(rawPngPath)) fs.unlinkSync(rawPngPath);
  } catch {
    // ignore
  }
}

async function run() {
  console.log('========================================');
  console.log('⚡ KINGS LEAGUE OG IMAGE GENERATOR');
  console.log('========================================');

  const args = process.argv.slice(2);
  const targetType = args.find((a) => a.startsWith('--type='))?.split('=')[1] || 'all';

  if (targetType === 'all' || targetType === 'master' || targetType === 'main') {
    console.log('\nGenerating Master OG image (Clash & Simulator)...');
    await renderCard(generateMasterHtml(), [
      'og-image.png',
      'og-image-x.png',
      'og.png',
    ]);
  }

  if (targetType === 'all' || targetType === 'tier-list') {
    console.log('\nGenerating Tier List OG image...');
    await renderCard(generateTierListHtml(), ['og-tier-list.png']);
  }

  if (targetType === 'all' || targetType === '12a0' || targetType === 'doze') {
    console.log('\nGenerating Modo 12a0 OG image...');
    await renderCard(generate12a0Html(), ['og-12a0.png']);
  }

  // Cleanup temp dir if empty
  const tempDir = path.join(workspaceRoot, '.temp-og');
  try {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  } catch {
    // ignore
  }

  console.log('\n🚀 OG Generation completed successfully!');
}

run().catch((err) => {
  console.error('[OG Generator] Fatal error:', err);
  process.exit(1);
});
