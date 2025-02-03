import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor, UsePipes, ValidationPipe, ParseIntPipe, BadRequestException, ParseFloatPipe, NotFoundException, ParseBoolPipe, ParseArrayPipe, ParseUUIDPipe, ParseEnumPipe, DefaultValuePipe, Request, UseGuards, UploadedFile, UploadedFiles, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieTitleValidationPipe } from './pipe/movie-title-validation.pipe';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/user/entities/user.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MovieFilePipe } from './pipe/movie-file.pipe';
import { UserId } from 'src/user/decorator/user-id.decorator';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { CacheKey, CacheTTL, CacheInterceptor as CI } from '@nestjs/cache-manager';
import { Throttle } from 'src/common/decorator/throttle.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

// @Controller({
//   path: 'movie',
//   version: '2',
// })
// export class MovieController2 {
//   @Get()
//   getMovies() {
//     return [];
//   }
// }

@Controller({
  path: 'movie',
  // version: VERSION_NEUTRAL,
})
@ApiTags('myMovie') // endpoint를 그룹화 할수 있음
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(
    private readonly movieService: MovieService
  ) { }

  @Get()
  @Public()
  // @UseInterceptors(CacheInterceptor)
  @Throttle({
    count: 5,
    unit: "minute"
  })
  // @Version('5')
  // @Version(["1", '3', '5'])
  @ApiOperation({
    description: "[Movie]를 pagination 하는 API"
  })
  @ApiResponse({ // 여러개 넣을수 있음
    status: 200,
    description: '성공적으로 API Pagination을 실행 했을때'
    ,
  }) @ApiResponse({
    status: 400,
    description: 'Pagination 데이터를 잘못 입력 했을때'
    ,
  })
  findAll(
    // @Request() req: any,
    @Query() dto?: GetMoviesDto,
    @UserId() userId?: number,
  ) {
    // console.log(req.user);
    // Controller 역할 : title 쿼리의 타입이 string 타입인지?
    return this.movieService.findAll(dto, userId);
  }

  @Get('recent')
  @UseInterceptors(CI) // 기본키로 경로를 사용한다, @CacheKey("key")로 키를 지정하면 @Param에따라 경로가 달라도 인지하지 못한다.
  @CacheKey('getMoviesRecent')
  @CacheTTL(1000) // 모듈에서 지정한값을 오버라이드 한다.
  getMoviesRecent() {
    // console.log('getRecent() 실행');
    return this.movieService.findRecent();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id',
    ParseIntPipe
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
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  create(
    @Body() body: CreateMovieDto,
    @QueryRunner() queryRunner: QR,
    @UserId() userId: number,
  ) {
    return this.movieService.create(
      body,
      userId,
      queryRunner,
    );
  }

  @Patch(':id')
  @RBAC(Role.admin)
  update(@Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMovieDto,
  ) {
    return this.movieService.update(id, body);
  }

  @Delete(':id')
  @RBAC(Role.admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.remove(id);
  }

  /**
   * 
   * [Like] [ Dislike]
   * 
   * 아무것도 누르지 않은 상태
   * Like & Dislike 모두 버튼 꺼져있음
   * 
   * 
   * Like 버튼 누르면
   * Like 버튼 불 켜짐
   * 
   * Like 버튼 다시 누르면 
   * Like 버튼 불 꺼짐
   * 
   * Disike 버튼 누르면
   * DisLike 버튼 불 켜짐
   * 
   * Dislike 버튼 다시 누르면 
   * Dislike 버튼 불 꺼짐
   * 
   * 
   * Like 버튼 누름
   * Like 버튼 불 켜짐
   * 
   * Dislike 버튼 누름
   * Like 버튼 불 꺼지고 Dislike 버튼 불 켜짐
   * 
   * 
   */


  @Post(':id/like')
  createMoiveLike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    console.log("like");
    return this.movieService.toggleMovieLike(movieId, userId, true);
  }

  @Post(':id/dislike')
  createMoiveDisLike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    console.log("dislike");

    return this.movieService.toggleMovieLike(movieId, userId, false);
  }

}
