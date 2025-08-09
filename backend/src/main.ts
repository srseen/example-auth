import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Serve uploaded files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}/api/v1`,
  );
}
void bootstrap();
