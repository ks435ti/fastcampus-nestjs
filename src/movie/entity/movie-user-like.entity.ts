import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Movie } from "./movie.entity";

@Entity()
export class MovieUserLike {
    // PK 가 필요함
    // 컬럼의 좁합으로 PK를 만들경우
    // 조합할 각각의 컬럼에 @PrimaryColumn() 를 붙이고 파라미터로 이름과 타입을 정의한 객체를 넣는다.
    @PrimaryColumn({
        name: 'movieId',
        type: 'int8'
    })
    @ManyToOne(
        () => Movie,
        (movie) => movie.likedUsers,
        {
            onDelete: 'CASCADE'
        }
    )
    movie: Movie;

    @PrimaryColumn(
        {
            name: 'userId',
            type: 'int8'
        }
    )
    @ManyToOne(() => User,
        (user) => user.likedMovies,
        {
            onDelete: 'CASCADE' // User가 삭제 되었을때, 중간 테이블인 MovieUserLike에서도 삭제해다.
        }
    )
    user: User;

    @Column()
    isLike: boolean;
}