import { Exclude, Expose, Transform } from "class-transformer";
import { BaseTable } from "src/common/entity/base-table.entity";
import { ChildEntity, Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, TableInheritance, Unique, UpdateDateColumn, VersionColumn } from "typeorm";
import { MovieDetail } from "./movie-detail.entity";
import { Director } from "src/director/entity/director.entity";
import { Genre } from "src/genre/entity/genre.entity";
import { User } from "src/user/entities/user.entity";
import { MovieUserLike } from "./movie-user-like.entity";


/// Many to One  : Director -> 감독은 여러개의 영화를 만들수 있음
/// Ont to One : MovieDetail -> 영화는 하나의 상세 내용을 갖을 수 있음
/// Many to Many : Category -> 영화는 여러개의 장르를 갖을 수 있고, 장르는 여러개의 영화에 속할 수 있음

// @Exclude() // 보안상 기본값을 노출안함으로 하고 노출 필요 부분만 Expose 한다.
@Entity()
export class Movie extends BaseTable {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(
        () => User,
        (user) => user.createdMovies
    )
    creator: User;

    @Column({
        unique: true
    })
    title: string;

    // @Expose() // 노출 함
    // @Exclude() // 노출 막음 , 데이터는 있는데 보여주지만 않는다.
    // @Transform(({ value }) => value.toString().toUpperCase())
    // @Column()
    // genre: string;

    @Column({
        default: 0,
    })
    likeCount: number;

    @Column({
        default: 0,
    })
    dislikeCount: number;

    @ManyToMany(
        () => Genre,
        (genre) => genre.movies,
    )
    @JoinTable()
    genres: Genre[];

    @OneToOne(() => MovieDetail,
        (detail) => detail.movie,
        {
            cascade: true, // default: fasle,  현재 객체 조작할때, 이 컬럼(detail)도 같이 조작한다.
            nullable: false,
        }
    )
    @JoinColumn() // 소유자 지정 : movie가 상세를 가지고 있다.
    detail: MovieDetail;

    @Column()
    @Transform(({ value }) => `http://localhost:3000/${value}`)
    movieFilePath: string;

    @ManyToOne(
        () => Director,
        director => director.movies,
        {
            cascade: true,
            nullable: false,
        }
    )
    director: Director;

    @OneToMany(
        () => MovieUserLike,
        (mul) => mul.movie,
    )
    likedUsers: MovieUserLike[];



}
