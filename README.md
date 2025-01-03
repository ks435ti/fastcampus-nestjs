## ToDo
class validator  - google에서 검색 해서 구체적인 데코레이터 확인

```js
app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // 기본값 false ,  false : 받는것 다 넣음 , true: 정의하지 않은건 걸러 줌
    forbidNonWhitelisted: true, // 있으면 안되는 속성이 있으면 에러남
  }));
```

### 1. Request
### 2. Middleware
  - Global Middleware
  - Module Middleware
### 3. Guards
  - Global Guards
  - Controller Guards
  - Route Guards
### 4. Interceptors
  - Global Interceptors
  - Controller Interceptors
  - Route Interceptors
### 5. Pipes (transformation, validation)
  - Global Pipes
  - Controller Pipes
  - Route Pipes
  - Route Parameter Pipes

### 6. Controller
### 7. Service

### 8. Interceptor
  - Router Interceptor
  - Controller Interceptor
  - Global Interceptor
### 9. Exception Fiters
  - Route
  - Controller
  - Global
### 10. Response


## Mapped Types
 - PartialType : 클래스의 프로퍼티 정의를 모두 optional로 만든다.
 - PickType : 특정 프로퍼티만 골라 사용 할 수 있다.(Omit의 반대)
 - OmitType : 특정 프로퍼티만 생략 할 수 있다. (Pick의 반대)
 - IntersectionType : 두 타입의 프로퍼티를 모두 모아서 사용 할 수 있다.
 - composition : Mapped Types를 다양하게 조합해서 중첩 적용 가능핟.