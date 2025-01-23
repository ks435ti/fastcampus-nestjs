import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { v4 } from 'uuid';
import { rename } from 'fs/promises';
import { join } from "path";
@Injectable()
export class MovieFilePipe implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>> {
    constructor(
        private readonly options: {
            maxSize: number,
            mimetype: string,
        }
    ) { }
    async transform(value: Express.Multer.File, metadata: ArgumentMetadata): Promise<Express.Multer.File> {
        console.log(value);
        if (!value) {
            throw new BadRequestException(`movie 필드는 필수 입니다.${value}`);
        }
        const byteSize = this.options.maxSize * 1000 * 1000;
        if (value.size > byteSize) {
            throw new BadRequestException(`${this.options.maxSize}MB 이하의 사지으만 업로드 가능합니다.`);
        }
        if (value.mimetype !== this.options.mimetype) {
            throw new BadRequestException(`${this.options.mimetype} 만 업로드 가능합니다. -=- ${value.mimetype}`);
        }
        const split = value.originalname.split('.');

        let extension = 'mp4';

        if (split.length > 1) {
            extension = split[split.length - 1];
        }

        const filename = `${v4()}_1${Date.now()}.${extension}`;
        const newPath = join(value.destination, filename);
        await rename(value.path, newPath);
        return {
            ...value,
            filename,
            path: newPath,
        };
    }
}