require('module-alias/register');
import * as dotenv from 'dotenv';

import * as scraper from '@/scripts/scraper';

async function main() {
  loadConfiguration();

  await scraper.main();
}

function loadConfiguration() {
  dotenv.config({ path: '.env' });
}

main();