import { IsArray, IsIn, IsInt, IsOptional, IsString } from "class-validator";

export class CursorPaginationDto {
    // id_52,likeCount_20
    @IsString()
    @IsOptional()
    cursor?: string;

    @IsArray()
    @IsString({
        each: true // array 각각은 모두 string 이어야한다.
    })
    @IsOptional()
    // ["id_DESC", "likeCount_DESC"]
    order: string[] = ["id_DESC"];

    @IsInt()
    @IsOptional()
    take: number = 5;
}