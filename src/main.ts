import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType, Headers } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose'],
  });
  // app.enableVersioning({
  //   // type: VersioningType.URI,
  //   // defaultVersion: "1",
  //   // defaultVersion: ["1", "2"],

  //   // type: VersioningType.HEADER,
  //   // header: 'version'

  //   type: VersioningType.MEDIA_TYPE,
  //   key: 'v='

  // });
  const config = new DocumentBuilder()
    .setTitle('코드팩토리 넷플릭스')
    .setDescription('코드팩토리 nestjs 강의')
    .setVersion('1.0')
    .addBasicAuth()
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    }
  });

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
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
