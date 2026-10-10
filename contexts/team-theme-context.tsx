"use client";

import React, { createContext, useContext, useEffect } from 'react';

interface TeamThemeContextType {
  primaryColor: string;
  secondaryColor: string;
}

const defaultColors = {
  primaryColor: '#F4AF23', // Cor dourada oficial da Kings League
  secondaryColor: '#333333',
};

const TeamThemeContext = createContext<TeamThemeContextType>(defaultColors);

export function useTeamTheme() {
  return useContext(TeamThemeContext);
}

export function TeamThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Purga chave legada de time favorito do localStorage
    try {
      localStorage.removeItem('@kl-simulador:favoriteTeam');
    } catch {
      // Ignora erro de acesso a localStorage
    }

    // Garante que a identidade visual permaneça fiel à oficial da Kings League
    document.documentElement.style.setProperty('--team-primary', defaultColors.primaryColor);
    document.documentElement.style.setProperty('--team-secondary', defaultColors.secondaryColor);
    document.documentElement.style.setProperty('--team-primary-rgb', '244, 175, 35');
  }, []);

  return (
    <TeamThemeContext.Provider value={defaultColors}>
      {children}
    </TeamThemeContext.Provider>
  );
}