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
  
  async execute(): Promise<string> {

    const changedMatches = await this.database.getChangedMatches();
    let logs = [];

    for (const match of changedMatches) {
      let matchLog = `${match.home.padStart(26, ' ')} - ${match.away.padEnd(26, ' ')} | ${formatGoogleCalendarDate(match.date).padEnd(10, ' ')} | ${match.competition}`;
      console.log( matchLog );
      logs.push( matchLog );

      const [ eventExists, eventId ] = await this.database.doesCalendarEventExists(match);
      const calendarId = getCalendarId(match);

      if (eventExists) {
        await this.calendar.updateMatch(match, calendarId, eventId);
        await this.database.updateCalendarEvent(eventId, match);
        let operationLog = '\t\t\tUPDATED';
	console.log( operationLog );
	logs.push( operationLog );
      } else {
        const newEventId = await this.calendar.createNewMatch(match, calendarId);
        await this.database.saveCalendarEvent(newEventId, match);
        let operationLog = '\t\t\tCREATED';
	console.log( operationLog );
	logs.push( operationLog );
      }

      await this.database.saveMatchUpdate(match);
    }

    return logs.join('\n');

  }
}

export default EventsService;
