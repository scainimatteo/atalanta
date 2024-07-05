import DatabaseService from "@/services/database";
import EventsService from "@/services/events";
import { ScriptNames } from "@/utils/enums";
import { createExecutionId } from "@/utils/functions";
import GoogleCalendarService from "@/services/calendar";


export async function main(): Promise<void> {

  const database = new DatabaseService();
  await database.connect();

  const googleCalendar = new GoogleCalendarService();
  await googleCalendar.initialize();

  let eventsLogs = '';

  try {

    const events = new EventsService(database, googleCalendar);
    eventsLogs = await events.execute();

  } catch (e) {
    await database.createFailedExecutionLog(createExecutionId(), ScriptNames.EVENTS, new Date(), JSON.stringify(e));
    await database.dispose();
    return;
  }

  await database.createSuccessfulExecutionLog(createExecutionId(), ScriptNames.EVENTS, new Date(), eventsLogs);
  await database.dispose();

}
