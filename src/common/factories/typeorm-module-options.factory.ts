import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TypeOrmModuleConfigFactory implements TypeOrmOptionsFactory {

  constructor(private readonly config: ConfigService) { }

  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    return {
      type: 'mysql',
      host: this.config.get<string>('database.host',),
      port: this.config.get<number>('database.port'),
      database: this.config.get<string>('database.name'),
      username: this.config.get<string>('database.user'),
      password: this.config.get<string>('database.pass',),
      synchronize: this.config.get<string>('app.nodeEnv') === 'development',
      autoLoadEntities: true,
    }
  }
}
