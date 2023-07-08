import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';
import config from '@/config';
import { Service, Token } from 'typedi';
import {
  Configuration,
  CreateCompletionRequest,
  CreateCompletionResponse,
  OpenAIApi,
} from 'openai';
import type {
  AxiosPromise,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
@Service()
export default class OpenAIService {
  openai: OpenAIApi;
  configuration: Configuration;
  constructor() {
    this.configuration = new Configuration({
      apiKey: config.openai.secret,
    });
    this.openai = new OpenAIApi(this.configuration);
    console.info('OpenAIService!!');
  }
  createCompletion(
    createCompletionRequest: CreateCompletionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.openai.createCompletion(
      createCompletionRequest,
      options as any,
    );
  }
}
