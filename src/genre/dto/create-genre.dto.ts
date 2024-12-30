import { IsNotEmpty, IsString } from "class-validator";
import { Column, PrimaryGeneratedColumn } from "typeorm";

export class CreateGenreDto {

    @IsNotEmpty()
    @IsString()
    name: string;
}
