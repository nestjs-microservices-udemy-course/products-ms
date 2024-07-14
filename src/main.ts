import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import envs from './config/envs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(PinoLogger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(envs.PORT);
  logger.log(`Running on port ${envs.PORT}`);
}
bootstrap();
