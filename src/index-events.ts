require('module-alias/register');
import * as dotenv from 'dotenv';

import * as events from '@/scripts/events';

async function main() {
  loadConfiguration();

  await events.main();
}

function loadConfiguration() {
  dotenv.config({ path: '.env' });
}

main();