import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ //  (custom 포함) 사용할때 추가해야 적용됨
    whitelist: true, // 기본값 false ,  false : 받는것 다 넣음 , true: 정의하지 않은건 걸러 줌
    forbidNonWhitelisted: true, // 있으면 안되는 속성이 있으면 에러남
    transformOptions: {
      // enableImplicitConversion: true, // class 에 정의한 타입을 기반으로 입력한 값을 class-transformer가 알아서 변환 한다. (postman에서는 string으로 들어오지만 class에 정의된 타입으로 알아서 바꿔라)
    }
  }));
  await app.listen(3000);
}

bootstrap();
