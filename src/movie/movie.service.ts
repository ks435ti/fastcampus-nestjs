import { CreateMovieDto } from './dto/create-movie.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entity/genre.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CommonService } from 'src/common/common.service';

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
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
  ) { }

  async findAll(dto?: GetMoviesDto) {
    const { title, take, page } = dto;
    const qb = await this.movieRepository.createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      ;

    if (title) {// title 이 있다면
      qb.where('movie.title LIKE :title', { title: `%${title}%` });
    }
    if (take && page) {
      this.commonService.applyPagePaginationParamsToQb(qb, dto);
    }

    return await qb.getManyAndCount();

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
      .where('movie.id= :id', { id })
      .getOne();
    return qb;
    // const movie = await this.movieRepository.findOne({
    //   where: {
    //     id,
    //   },
    //   relations: ["detail", "director", "genres"]
    // });

    // if (!movie) {
    //   throw new NotFoundException('존재하지 않는 ID 값의 영화 입니다.');
    // }

    // return movie;
  }

  async create(createMovieDto: CreateMovieDto) {

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction('READ UNCOMMITTED'); //  default :READ UNCOMMITTED
    try {
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

      const movie = await qr.manager.createQueryBuilder()
        .insert()
        .into(Movie)
        .values({
          title: createMovieDto.title,
          detail: {
            id: movieDetailId,
          },
          director,
          // genres // many to many 는 그냥 안됨.
        }).execute();
      const movieId = movie.identifiers[0].id;
      await qr.manager.createQueryBuilder()
        .relation(Movie, 'genres')
        .of(movieId)
        .add(genres.map(genre => genre.id));

      await qr.commitTransaction();
      // commit 상태에서 실행하기 때문에 trajaction 에서 실행하지 않고 repository에서 실행함.
      return await this.movieRepository.findOne({ where: { id: movieId }, relations: ["detail", "director", "genres"] });
    } catch (e) {
      await qr.rollbackTransaction();
      throw (e);
    } finally {
      qr.release();
    }
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
}
