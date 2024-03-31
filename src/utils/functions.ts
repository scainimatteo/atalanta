import { MatchTable } from "@/models/Database";
import { ApiCompetitions, Competitions } from "@/utils/enums";
import config from 'config';

export function convertTeamName(team: string): string {
  let convertedTeamNames: string[] = [];
  
  for (const name of team.split(' ')) {
    convertedTeamNames.push(`${name[0].toUpperCase()}${name.slice(1).toLowerCase()}`);
  }

  return convertedTeamNames.join(' ');
}

export function convertDate(date: string): string {
  let matchDate = new Date(date);
  matchDate = new Date(matchDate.toLocaleString('en-US', { timeZone: 'Europe/Rome' }));


  return `${matchDate.getFullYear().toString().padStart(4, ' ')}-${( matchDate.getMonth() + 1 ).toString().padStart(2, '0')}-${matchDate.getDate().toString().padStart(2, '0')}`;
}

export function convertStartTime(startTime: string): string {
  return startTime.split(':').slice(0, 2).join(':');
}

export function convertCompetitionName(competition: string): string {
  switch (competition.trim()) {
    case ApiCompetitions.SERIE_A:
      return Competitions.SERIE_A;
    case ApiCompetitions.COPPA_ITALIA_SHORT:
    case ApiCompetitions.COPPA_ITALIA:
      return Competitions.COPPA_ITALIA;
    case ApiCompetitions.EUROPA_LEAGUE_SHORT:
    case ApiCompetitions.EUROPA_LEAGUE:
      return Competitions.EUROPA_LEAGUE;
    case ApiCompetitions.CHAMPIONS_LEAGUE:
      return Competitions.CHAMPIONS_LEAGUE;
    default:
      return Competitions.SERIE_A;
  }
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
