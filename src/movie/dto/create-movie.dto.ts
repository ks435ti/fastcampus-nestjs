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
    directorId: number;

    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, {
        each: true // 각각이 number 이다.
    })
    genreIds: number[];

}