import { convertMonth, parseMonth, yearFromSeason } from "@/utils/functions";
import { Match } from "@/models/Match";

import * as cheerio from 'cheerio';

const teamsQuery: string = '.teams .team';
const dateQuery: string = '.match-details h3';
const competitionQuery: string = '.competition-logo';

const dateRegex: RegExp = /([A-Z]+) ([0-9]+) ([A-Z]+)/g;

class CurrentMatch extends Match {

  constructor($: cheerio.CheerioAPI, element: cheerio.Element, season: number) {
    super($, element, season);

    this.teamsQuery = teamsQuery;
    this.dateQuery = dateQuery;
    this.competitionQuery = competitionQuery;

    this.dateRegex = dateRegex;
  }

  setDate(): void {
    const date = this.getDate();
    this.date = this.formatDate(date, this.season);
  }

  formatDate(date: string, season: number): string {
    const day = date.replace(this.dateRegex, '$2');
    const month = convertMonth(date.replace(this.dateRegex, '$3'));
    const year = yearFromSeason(season, parseMonth(month));

    return `${day} ${month} ${year}`;
  }
}

export default CurrentMatch;