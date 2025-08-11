import { existsSync } from 'fs';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.use(cookieParser());

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN')?.split(',') ?? true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // Optional Swagger documentation if the module is installed
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const swagger =
      require('@nestjs/swagger') as typeof import('@nestjs/swagger');
    const config = new swagger.DocumentBuilder()
      .setTitle('Mini Task Manager API')
      .setDescription('API documentation for the Mini Task Manager')
      .setVersion('1.0')
      .build();
    const document = swagger.SwaggerModule.createDocument(app, config);
    swagger.SwaggerModule.setup('api/docs', app, document);
  } catch {
    // Swagger is optional and not available in this environment
  }

  // Serve uploaded files
  const uploadDir = join(
    __dirname,
    '..',
    configService.get<string>('UPLOAD_DIR') ?? 'uploads',
  );
  app.useStaticAssets(uploadDir, {
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
