import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor, UsePipes, ValidationPipe, ParseIntPipe, BadRequestException, ParseFloatPipe, NotFoundException, ParseBoolPipe, ParseArrayPipe, ParseUUIDPipe, ParseEnumPipe, DefaultValuePipe } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { movieTitleValidationPipe } from './pipe/movie-title-validation.pipe';




@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) { }

  @Get()
  findAll(
    @Query('title', movieTitleValidationPipe) title?: string
  ) {
    // Controller 역할 : title 쿼리의 타입이 string 타입인지?
    return this.movieService.findAll(title);
  }

  @Get(':id')
  findOne(@Param('id',
    //    new ParseIntPipe({
    //   exceptionFactory(error) {
    //     throw new BadRequestException('숫자를 입력해 주세요' + error);
    //   }
    // })
    // ParseFloatPipe
    // ParseBoolPipe
    // ParseArrayPipe // console.log(id); // ['${... id}'] // 검증과 함께 변환까지 해준다.
    // ParseUUIDPipe // uuid 형식 검증
    // new ParseEnumPipe(Test)  // enum Test {laborghini,ferrari}
  ) id: number,
    // @Query('test', new DefaultValuePipe("good")) test: string
  ) {
    // console.log(test);
    // throw new NotFoundException(`성공 에러 ---- ${id}`);
    return this.movieService.findOne(id);
  }

  @Post()
  create(
    @Body() body: CreateMovieDto,
  ) {
    return this.movieService.create(body,);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMovieDto,
  ) {
    return this.movieService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.remove(id);
  }
}
