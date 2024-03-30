import { MatchTable } from "@/models/Database";
import { formatGoogleCalendarDate } from "@/utils/functions";
import { calendar_v3, google } from "googleapis";
import config from 'config';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

class GoogleCalendarService {
  calendar: calendar_v3.Calendar;

  constructor() {}

  async initialize(): Promise<void> {

    const client = new google.auth.JWT(
      undefined,
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      undefined,
      SCOPES
    );
    await client.authorize();

    this.calendar = google.calendar({
      version: 'v3',
      auth: client
    });
  }

  async createNewMatch(match: MatchTable, calendarId: string): Promise<string> {
    const createdEvent = await this.calendar.events.insert({
      calendarId: calendarId,
      requestBody: this.createRequestBody(match)
    });

    return createdEvent.data.id;
  }

  async updateMatch(match: MatchTable, calendarId: string, eventId: string): Promise<void> {
    await this.calendar.events.update({
      calendarId: calendarId,
      eventId: eventId,
      requestBody: this.createRequestBody(match)
    });
  }

  private createRequestBody(match: MatchTable): calendar_v3.Schema$Event {
    const title = `${match.home} - ${match.away}`;
    const date = formatGoogleCalendarDate(match.date);

    return {
      summary: title,
      start: {
        date: date,
        timeZone: config.get('google_calendar.timezone')
      },
      end: {
        date: date,
        timeZone: config.get('google_calendar.timezone')
      },
    };
  }
}

export default GoogleCalendarService;