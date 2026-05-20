
import { ConfigModuleOptions } from '@nestjs/config';
import { envValidationSchema } from '../config/env.validation';
import appConfig from '../config/app.config';
import databaseConfig from '../config/database.config';
import cacheConfig from '../config/cache.config';

export const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  load: [appConfig, databaseConfig, cacheConfig],
  validationSchema: envValidationSchema,
  validationOptions: {
    abortEarly: false,
  },
};
