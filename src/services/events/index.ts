import DatabaseService from "@/services/database";
import GoogleCalendarService from "@/services/calendar";
import { formatGoogleCalendarDate, getCalendarId } from "@/utils/functions";

class EventsService {

  database: DatabaseService;
  calendar: GoogleCalendarService;

  constructor(database: DatabaseService, calendar: GoogleCalendarService) {
    this.database = database;
    this.calendar = calendar;
  }
  
  async execute(): Promise<void> {

    const changedMatches = await this.database.getChangedMatches();

    for (const match of changedMatches) {
      console.log(`${match.home.padStart(18, ' ')} - ${match.away.padEnd(18, ' ')} | ${formatGoogleCalendarDate(match.date).padEnd(10, ' ')} | ${match.competition}`);

      const [ eventExists, eventId ] = await this.database.doesCalendarEventExists(match);
      const calendarId = getCalendarId(match);

      if (eventExists) {
        await this.calendar.updateMatch(match, calendarId, eventId);
        await this.database.updateCalendarEvent(eventId, match);
        console.log('\t\tUPDATED');
      } else {
        const newEventId = await this.calendar.createNewMatch(match, calendarId);
        await this.database.saveCalendarEvent(newEventId, match);
        console.log('\t\tCREATED');
      }

      await this.database.saveMatchUpdate(match);
    }

  }
}

export default EventsService;