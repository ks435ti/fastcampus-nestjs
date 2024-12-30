import { ArrayNotEmpty, Contains, Equals, IsAlphanumeric, IsArray, IsBoolean, IsCreditCard, IsDateString, IsDefined, IsDivisibleBy, IsEmpty, IsEnum, isEnum, IsHexColor, IsIn, IsInt, IsLatLong, IsNegative, IsNotEmpty, IsNotIn, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Max, MaxLength, Min, MinLength, NotContains, NotEquals, registerDecorator, Validate, validate, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { number } from "joi";
enum MovieGenre {
    Fantasy = "fantasy",
    Action = "action"
}

@ValidatorConstraint({
    async: true // 비동기도 가능
})
class PasswordValidator implements ValidatorConstraintInterface {
    validate(value: any, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
        /// 비밀번호 길이는 4-8
        return value.length > 4 && value.length < 8;
    }
    defaultMessage?(validationArguments?: ValidationArguments): string {
        return '비밀번호 길이는 4-8자 ($value)'; // $value 붙이면 입력 값 받을수 있음
    }

}
function IsPasswordValid(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: PasswordValidator,
        });
    };
}
export class UpdateMovieDto {

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    title?: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, {
        each: true
    })
    @IsOptional()
    genreIds?: number[];

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    detail?: string;

    @IsNotEmpty()
    @IsOptional()
    @IsNumber()
    directorId?: number;
    /* class-validator */
    // @IsDefined() // null / undefined 
    // @IsOptional() // 입력 값이 없으면 다른 validator를 실행하지 않음
    // @Equals("code factory") // 파라미터와 같은 값만 됨
    // @NotEquals("Code Factory") // 파라미터와 같은 값만 안됨
    // @IsEmpty() // null/undefined/"" 만 가능
    // @IsNotEmpty() // null/undefined/"" 불가능
    /// Array
    // @IsIn(['action', 'fantasy']) // 리스트의 값 중 하나만 가능
    // @IsNotIn(['action', 'fantasy']) // 리스트의 값은 불가능

    /* type-validator */
    // @IsBoolean()
    // @IsString()
    // @IsNumber()
    // @IsInt()
    // @IsArray()
    // @IsEnum(MovieGenre)
    // @IsDateString()

    /* Number-validator */
    // @IsDivisibleBy(5) // 5로 나눌수 있는 값?
    // @IsPositive() // 양수인가?
    // @IsNegative() // 음수인가?
    // @Min(100)// 100 이상
    // @Max(50) // 50 이하
    // @Contains("code factory") // 앞뒤 어디든 있으면 된다.
    // @NotContains("code factory") // 앞뒤 어디든 있으면 안된다.
    // @IsAlphanumeric() // 빈칸/한글 도 허용 안함
    // @IsCreditCard() // 카드번호 형식인가 (얼마나 신뢰도 있는가는 모름)
    // @IsHexColor() // 16진수 색깔인가?
    // @MaxLength(16) // 최대 길이 
    // @MinLength(4) // 최소 길이
    // @IsUUID() // uuid 형식인가?
    // @IsLatLong() // 위/경도

    /* Custom-validator */
    // @Validate(PasswordValidator, { message: "다른 에러 메세지" })
    // @IsPasswordValid()
    // test: string;

}
