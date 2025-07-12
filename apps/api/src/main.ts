import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  if (process.env.NODE_ENV === 'development') {
    console.log(`Application is running on: http://localhost:${port}`);
  }
}
bootstrap();
