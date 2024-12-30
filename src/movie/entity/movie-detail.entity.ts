import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Movie } from "./movie.entity";

@Entity()
export class MovieDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    detail: string;
    @OneToOne(() => Movie,
        (movie) => movie.detail

    )
    // @JoinTable() // 소유자 지정 : movie가 상세id를 가지고 있는게 싫다.
    movie: Movie;
}