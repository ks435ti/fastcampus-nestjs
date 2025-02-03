import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";

export class MovieTitleValidationPipe implements PipeTransform<string, string> {
    transform(value: string, metadata: ArgumentMetadata): string {
        if (!value) return value;

        /// 검증 : 만약에 글자 길이가 2보다 작거나 같으면 에러 던지기!
        if (value.length <= 2) {
            throw new BadRequestException("영화 제목은 3자 이상 작성해주세요!");
        }
        /// 변환 : 원하는 형태로 변환 가능
        return value;
    }
}
