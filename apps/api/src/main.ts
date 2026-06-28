import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Todos Social API')
    .setDescription('API for todos social')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  writeFileSync(
    join(process.cwd(), 'openapi.json'),
    JSON.stringify(document, null, 2),
  );
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
