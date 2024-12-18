import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create<INestApplication>(
    AppModule,
    new FastifyAdapter()
  );

  app.enableCors();

  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(1337, '0.0.0.0');
}
bootstrap();
