import axios from "axios";
import * as cheerio from "cheerio";
import config from 'config';

import PreviousMatch from "@/models/PreviuosMatch";
import CurrentMatch from "@/models/CurrentMatch";
import NextMatch from "@/models/NextMatch";
import DatabaseService from "@/services/database";

class ScraperService {
  BASE_URL: string;
  QUERY_PARAM: string;
  SEASON: number;

  database: DatabaseService;

  constructor(database: DatabaseService) {
    this.database = database;

    this.BASE_URL = config.get('source.base_url');
    this.QUERY_PARAM = config.get('source.query_param');
    this.SEASON = config.get("source.season");
  }

  
  async execute(): Promise<void> {
    const response = await axios.get(`${this.BASE_URL}?${this.QUERY_PARAM}=${this.SEASON}`);
    const $ = cheerio.load(response.data);

    console.log('\n------------- PREV  MATCHES -------------');
    const previousMatchesList = $('#past-matches-list .item');
    for (const match of previousMatchesList) {
      const previousMatch = new PreviousMatch($, match, this.SEASON);
      previousMatch.initialize();
      await this.database.saveMatch(previousMatch);
      previousMatch.print();
    }

    if (!isCurrentSeason()) {
      return;
    }

    console.log('\n------------- CURRENT MATCH -------------');
    const currentMatchElement = $('#next-match-hero').get(0);
    const currentMatch = new CurrentMatch($, currentMatchElement, this.SEASON);
    currentMatch.initialize();
    await this.database.saveMatch(currentMatch);
    currentMatch.print();

    console.log('\n------------- NEXT  MATCHES -------------');
    const nextMatchesList = $('#next-matches-slider .item');
    for (const match of nextMatchesList) {
      const nextMatch = new NextMatch($, match, this.SEASON);
      nextMatch.initialize();
      await this.database.saveMatch(nextMatch);
      nextMatch.print();
    }
  }
}

function isCurrentSeason(): boolean {
  return config.get('source.season') == config.get('source.current_season');
}

export default ScraperService;