"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Team } from '@/types/kings-league';

interface TeamThemeContextType {
  favoriteTeam: Team | null;
  setFavoriteTeam: (team: Team | null) => void;
  primaryColor: string;
  secondaryColor: string;
}

const defaultColors = {
  primaryColor: '#F4AF23', // Cor amarela padrão
  secondaryColor: '#333333', // Cor secundária padrão
}

const TeamThemeContext = createContext<TeamThemeContextType>({
  favoriteTeam: null,
  setFavoriteTeam: () => { },
  ...defaultColors,
});

export function useTeamTheme() {
  return useContext(TeamThemeContext);
}

export function TeamThemeProvider({ children }: { children: React.ReactNode }) {
  const [favoriteTeam, setFavoriteTeam] = useState<Team | null>(null);
  const [primaryColor, setPrimaryColor] = useState(defaultColors.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(defaultColors.secondaryColor);
  const [mounted, setMounted] = useState(false);

  // Função para escolher a cor primária com base nas cores do time
  const choosePrimaryColor = (team: Team | null) => {
    if (!team) return defaultColors.primaryColor;

    // Se a cor primária for preta ou muito escura, use a cor secundária
    const isFirstColorDark = team.firstColorHEX === '#000000' ||
      team.firstColorHEX === '#000' ||
      isVeryDarkColor(team.firstColorHEX);

    return isFirstColorDark ? team.secondColorHEX : team.firstColorHEX;
  }

  // Função para verificar se uma cor é muito escura
  const isVeryDarkColor = (hex: string) => {
    // Converter hex para RGB
    const rgb = hexToRgb(hex);
    if (!rgb) return false;

    // Calcular luminosidade (fórmula comum para luminosidade perceptível)
    const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;

    // Se a luminosidade for menor que 40, é uma cor muito escura
    return luminance < 40;
  }

  // Função para converter hex para RGB
  const hexToRgb = (hex: string) => {
    // Remover # se presente
    hex = hex.replace(/^#/, '');

    // Converter para valores RGB
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const bigint = parseInt(hex, 16);
    if (isNaN(bigint)) return null;

    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  // Carregar time favorito do localStorage ao iniciar
  useEffect(() => {
    setMounted(true);
    const savedTeam = localStorage.getItem('@kl-simulador:favoriteTeam');

    if (savedTeam) {
      try {
        const team = JSON.parse(savedTeam);
        setFavoriteTeam(team);

        // Configurar cores com base no time favorito
        const primary = choosePrimaryColor(team);
        setPrimaryColor(primary);
        setSecondaryColor(team.secondColorHEX);

        // Aplicar as cores como variáveis CSS
        document.documentElement.style.setProperty('--team-primary', primary);
        document.documentElement.style.setProperty('--team-secondary', team.secondColorHEX);
      } catch (error) {
        // Restaurar para as cores padrão
        setPrimaryColor(defaultColors.primaryColor);
        setSecondaryColor(defaultColors.secondaryColor);
        document.documentElement.style.setProperty('--team-primary', defaultColors.primaryColor);
        document.documentElement.style.setProperty('--team-secondary', defaultColors.secondaryColor);
      }
    }
  }, []);

  // Atualizar localStorage e aplicar cores quando o time favorito mudar
  useEffect(() => {
    if (!mounted) return;

    if (favoriteTeam) {
      localStorage.setItem('@kl-simulador:favoriteTeam', JSON.stringify(favoriteTeam));

      // Escolher cor primária com base nas cores do time
      const primary = choosePrimaryColor(favoriteTeam);
      setPrimaryColor(primary);
      setSecondaryColor(favoriteTeam.secondColorHEX);

      // Aplicar as cores como variáveis CSS
      document.documentElement.style.setProperty('--team-primary', primary);
      document.documentElement.style.setProperty('--team-secondary', favoriteTeam.secondColorHEX);
    } else {
      localStorage.removeItem('@kl-simulador:favoriteTeam');

      // Restaurar para as cores padrão
      setPrimaryColor(defaultColors.primaryColor);
      setSecondaryColor(defaultColors.secondaryColor);
      document.documentElement.style.setProperty('--team-primary', defaultColors.primaryColor);
      document.documentElement.style.setProperty('--team-secondary', defaultColors.secondaryColor);
    }
  }, [favoriteTeam, mounted]);

  return (
    <TeamThemeContext.Provider
      value={{
        favoriteTeam,
        setFavoriteTeam,
        primaryColor,
        secondaryColor,
      }}
    >
      {children}
    </TeamThemeContext.Provider>
  );
}