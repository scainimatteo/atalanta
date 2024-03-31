import { Client } from 'pg';
import config from 'config';

import { EventTable, ExecutionTable, MatchTable } from '@/models/Database';
import { BaseMatch } from '@/models/BaseMatch';
import { ScriptNames } from '@/utils/enums';
import { convertDate } from '@/utils/functions';

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

  async saveMatch(match: BaseMatch): Promise<void> {
    const matchRecords = await this.client.query<MatchTable>({
      text: `SELECT *
        FROM matches AS m
        WHERE m.home = $1 AND m.away = $2 AND m.competition = $3 AND m.season = $4 AND m.round = $5`,
      values: [match.homeTeam, match.awayTeam, match.competition, match.season, match.round]
    });

    if (matchRecords.rowCount > 1) {
      throw new Error(`Found ${matchRecords.rowCount} record in database`);
    }

    if (matchRecords.rowCount == 0) {
      await this.client.query({
        text: `INSERT INTO matches (home, away, date, competition, season, has_changed, last_updated, start_time, home_goal, away_goal, round, match_day)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        values: [match.homeTeam, match.awayTeam, new Date(match.date), match.competition, match.season, true, new Date(), match.startTime, match.homeScore, match.awayScore, match.round, match.matchday]
      });
      console.log(`\t\t\tCREATED`);
      
      return;
    }

    const matchRecord = matchRecords.rows[0];
    const matchDate = new Date( match.date );

    if (convertDate(matchRecord.date.toString()) != convertDate(matchDate.toString())) {
      await this.client.query({
        text: `UPDATE matches
          SET date = $1, has_changed = $2, last_updated = $3
          WHERE id = $4`,
        values: [matchDate, true, new Date(), matchRecord.id]
      });
      console.log(`\t\t\tUPDATED`);
    }
  }

  async getChangedMatches(): Promise<MatchTable[]> {
    const response = await this.client.query<MatchTable>({
      text: `SELECT * FROM matches
        WHERE has_changed = TRUE
        ORDER BY id ASC`,
      values: []
    });

    return response.rows;
  }

  async doesCalendarEventExists(match: MatchTable): Promise<[ boolean, string? ]> {
    const response = await this.client.query<EventTable>({
      text: `SELECT * FROM events
        WHERE match_id = $1`,
      values: [match.id]
    });

    if (response.rowCount > 1) {
      throw new Error(`Found ${response.rowCount} record in database`);
    }

    const id = response.rows[0] != undefined ? response.rows[0].calendar_id : undefined;

    return [ response.rowCount > 0, id ];
  }

  async saveCalendarEvent(eventId: string, match: MatchTable): Promise<void> {
    await this.client.query({
      text: `INSERT INTO events (calendar_id, home, away, date, competition, season, match_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      values: [eventId, match.home, match.away, match.date, match.competition, match.season, match.id]
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
