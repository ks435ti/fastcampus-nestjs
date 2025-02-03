import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MovieDetail } from "src/movie/entity/movie-detail.entity";
import { Movie } from "src/movie/entity/movie.entity";
import { Repository } from "typeorm";

@Injectable()
export class MovieRemove {
    constructor(
        @InjectRepository(Movie)
        private readonly movieRepository: Repository<Movie>,
        @InjectRepository(MovieDetail)
        private readonly movieDetailRepository: Repository<MovieDetail>
    ) { }
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