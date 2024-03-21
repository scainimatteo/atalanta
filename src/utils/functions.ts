import { MatchTable } from "@/models/Database";
import { Match } from "@/models/Match";
import { Competitions, Months, MonthsTranslations } from "@/utils/enums";
import config from 'config';

export function parseMonth(month: string): number {
  switch (month.slice(0,3)) {
    case MonthsTranslations.GENNAIO:
      return 1;
    case MonthsTranslations.FEBBRAIO:
      return 2;
    case MonthsTranslations.MARZO:
      return 3;
    case MonthsTranslations.APRILE:
      return 4;
    case MonthsTranslations.MAGGIO:
      return 5;
    case MonthsTranslations.GIUGNO:
      return 6;
    case MonthsTranslations.LUGLIO:
      return 7;
    case MonthsTranslations.AGOSTO:
      return 8;
    case MonthsTranslations.SETTEMBRE:
      return 9;
    case MonthsTranslations.OTTOBRE:
      return 10;
    case MonthsTranslations.NOVEMBRE:
      return 11;
    case MonthsTranslations.DICEMBRE:
      return 12;
    default:
      return 0;
  }
}

export function convertMonth(month: string): string {
  switch (month.slice(0,3)) {
    case Months.GENNAIO:
      return MonthsTranslations.GENNAIO;
    case Months.FEBBRAIO:
      return MonthsTranslations.FEBBRAIO;
    case Months.MARZO:
      return MonthsTranslations.MARZO;
    case Months.APRILE:
      return MonthsTranslations.APRILE;
    case Months.MAGGIO:
      return MonthsTranslations.MAGGIO;
    case Months.GIUGNO:
      return MonthsTranslations.GIUGNO;
    case Months.LUGLIO:
      return MonthsTranslations.LUGLIO;
    case Months.AGOSTO:
      return MonthsTranslations.AGOSTO;
    case Months.SETTEMBRE:
      return MonthsTranslations.SETTEMBRE;
    case Months.OTTOBRE:
      return MonthsTranslations.OTTOBRE;
    case Months.NOVEMBRE:
      return MonthsTranslations.NOVEMBRE;
    case Months.DICEMBRE:
      return MonthsTranslations.DICEMBRE;
    default:
      return MonthsTranslations.GENNAIO;
  }
}

export function isEuropeanMatch(match: Match | MatchTable): boolean {
  switch (match.competition) {
    case Competitions.CHAMPIONS_LEAGUE:
    case Competitions.EUROPA_LEAGUE:
      return true;
    default:
      return false;
  }
}

export function yearFromSeason(season: number, month: number): number {
  if (month < 7) {
    return season + 1;
  }

  return season;
}

export function convertTeamName(team: string): string {
  let convertedTeamNames: string[] = [];
  
  for (const name of team.split(' ')) {
    convertedTeamNames.push(`${name[0].toUpperCase()}${name.slice(1).toLowerCase()}`);
  }

  return convertedTeamNames.join(' ');
}

export function createExecutionId(): string {
  const today = new Date();
  const year = today.getFullYear().toString();
  const month = (today.getMonth() + 1).toString();
  const day = today.getDate().toString();
  const hour = today.getHours().toString();
  const minute = today.getMinutes().toString();
  const second = today.getSeconds().toString();

  return `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}${hour.padStart(2, '0')}${minute.padStart(2, '0')}${second.padStart(2, '0')}`;
}

export function getCalendarId(match: MatchTable): string {
  switch (match.competition) {
    case Competitions.SERIE_A:
      return config.get('google_calendar.calendar_id.serie_a');
    case Competitions.COPPA_ITALIA:
      return config.get('google_calendar.calendar_id.coppa_italia');
    case Competitions.EUROPA_LEAGUE:
      return config.get('google_calendar.calendar_id.europa');
    case Competitions.CHAMPIONS_LEAGUE:
      return config.get('google_calendar.calendar_id.europa');
    default:
      return config.get('google_calendar.calendar_id.serie_a');
  }
}

export function formatGoogleCalendarDate(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
