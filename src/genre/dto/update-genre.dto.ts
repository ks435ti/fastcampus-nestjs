// import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { CreateGenreDto } from "./create-genre.dto";
import { PartialType } from "@nestjs/swagger";

export class UpdateGenreDto extends PartialType(CreateGenreDto) {

    // @IsNotEmpty()
    // @IsString()
    // @IsOptional()
    // name?: string;
}
