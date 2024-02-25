import { Client } from 'pg';
import config from 'config';

import { EventTable, ExecutionTable, MatchTable } from '@/models/Database';
import { Match } from '@/models/Match';
import { ScriptNames } from '@/utils/enums';
import { isEuropeanMatch } from '@/utils/functions';

class DatabaseService {
  private client: Client;

  constructor() {
    this.client = new Client({
      host: config.get('database.host'),
      port: config.get('database.port'),
      database: config.get('database.database_name'),
      user: config.get('database.user'),
      password: process.env.DATABASE_PASSWORD
    });
  }

  async connect(): Promise<void> {
    this.client.connect();
  }

  async dispose(): Promise<void> {
    this.client.end();
  }

  getClient(): Client {
    return this.client
  }

  async saveMatch(match: Match): Promise<void> {
    if (!isEuropeanMatch(match)) {
      await this.saveNationalMatch(match);
    } else {
      await this.saveEuropeanMatch(match);
    }
  }

  private async saveNationalMatch(match: Match): Promise<void> {
    const matchRecords = await this.client.query<MatchTable>({
      text: `SELECT *
        FROM matches AS m
        WHERE m.home = $1 AND m.away = $2 AND m.competition = $3 AND m.season = $4`,
      values: [match.homeTeam, match.awayTeam, match.competition, match.season]
    });

    if (matchRecords.rowCount > 1) {
      throw new Error(`Found ${matchRecords.rowCount} record in database`);
    }

    if (matchRecords.rowCount == 0) {
      await this.client.query({
        text: `INSERT INTO matches (home, away, date, competition, season, has_changed, last_updated)
          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        values: [match.homeTeam, match.awayTeam, new Date(match.date), match.competition, match.season, true, new Date()]
      });
      
      return;
    }

    const matchRecord = matchRecords.rows[0];
    const matchDate = new Date( match.date );

    if (matchRecord.date.getTime() != matchDate.getTime()) {
      await this.client.query({
        text: `UPDATE matches
          SET date = $1, has_changed = $2, last_updated = $3
          WHERE id = $4`,
        values: [matchDate, true, new Date(), matchRecord.id]
      });
    }
  }

  private async saveEuropeanMatch(match: Match): Promise<void> {
    const exactMatchRecords = await this.client.query<MatchTable>({
      text: `SELECT *
        FROM matches AS m
        WHERE m.home = $1 AND m.away = $2 AND m.date = $4 AND m.competition = $3 AND m.season = $4`,
      values: [match.homeTeam, match.awayTeam, match.date, match.competition, match.season]
    });

    if (exactMatchRecords.rowCount > 1) {
      throw new Error(`Found ${exactMatchRecords.rowCount} record in database`);
    }

    if (exactMatchRecords.rowCount == 0) {
      await this.client.query({
        text: `INSERT INTO matches (home, away, date, competition, season, has_changed, last_updated)
          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        values: [match.homeTeam, match.awayTeam, new Date(match.date), match.competition, match.season, true, new Date()]
      });
      
      return;
    }
  }

  async getChangedMatches(): Promise<MatchTable[]> {
    const response = await this.client.query<MatchTable>({
      text: `SELECT * FROM matches
        WHERE has_changed = TRUE`,
      values: []
    });

    return response.rows;
  }

  async doesCalendarEventExists(match: MatchTable): Promise<[ boolean, string? ]> {
    const response = await this.client.query<EventTable>({
      text: `SELECT * FROM events
        WHERE home = $1 AND away = $2 AND competition = $3 AND season = $4`,
      values: [match.home, match.away, match.competition, match.season]
    });

    if (response.rowCount > 1) {
      throw new Error(`Found ${response.rowCount} record in database`);
    }

    const id = response.rows[0] != undefined ? response.rows[0].calendar_id : undefined;

    return [ response.rowCount > 0, id ];
  }

  async saveCalendarEvent(eventId: string, match: MatchTable): Promise<void> {
    await this.client.query({
      text: `INSERT INTO events (calendar_id, home, away, date, competition, season)
        VALUES ($1, $2, $3, $4, $5, $6)`,
      values: [eventId, match.home, match.away, match.date, match.competition, match.season]
    });
  }

  async updateCalendarEvent(eventId: string, match: MatchTable): Promise<void> {
    await this.client.query({
      text: `UPDATE events
        SET date = $1
        WHERE calendar_id = $2`,
      values: [match.date, eventId]
    });
  }

  async saveMatchUpdate(match: MatchTable): Promise<void> {
    await this.client.query({
      text: `UPDATE matches
        SET has_changed = FALSE
        WHERE id = $1`,
      values: [match.id]
    });
  }

  async createFailedExecutionLog(id: string, script: ScriptNames, date: Date, error?: string): Promise<void> {
    await this.createExecutionLog(id, script, false, date, error);
  }

  async createSuccessfulExecutionLog(id: string, script: ScriptNames, date: Date, error?: string): Promise<void> {
    await this.createExecutionLog(id, script, true, date, error);
  }

  private async createExecutionLog(id: string, script: ScriptNames, success: boolean, date: Date, error?: string): Promise<void> {
    await this.client.query<ExecutionTable>({
      text: `INSERT INTO executions (id, script_name, success, date, error)
        VALUES ($1, $2, $3, $4, $5)`,
      values: [id, script, success, date, error]
    });
  }
}

export default DatabaseService;