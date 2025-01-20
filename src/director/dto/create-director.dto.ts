import { IsDate, IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreateDirectorDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsDate() // main.ts 에서 enableImplicitConversion 설정을 해뒀기 때문에 변환된 다음 IsDate 체크를 하기 때문에 잘 동작한다.
    dob: Date;


    @IsNotEmpty()
    @IsString()
    nationality: string;

}
