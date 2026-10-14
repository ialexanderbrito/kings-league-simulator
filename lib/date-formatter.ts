export class DateFormatter {
  static formatMatchDate(dateString: string, locale: string = "pt-BR"): string {
    if (!dateString || dateString.trim() === '') {
      return locale === "en" ? "Time TBD" : locale === "es" ? "Horario no definido" : "Horário não definido";
    }

    if (typeof window === 'undefined') {
      return dateString;
    }

    try {
      const date = new Date(dateString);
      const intlLocale = locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR";
      return new Intl.DateTimeFormat(intlLocale, {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      return dateString;
    }
  }

  static formatDateForGrouping(dateString: string, locale: string = "pt-BR"): string {
    if (!dateString || dateString.trim() === '') {
      return locale === "en" ? "Date TBD" : locale === "es" ? "Fecha no definida" : "Data não definida";
    }

    if (typeof window === 'undefined') {
      return dateString.split('T')[0];
    }

    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } catch (error) {
      return dateString.split('T')[0];
    }
  }

  static formatDateDisplay(dateString: string, locale: string = "pt-BR"): string {
    if (!dateString || dateString.trim() === '') {
      return locale === "en" ? "Date not defined" : locale === "es" ? "Fecha no definida" : "Data ainda não definida";
    }

    if (typeof window === 'undefined') {
      return dateString;
    }

    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0);
      const intlLocale = locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR";

      return new Intl.DateTimeFormat(intlLocale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }).format(date);
    } catch (error) {
      return dateString;
    }
  }

  static getWeekdayName(dateString: string, locale: string = "pt-BR"): string {
    if (!dateString || dateString.trim() === '') {
      return "";
    }

    if (typeof window === 'undefined') {
      return "";
    }

    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0);
      const intlLocale = locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR";
      const formatted = new Intl.DateTimeFormat(intlLocale, { weekday: "short" }).format(date).replace(".", "");
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch (error) {
      return "";
    }
  }
}