import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // 기본값 false ,  false : 받는것 다 넣음 , true: 정의하지 않은건 걸러 줌
    forbidNonWhitelisted: true, // 있으면 안되는 속성이 있으면 에러남
  }));
  await app.listen(3000);
}

bootstrap();
