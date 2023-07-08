import { Service, Container, Token } from 'typedi';
import OpenAIService from '../openai/openai';
import config from '@/config';

@Service()
export default class TravelService {
  openai: OpenAIService = Container.get(OpenAIService);
  constructor() {
    console.info('TravelService!!');
  }

  async journeyMade({
    destination,
    people,
    interests,
    duration,
    budget,
    start_date,
    end_date,
    transportation,
  }: {
    destination: string;
    people: string;
    interests: string;
    duration: string;
    budget: string;
    start_date: string;
    end_date: string;
    transportation: string;
  }) {
    const metadata = {
      destination,
      people,
      interests,
      duration,
      budget,
      start_date,
      end_date,
      transportation,
    };
    try {
      let prompt = `tạo một chuyến đi đến ${destination} cho ${people} người. Chuyến đi sẽ kéo dài ${duration} ngày và bắt đầu vào ${start_date} và kết thúc vào ${end_date}. Chuyến đi sẽ bao gồm ${interests}.${
        budget ? `Chuyến đi sẽ có giá dưới ${budget} đô la` : ''
      }. ${
        transportation ? `Chuyến đi sẽ bằng ${transportation}` : ''
      }. Trả về với định dạng này: [{"day":"Day 1","locations":[{"name":"location name","description":"location description","duration":"location durations"},{"name":"location name 2","description":"location description 2","duration":"location durations 2"},..]},{"day":"Day 2","locations":[{"name":"location name","description":"location description","duration":"location durations"},{"name":"location name 2","description":"location description 2","duration":"location durations 2"},..]},...] và sử dụng tiếng Việt`;
      const completion = await this.openai.createCompletion({
        model: config.openai.model,
        prompt,
        max_tokens: config.openai.max_tokens,
      });
      const result = completion.data.choices[0].text;
      console.log(result);
      const jsonfromstring = JSON.parse(result.match(/\[(.*)\]/)[0]);

      return {
        data: jsonfromstring,
        metadata,
        code: 200,
      };
    } catch (error) {
      console.log(error);
      return {
        metadata,
        code: 500,
        error,
      };
    }
  }
}
