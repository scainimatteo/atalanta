import * as dotenv from 'dotenv';

Promise<void> main() async {
  dotenv.config();

  const scraper = new ScraperService();
  await scraper.execute();
}


main();
