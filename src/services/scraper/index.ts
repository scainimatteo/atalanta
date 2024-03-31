import axios from "axios";
import config from 'config';

import { ApiMatch } from "@/utils/interfaces";

import DatabaseService from "@/services/database";
import { BaseMatch } from "@/models/BaseMatch";

class ScraperService {
  BASE_URL: string;
  QUERY_PARAM: string;
  SEASON_PARAM: string;
  SEASON: number;
  SEASON_ID: number;

  database: DatabaseService;

  constructor(database: DatabaseService) {
    this.database = database;

    this.BASE_URL = config.get('source.base_url');
    this.QUERY_PARAM = config.get('source.query_param');
    this.SEASON_PARAM = config.get('source.season_param');
    this.SEASON = config.get("source.season");
    this.SEASON_ID = config.get("source.season_id");
  }

  async execute(): Promise<void> {
    const response = await axios.get(`${this.BASE_URL}?${this.QUERY_PARAM}&${this.SEASON_PARAM}=${this.SEASON_ID}`);
    console.log(`\nAPI: ${this.BASE_URL}?${this.QUERY_PARAM}&${this.SEASON_PARAM}=${this.SEASON_ID}\n`);

    const matchesList: ApiMatch[] = response.data.data;

    for (const matchData of matchesList) {
      const match = new BaseMatch(matchData, this.SEASON, this.SEASON_ID);
      match.initialize();
      match.print();
      await this.database.saveMatch(match);
    }
  }
  
}

export default ScraperService;
