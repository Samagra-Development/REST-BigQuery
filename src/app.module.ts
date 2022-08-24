import { BigQuery } from '@google-cloud/bigquery';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      ttl: config.get('THROTTLE_TTL') | 60,
      limit: config.get('THROTTLE_LIMIT') | 10,
    }),
  }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    BigQuery,
  ],
})
export class AppModule {}
