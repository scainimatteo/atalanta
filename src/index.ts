require('module-alias/register');
import * as dotenv from 'dotenv';

import * as scraper from '@/scripts/scraper';
import * as events from '@/scripts/events';

async function main() {
  loadConfiguration();

  console.log('\n\nSCRAPER\n\n');
  await scraper.main();

  console.log('\n\nEVENTS\n\n');
  await events.main();
}

function loadConfiguration() {
  dotenv.config({ path: '.env' });
}

main();