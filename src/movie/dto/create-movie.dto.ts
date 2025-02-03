import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Genre } from "src/genre/entity/genre.entity";

export class CreateMovieDto {

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: "영화 제목",
        example: "겨울 왕국",
    })
    title: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: "영화 설명",
        example: "얼음왕국 이야기",
    })
    detail: string;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number) // file upload 할때는 String만 받기 때문에 transform이 필요하다.
    @ApiProperty({
        description: "감독 아이디",
        example: 1,
    })
    directorId: number;

    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, {
        each: true // 각각이 number 이다.
    })
    @Type(() => Number) // file upload 할때는 String만 받기 때문에 transform이 필요하다.
    @ApiProperty({
        description: "장르 아이디",
        example: [1],
    })
    // @Transform(({ value }) => Array.isArray(value) ? value : [value]) // swagger bug 같음. example에 1개만 넣으면 string or number로 인식함. 그래서 보정하는 트랜스폼 사용
    genreIds: number[];

    @IsString()
    @ApiProperty({
        description: "영화 파일 이름",
        example: 'aaa-bbb-ccc-ddd.mp4',
    })
    movieFileName: string;
}