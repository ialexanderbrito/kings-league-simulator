export class DateFormatter {
  static formatMatchDate(dateString: string): string {
    if (typeof window === 'undefined') {
      return dateString;
    }

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dateString;
    }
  }

  static formatDateForGrouping(dateString: string): string {
    if (typeof window === 'undefined') {
      return dateString.split('T')[0];
    }

    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } catch (error) {
      console.error("Erro ao formatar data para agrupamento:", error);
      return dateString.split('T')[0];
    }
  }

  static formatDateDisplay(dateString: string): string {
    if (typeof window === 'undefined') {
      return dateString;
    }

    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0);

      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }).format(date);
    } catch (error) {
      console.error("Erro ao formatar exibição da data:", error);
      return dateString;
    }
  }

  static getWeekdayName(dateString: string): string {
    if (typeof window === 'undefined') {
      return "";
    }

    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0);
      return new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date).replace(".", "");
    } catch (error) {
      console.error("Erro ao obter dia da semana:", error);
      return "";
    }
  }
}