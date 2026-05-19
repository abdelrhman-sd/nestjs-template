import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ConfigModule } from '@nestjs/config';
import TransformResponseInterceptor from './interceptors/transform-response.interceptor';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

@Module({

  imports: [

    // loading env file
    ConfigModule.forRoot({ isGlobal: true }),

    // caching
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 1000,
      max: 100
    })
  ],

  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ]

})
export class CoreModule { }
