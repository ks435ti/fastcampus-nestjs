import { Transform, Type } from 'class-transformer';
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsOptional, IsString } from "class-validator";

export class CursorPaginationDto {
    // id_52,likeCount_20
    @IsString()
    @IsOptional()
    @ApiProperty({
        description: '페이지네이션 커서',
        example: "eyJ2YWx1ZXMiOnsiaWQiOjEwfSwib3JkZXIiOlsiaWRfQVNDIl19"
    })
    cursor?: string;

    @IsArray()
    @IsString({
        each: true // array 각각은 모두 string 이어야한다.
    })
    @IsOptional()
    @ApiProperty({
        description: '내림차 또는 오름차',
        example: ["id_DESC"]
    })
    @Transform(({ value }) => Array.isArray(value) ? value : [value]) // swagger bug 같음. example에 1개만 넣으면 string으로 인식함. 그래서 보정하는 트랜스폼 사용
    // ["id_DESC", "likeCount_DESC"]
    order: string[] = ["id_DESC"];

    @IsInt()
    @IsOptional()
    @ApiProperty({
        description: '가져올 데이터 갯수',
        example: 5
    })
    @Type(() => Number)
    take: number = 5;
}