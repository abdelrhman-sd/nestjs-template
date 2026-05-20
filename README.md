# nestjs-template

An opinionated NestJS starter template for backend services. Clone, rename, and start shipping features.

## Stack

- **NestJS** — framework
- **TypeORM** — database ORM (MySQL)
- **ConfigModule** — environment variable loading and validation via Joi
- **CacheModule** — in-memory caching, globally available
- **class-validator + class-transformer** — DTO validation pipeline

## Project structure

```
src/
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── interceptors/
│       └── transform-response.interceptor.ts
├── config/
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── cache.config.ts
│   └── env.validation.ts
├── factories/
│   ├── config-module-options.factory.ts
│   ├── typeorm-module-options.factory.ts
│   └── cache-module-options.factory.ts
├── core/
│   └── core.module.ts
├── app.module.ts
└── main.ts
```

## How it's wired

`AppModule` imports only `CoreModule`. All infrastructure registration lives in `CoreModule`. Each module's options are isolated in a dedicated factory class or constant under `src/factories/`.

```ts
// app.module.ts
@Module({
  imports: [CoreModule, FeatureAModule, FeatureBModule],
})
export class AppModule {}
```

```ts
// core/core.module.ts
@Module({
  imports: [

    ConfigModule.forRoot(configModuleOptions),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useClass: CacheModuleConfigFactory
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmModuleConfigFactory
    }),
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class CoreModule {}
```

## Factories

Each infrastructure module has its own factory so `CoreModule` stays clean wiring-only.

| Factory | Pattern | Module |
|---|---|---|
| `config-module-options.factory.ts` | plain constant (`ConfigModuleOptions`) | `ConfigModule.forRoot` |
| `typeorm-module-options.factory.ts` | `@Injectable()` class implementing `TypeOrmOptionsFactory` | `TypeOrmModule.forRootAsync` |
| `cache-module-options.factory.ts` | `@Injectable()` class implementing `CacheOptionsFactory` | `CacheModule.registerAsync` |

`ConfigModule.forRoot` doesn't support `useClass`, so its options are exported as a plain constant. The TypeORM and Cache factories use `useClass` — NestJS instantiates them and injects `ConfigService` via their constructors. Both require `imports: [ConfigModule]` in `forRootAsync` / `registerAsync` to ensure `ConfigService` is resolved before the factory runs.

## Environment variables

Copy `.env.example` to `.env` and fill in the values.

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | HTTP port | `3000` |
| `DB_HOST` | MySQL host | — |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | — |
| `DB_USER` | Database user | — |
| `DB_PASS` | Database password | — |
| `CACHE_TTL` | Default cache TTL in milliseconds | `60000` |
| `CACHE_MAX` | Max items in cache | `100` |

Validation runs at startup via Joi (`src/config/env.validation.ts`). If any required variable is missing the process exits immediately and prints all offending variables at once (`abortEarly: false`).

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Run in development
npm run start:dev
```

## Filters and interceptors

Registered globally via `APP_FILTER` and `APP_INTERCEPTOR` tokens in `CoreModule` — no need to touch `main.ts` for these.

### `HttpExceptionFilter`

Catches all unhandled exceptions and returns a consistent error shape:

```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "message": "Bad Request",
    "details": []
  }
}
```

### `TransformResponseInterceptor`

Wraps all successful responses in a consistent envelope:

```json
{
  "success": true,
  "statusCode": 200
  "data": { ... },
}
```

Add new filters or interceptors to `src/common/` and register them the same way in `CoreModule.providers`.

## Validation pipe

A global validation pipe is configured in `main.ts` with sensible defaults:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }),
);
```

## Caching

`CacheModule` is registered globally so any service can inject `CACHE_MANAGER` without importing the module locally:

```ts
import { Inject } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

await this.cache.set('key', value);
const value = await this.cache.get('key');
```
