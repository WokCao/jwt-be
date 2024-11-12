import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Automatically transform payload to DTO instances
    whitelist: true, // Automatically strip properties that do not have decorators
    forbidNonWhitelisted: true, // Return an error if non-whitelisted properties are present
  }));
  app.enableCors({ "origin": "*", "methods": "*" })
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
