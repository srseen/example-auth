import { existsSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // Serve uploaded files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // Serve frontend static files if the build exists
  const frontendPath = join(__dirname, '..', '..', 'frontend', 'dist');
  if (existsSync(frontendPath)) {
    app.useStaticAssets(frontendPath);
    const server = app.getHttpAdapter().getInstance();
    server.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(join(frontendPath, 'index.html'));
    });
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}/api/v1`,
  );
}
void bootstrap();
