import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Genre } from "src/genre/entity/genre.entity";

export class CreateMovieDto {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    detail: string;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number) // file upload 할때는 String만 받기 때문에 transform이 필요하다.
    directorId: number;

    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, {
        each: true // 각각이 number 이다.
    })
    @Type(() => Number) // file upload 할때는 String만 받기 때문에 transform이 필요하다.
    genreIds: number[];

    @IsString()
    movieFileName: string;
}