import ScraperService from '@/services/scraper';
import DatabaseService from '@/services/database';
import { ScriptNames } from '@/utils/enums';
import { createExecutionId } from '@/utils/functions';


export async function main(): Promise<void> {

  const database = new DatabaseService();
  await database.connect();

  try {

    const scraper = new ScraperService(database);
    await scraper.execute();

  } catch (e) {
    await database.createFailedExecutionLog(createExecutionId(), ScriptNames.SCRAPER, new Date(), JSON.stringify(e));
    await database.dispose();
    return;
  }

  await database.createSuccessfulExecutionLog(createExecutionId(), ScriptNames.SCRAPER, new Date());
  await database.dispose();

}