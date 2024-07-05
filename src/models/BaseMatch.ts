import { convertCompetitionName, convertDate, convertStartTime, convertTeamName } from "@/utils/functions";
import { ApiMatch } from "@/utils/interfaces";


export class BaseMatch {
  homeTeam: string;
  homeScore: number;
  awayTeam: string;
  awayScore: number;
  date: string;
  competition: string;
  round: string;
  matchday: string;
  startTime: string;

  match: ApiMatch;
  season: number;
  seasonId: number;

  constructor (match: ApiMatch, season: number, seasonId: number) {
    this.match = match;
    this.season = season;
    this.seasonId = seasonId;
  }


  initialize() {
    this.setHomeTeam();
    this.setHomeScore();
    this.setAwayTeam();
    this.setAwayScore();
    this.setDate();
    this.setCompetition();
    this.setRound();
    this.setMatchday();
    this.setStartTime();
  }

  protected setHomeScore(): void { this.homeScore = this.match.home_goal; }
  protected setAwayScore(): void { this.awayScore = this.match.away_goal; }
  protected setHomeTeam(): void { this.homeTeam = convertTeamName(this.match.home_team_name); }
  protected setAwayTeam(): void { this.awayTeam = convertTeamName(this.match.away_team_name); }
  protected setDate(): void { this.date = convertDate(this.match.date_time); }
  protected setCompetition(): void { this.competition = convertCompetitionName(this.match.championship_title); }
  protected setRound(): void { this.round = this.match.round_title; }
  protected setMatchday(): void { this.matchday = this.match.match_day_title; }
  protected setStartTime(): void { this.startTime = convertStartTime(this.match.match_hm); }

  print(): string {
    const message: string = `${ this.homeTeam.padStart(26, ' ') } - ${ this.awayTeam.padEnd(26, ' ') } | ${ this.date } | ${ this.competition }`;
    console.log( message );
    return message;
  }
}
