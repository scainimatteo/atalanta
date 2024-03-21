import { convertTeamName } from "@/utils/functions";
import { Competitions } from "@/utils/enums";

import * as cheerio from "cheerio";
import config from 'config';

export abstract class Match {
  homeTeam: string;
  awayTeam: string;
  date: string;
  competition: string;

  $: cheerio.CheerioAPI;
  match: cheerio.Element;
  season: number;

  teamsQuery: string;
  dateQuery: string;
  competitionQuery: string;

  dateRegex: RegExp;

  constructor ($: cheerio.CheerioAPI, match: cheerio.Element, season: number) {
    this.$ = $;
    this.match = match;
    this.season = season;
  }

  abstract formatDate(date: string, season: number): string;

  initialize() {
    this.setHomeTeam();
    this.setAwayTeam();
    this.setDate();
    this.setCompetition();
  }

  setHomeTeam(): void {
    this.homeTeam = convertTeamName( this.getTeams()[0]);
  }
  setAwayTeam(): void {
    this.awayTeam = convertTeamName( this.getTeams()[1] );
  }
  setDate(): void {
    this.date = this.getDate();
  }
  setCompetition(): void {
    this.competition = this.getCompetition();
  }


  print(): void {
    console.log( `${ this.homeTeam.padStart(18, ' ') } - ${ this.awayTeam.padEnd(18, ' ') } | ${ this.date } | ${ this.competition }` );
  }


  getTextFromElement(element: cheerio.Element) {
    return this.$(element).text();
  }
  getSrcFromElement(element: cheerio.Element) {
    return this.$(element).attr('src');
  }


  getTeams(): string[] {
    const matchTeams = this.$(this.match).find(this.teamsQuery).map((index, element) => this.getTextFromElement(element)).toArray();
    if (matchTeams.length != 2) {
      throw new Error(`Found ${matchTeams.length} teams`);
    }

    return matchTeams;
  }

  getCompetition(): string {
    const competitionImage = this.$(this.match).find(this.competitionQuery).map((index, element) => this.getSrcFromElement(element));
    if (competitionImage.length != 1) {
      throw new Error(`Found ${competitionImage.length} images`);
    }

    switch (competitionImage.get(0)) {
      case config.get('competitions.serie_a.logo'):
        return Competitions.SERIE_A;
      case config.get('competitions.europa_league.logo'):
      case config.get('competitions.europa_league.logo_light'):
        return Competitions.EUROPA_LEAGUE;
      case config.get('competitions.coppa_italia.logo'):
        return Competitions.COPPA_ITALIA;
      case config.get('competitions.champions_league.logo'):
        return Competitions.CHAMPIONS_LEAGUE;
      default:
        return Competitions.SERIE_A;
    }
  }

  getDate(): string {
    const matchDate = this.$(this.match).find(this.dateQuery).map((index, element) => this.getTextFromElement(element));
    if (matchDate.length != 1) {
      throw new Error(`Found ${matchDate.length} matches`);
    }

    return matchDate.get(0).replace(/\n/g, '').replace(/ +/g, ' ').trim();
  }

}
