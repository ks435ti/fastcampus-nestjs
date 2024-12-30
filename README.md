## ToDo
class validator  - google에서 검색 해서 구체적인 데코레이터 확인

```js
app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // 기본값 false ,  false : 받는것 다 넣음 , true: 정의하지 않은건 걸러 줌
    forbidNonWhitelisted: true, // 있으면 안되는 속성이 있으면 에러남
  }));
```