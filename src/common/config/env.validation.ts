import * as Joi from 'joi';

export const envValidationSchema = Joi.object({

  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().default(8080),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),

  // CACHE_HOST: Joi.string().default('localhost'),
  // CACHE_PORT: Joi.number().default(6379),
  CACHE_TTL: Joi.number().default(60),
  CACHE_MAX: Joi.number().default(100),
}); 
