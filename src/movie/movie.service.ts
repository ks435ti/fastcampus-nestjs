import { CreateMovieDto } from './dto/create-movie.dto';
import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, QueryRunner, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entity/genre.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CommonService } from 'src/common/common.service';
import { join } from 'path';
import { rename } from "fs/promises";
import { User } from 'src/user/entities/user.entity';
import { MovieUserLike } from './entity/movie-user-like.entity';
import { callbackify } from 'util';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { privateDecrypt } from 'crypto';

@Injectable()
export class MovieService
// extends CommonService // 생성자에 넣어도 되고 , 상속으로 구현해도 된다.
{
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MovieUserLike)
    private readonly movieUserLikeRepository: Repository<MovieUserLike>,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManater: Cache
  ) { }


  async findRecent() {
    const cacheData = await this.cacheManater.get('MOVIE_RECENT');

    if (cacheData) {
      return cacheData;
    }

    const data = await this.movieRepository.find({
      order: {
        createdAt: 'DESC'
      }, take: 10,
    });

    await this.cacheManater.set('MOVIE_RECENT', data);

    return data;
  }

  private async getLikedMovies(movieIds: number[], userId: number) {
    return await this.movieUserLikeRepository.createQueryBuilder('mul')
      .leftJoinAndSelect('mul.user', 'user')
      .leftJoinAndSelect('mul.movie', 'movie')
      .where('movie.id IN(:...movieIds)', { movieIds })
      .andWhere('user.id = :userId', { userId })
      .getMany();
  }

  async findAll(dto?: GetMoviesDto, userId?: number) {
    const { title,
      //  take, page  // pagepagination에서 사용한 값
    } = dto;
    const qb = this.movieRepository.createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {// title 이 있다면
      qb.where('movie.title LIKE :title', { title: `%${title}%` });
    }
    // if (take && page) { // cursor 기반 페이지네이션 을 위해 조건을 삭제함.
    // this.commonService.applyPagePaginationParamsToQb(qb, dto);
    const { nextCursor } = await this.commonService.applyCursorPaginationParamsToQb(qb, dto);
    // }

    let [data, count] = await qb.getManyAndCount();
    if (userId) {
      const movieIds = data.map(movie => movie.id);
      let likedMovies;
      try {
        likedMovies = movieIds.length < 1 ? [] : await this.getLikedMovies(movieIds, userId);

      } catch (e) {
        console.log("raw query error : ", e);
      }
      /**
       * {
       *  movieId: boolean
       * }
      */
      const likedMovieMap = likedMovies.reduce((acc, next) => ({
        ...acc,
        [next.movie.id]: next.isLike,
      }), {});
      data = data.map((x) => ({
        ...x,
        /// null || true || false
        likeStatus: x.id in likedMovieMap ? likedMovieMap[x.id] : null,
      }));
    }
    return {
      data,
      nextCursor,
      count,
    };

    // if (!title) {
    //   return [
    //     await this.movieRepository.find({
    //       relations: ['director', "genres"]
    //     }),
    //     await this.movieRepository.count()
    //   ];
    // }

    // return await this.movieRepository.findAndCount({
    //   where: {
    //     title: Like(`%${title}%`)
    //   },
    //   relations: ["director", "genres"]
    // });
  }
  async findOne(id: number) {
    const qb = await this.movieRepository.createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.detail', 'detail')
      .leftJoinAndSelect('movie.creator', 'creator')
      .where('movie.id= :id', { id })
      .getOne();
    if (!qb) {
      throw new BadRequestException('존재하지 않는 영화');
    }
    return qb;

  }

  async create(createMovieDto: CreateMovieDto, userId: number, qr: QueryRunner) {

    // await qr.startTransaction('READ UNCOMMITTED'); //  default :READ UNCOMMITTED
    // try {
    const director = await qr.manager.findOne(Director, { // qr.manager 를 사용하면 find 의 첫번째 파라미터로 조작할 테이블을 넣어야한다.
      where: {
        id: createMovieDto.directorId
      }
    });

    if (!director) {
      throw new NotFoundException('존재하지 않는 ID의 감독 입니다.');
    }

    const genres = await qr.manager.find(Genre, { where: { id: In(createMovieDto.genreIds) } });

    if (genres.length !== createMovieDto.genreIds.length) {
      throw new NotFoundException(`존재하지 않는 장르가  있습니다! 존재하는 장르 ids => ${genres.map(genre => genre.id).join(',')}`);
    }

    const movieDetail = await qr.manager.createQueryBuilder()
      .insert()
      .into(MovieDetail)
      .values({
        detail: createMovieDto.detail
      })
      .execute();

    // throw new NotFoundException('내가 만든 에러'); // detail이 생성 안되는 것을 확인해본다.
    const movieDetailId = movieDetail.identifiers[0].id;//

    const movieFolder = join('public', 'movie');
    const tempFolder = join('public', 'temp');

    const movie = await qr.manager.createQueryBuilder()
      .insert()
      .into(Movie)
      .values({
        title: createMovieDto.title,
        detail: {
          id: movieDetailId,
        },
        director,
        creator: {
          id: userId,
        },
        movieFilePath: join(movieFolder, createMovieDto.movieFileName),
        // genres // many to many 는 그냥 안됨.
      }).execute();
    const movieId = movie.identifiers[0].id;
    await qr.manager.createQueryBuilder()
      .relation(Movie, 'genres')
      .of(movieId)
      .add(genres.map(genre => genre.id));

    await rename( // 파일 이동 (qr 트랜젝션 실행중에 에러나도 파일은 이미 옮겨짐 그래서 트랜젝션 끝나고 옮김 )
      // 영화 이름의 파일이 존재하는지 등의 예외 처리 
      join(process.cwd(), tempFolder, createMovieDto.movieFileName),
      join(process.cwd(), movieFolder, createMovieDto.movieFileName),
    );

    // await qr.commitTransaction();
    // commit 상태에서 실행하기 때문에 trajaction 에서 실행하지 않고 repository에서 실행함.
    // interceptor로 만들고 commitTransaction 을 interceptor로 옮기면  아직 db에는 반영 되지 않았기 때문에this.movieRepository에서 조회할수 없어서 qr.manager로 변환해서 db반영전의 데이터를 반환하고 db에 반영한다.
    return await qr.manager.findOne(Movie, { where: { id: movieId }, relations: ["detail", "director", "genres"] });
    // } catch (e) {
    //   await qr.rollbackTransaction();
    //   throw (e);
    // } finally {
    //   qr.release();
    // }
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const movie = await qr.manager.findOne(Movie, {
        where: {
          id,
        }, relations: ['detail', "genres"]
      });

      if (!movie) {
        throw new NotFoundException('존재하지 않는 ID 값의 영화 입니다.');
      }

      const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

      let newDirector: Director;
      if (directorId) {
        const director = await qr.manager.findOne(Director, {
          where: { id: directorId }
        });

        if (!director) {
          throw new NotFoundException('존재하지 않는 ID의 감독 입니다.');
        }
        newDirector = director;
      }
      let newGenres: Genre[];
      if (genreIds) {
        const genres = await qr.manager.find(Genre, { where: { id: In(genreIds) } });
        if (genres.length !== updateMovieDto.genreIds.length) {
          throw new NotFoundException(`존재하지 않는 장르가  있습니다! 존재하는 장르 ids => ${genres.map(genre => genre.id).join(',')}`);
        }
        newGenres = genres;
      }

      const movieUpdateFields = {
        ...movieRest,
        ...(newDirector && { director: newDirector }),
      };
      await qr.manager.createQueryBuilder()
        .update(Movie)
        .set(movieUpdateFields)
        .where('id= :id', { id })
        .execute();
      // this.movieRepository.update(
      //   { id }, movieUpdateFields,
      // );

      if (detail) {
        await qr.manager.createQueryBuilder()
          .update(MovieDetail)
          .set({ detail })
          .where('id=:id', { id: movie.detail.id })
          .execute();

        // await this.movieDetailRepository.update(
        //   {
        //     id: movie.detail.id
        //   },
        //   {
        //     detail
        //   }
        // );
      }

      if (newGenres) {
        await qr.manager.createQueryBuilder()
          .relation(Movie, 'genres')
          .of(id)
          .addAndRemove(newGenres.map(genre => genre.id), movie.genres.map(genre => genre.id)); // addAndRemove (추가할 ids , 삭제할 ids)
      }
      // const newMovie = await this.movieRepository.findOne({
      //   where: {
      //     id
      //   }, relations: ["detail", 'director']
      // });

      // newMovie.genres = newGenres;
      // await this.movieRepository.save(newMovie);

      await qr.commitTransaction();
      return this.movieRepository.findOne({ where: { id }, relations: ["detail", "director", "genres"] });
    } catch (e) {
      qr.rollbackTransaction();
      throw e;
    }
    finally { qr.release(); }


  }

  async remove(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      }, relations: ["detail"]
    });

    if (!movie) {
      throw new NotFoundException('존재하지  않는 ID 값의 영화 입니다.');
    }

    await this.movieRepository.createQueryBuilder()
      .delete()
      .where('id=:id', { id })
      .execute();
    // await this.movieRepository.delete(id);

    await this.movieDetailRepository.delete(movie.detail.id);
    return id;
  }

  async toggleMovieLike(movieId: number, userId: number, isLike: boolean) {
    const movie = await this.movieRepository.findOne({
      where: {
        id: movieId
      }
    });
    if (!movie) {
      throw new BadRequestException('존재하지 않는 영화 입니다.');
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      }
    });

    if (!user) {
      throw new UnauthorizedException('사용자 정보가 없습니다.');
    }

    const likeRecord = await this.movieUserLikeRepository.createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id = :movieId', { movieId })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    if (likeRecord) {
      if (isLike == likeRecord.isLike) {
        // 같은 액션( 좋아요 -> 좋아요, 싫어요 -> 싫어요)
        // 기존거 끔
        // 삭제
        await this.movieUserLikeRepository.delete({
          movie,
          user
        });
      } else {
        // 다른 액션( 좋아요 -> 싫어요, 싫어요 -> 좋아요) 
        // 기존꺼 끄고 반대꺼 킴
        // isLike만 변경
        await this.movieUserLikeRepository.update({
          movie,
          user,
        }, {
          isLike,

        });
      }
    } else {
      // 데이터가 없는경우는 새로 생성하면 끝
      await this.movieUserLikeRepository.save({
        movie,
        user,
        isLike,
      });
    }
    const result = await this.movieUserLikeRepository.createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id = :movieId', { movieId })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    return {
      isLike: result && result.isLike
    };

  }
}
