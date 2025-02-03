import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';

///  describe 안에 describe 를 무한 중복으로 사용 가능 // 설명은 보통 영어로 작성함.
///  describe 는 constroller 한개, 함수별로 1개 씩 있는게 일반적이다.
/// 함수별로 존재하는 이유는 하나의 함수를 여러가지 방식으로 테스트 하기 때문. 한개의 함수를 한번만 테스트하는경우 묶지 않는것이 일반적
/// ex)
/* 
```js
describe("testFunc는 덧셈이 가능하다",()=>{

  it("양수 덧셈이 가능하다",()=>{
    const result = testFunc (1,2)
    expect(result).toEqual(3)
  })

  it("음수 덧셈이 가능하다",()=>{
    const result = testFunc (-1,2)
    expect(result).toEqual(1)
  })

})
```
*/
describe('MovieController', () => {
  let controller: MovieController;

  /// it을 실행하기 전에 실행함
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [MovieService],
    }).compile();

    controller = module.get<MovieController>(MovieController);
  });
  describe('findAll', () => {

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

  });
});
