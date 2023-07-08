import { TravelValidation } from '@/middleware/validations/travel.validation';
import TravelService from '@/services/travel/travel.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
} from '@/utils/expressDecorators';
import { Request, Response } from 'express';
import { Container } from 'typedi';

@Controller('/travels')
export default class TravelController {
  service: TravelService = Container.get(TravelService);
  constructor() {
    console.log('TravelController!!');
  }
  @Get('/')
  async getTravels(req: any, res: any) {
    return res.json({
      message: 'Hello World! from TravelController',
    });
  }
  @Post('/ask', [TravelValidation.ask])
  async journeyMade(
    @Res() res: Response,
    @Req() req: Request,
    @Body() body: any,
  ) {
    return res.json(await this.service.journeyMade(body));
  }
}
