import { setMaxListeners, EventEmitter } from 'node:events';
import 'reflect-metadata';
import express from 'express';
import config from './config';
import Logger from './loaders/logger';
process.env.TZ = 'Etc/Universal';

require('events').defaultMaxListeners = 30;

const eventEmitter = new EventEmitter();
setMaxListeners(100, eventEmitter);

async function startServer() {
  const app = express();

  await (await import('./loaders')).default({ expressApp: app });

  // const openai = new OpenAIService();
  // const chatCompletion = await openai.openai.createChatCompletion({
  //   model: '"text-davinci-002"',
  //   messages: [{ role: 'user', content: 'Hello world' }],
  // });
  // const destination = 'PARIS';
  // const people = 'SOLO';
  // const interests = 'FOOD';
  // const duration = 4;
  // const start_date = '07 July 2023';
  // const end_date = '11 July 2023';
  // const dates = '07 July 2023 - 11 July 2023';
  // const transportation = 'FLIGHT';
  // const budget = '1000';
  // const completion = await openai.openai.createCompletion({
  //   model: 'text-davinci-003',
  //   prompt: `tạo một chuyến đi đến ${destination} cho ${people} người. Chuyến đi sẽ kéo dài ${duration} ngày và bắt đầu vào ${start_date} và kết thúc vào ${end_date}. Chuyến đi sẽ bao gồm ${interests}. Chuyến đi sẽ có giá dưới ${budget} đô la. Chuyến đi sẽ bằng ${transportation}. Trả về với định dạng này: [{"day":"Day 1","locations":[{"name":"location name","description":"location description","duration":"location durations"},{"name":"location name 2","description":"location description 2","duration":"location durations 2"},..]},{"day":"Day 2","locations":[{"name":"location name","description":"location description","duration":"location durations"},{"name":"location name 2","description":"location description 2","duration":"location durations 2"},..]},...] và sử dụng tiếng Việt`,
  //   max_tokens: 2048,
  // });
  // const completion = await openai.openai.createCompletion({
  //   model: 'text-davinci-003',
  //   prompt: `do a trip to ${destination} for ${people} people. The trip should be ${duration} days long and start on ${start_date} and end on ${end_date}. The trip should include ${interests}. The trip should cost less than ${budget} dollars. The trip should be by ${transportation}.Return with this format: [{"day":"Day 1","locations":[{"name":"location name","description":"location description","duration":"location durations"},{"name":"location name 2","description":"location description 2","duration":"location durations 2"},..]},{"day":"Day 2","locations":[{"name":"location name","description":"location description","duration":"location durations"},{"name":"location name 2","description":"location description 2","duration":"location durations 2"},..]},...] and use Vietnamese`,
  //   max_tokens: 2048,
  // });
  // const completion = await openai.openai.createCompletion({
  //   model: 'text-davinci-003',
  //   prompt: `do a trip to ${destination} for ${people} people. The trip should be ${duration} days long and start on ${start_date} and end on ${end_date}. The trip should include ${interests}. The trip should cost less than ${budget} dollars. The trip should be by ${transportation}.Return with this format: [{day1,location1 - description - durations,location2 - description - durations,location3 - description - durations},{day2,location1 - description - durations,location2 - description - durations,location3 - description - durations},...]`,
  //   max_tokens: 2048,
  // });
  // console.log(completion.data.choices[0].text);
  // const json = completion.data.choices[0].text;
  // console.log(JSON.parse(json));
  app
    .listen(config.port, () => {
      Logger.info(`
      ################################################
      🛡️  Server listening on port: ${config.port} ${config.nodeEnv} 🛡️
      ################################################
    `);
    })
    .on('error', (err) => {
      Logger.error(err);
      process.exit(1);
    });

  console.log('done');
}

process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION!!! shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION!!!  shutting down ...');
  console.log(err.name, err.message);
  process.exit(1);
});

startServer();
