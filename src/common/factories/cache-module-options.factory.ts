import { CacheOptions, CacheOptionsFactory } from "@nestjs/cache-manager";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CacheModuleOptionsFactory implements CacheOptionsFactory {

  constructor(private readonly config: ConfigService) { }

  createCacheOptions(): CacheOptions<Record<string, any>> | Promise<CacheOptions<Record<string, any>>> {
    return {
      ttl: this.config.get('cache.ttl'),
      max: this.config.get('cache.max')
    }
  }
}
