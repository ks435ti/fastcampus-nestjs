import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { CursorPaginationDto } from "src/common/dto/cursor-pagination.dto";
import { PagePagenationDto } from "src/common/dto/page-pagination.dto";

export class GetMoviesDto extends CursorPaginationDto {
    @IsOptional()
    @IsString()
    @ApiProperty({
        description: "영화 제목",
        example: "Henrietta"
    })// nestjs-cli 에서 정의해서 다른건 설정할필요 없음
    title: string;
}