import * as axios from 'axios';

class ScraperService {
  const BASE_URL: string;
  const QUERY_PARAM: string;

  ScraperService() {
    this.BASE_URL = process.env.BASE_URL;
    this.QUERY_PARAM = process.env.QUERY_PARAM;
  }

  Promise<void> execute() async {
    const response = await axios.get(`${this.BASE_URL}?${this.QUERY_PARAM}=2023`);

    console.log(response);
  }
}
