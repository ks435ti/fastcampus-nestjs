import { IsOptional, IsString } from "class-validator";
import { PagePagenationDto } from "src/common/dto/page-pagination.dto";

export class GetMoviesDto extends PagePagenationDto {
    @IsOptional()
    @IsString()
    title: string;
}