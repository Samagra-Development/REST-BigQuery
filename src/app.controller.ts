import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { query } from './app.interface';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/:label')
  async fetch(@Param('label') label: string): Promise<any> {
    return this.appService.getQuery(label)
  }

  @Post()
  async add(@Body() data: query): Promise<any> {
    return this.appService.addQuery(data)
  }

  @Patch('/:label')
  async update(@Param('label') label: string, @Body() data: query): Promise<any> {
    return this.appService.updateQuery(label, data)
  }

  @Delete()
  async delete(label: string): Promise<any> {
    return this.appService.deleteQuery(label)
  }
  
  @Get('/query/:label')
  async runQeury(@Param('label') label: string): Promise<any> {
    const query = await this.appService.getQuery(label);
    console.log({query: query.query});
    return this.appService.executeQuery(query.query);
  }
}
