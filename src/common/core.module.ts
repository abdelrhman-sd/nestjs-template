import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { configModuleOptions } from './factories/config-module-options.factory';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleConfigFactory } from './factories/typeorm-module-options.factory';
import { CacheModuleOptionsFactory } from './factories/cache-module-options.factory';
import TransformResponseInterceptor from './interceptors/transform-response.interceptor';

@Module({

  imports: [

    // loading env file
    ConfigModule.forRoot(configModuleOptions),

    // caching
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useClass: CacheModuleOptionsFactory
    }),

    // DB Connection via TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmModuleConfigFactory
    })
  ],

  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ]

})
export class CoreModule { }
