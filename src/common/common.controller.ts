import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('common')
export class CommonController {
    @Post('video')
    @UseInterceptors(FileInterceptor(
        'video',
        {
            limits: {
                fileSize: 3 * 1000 * 1000, // 1Mb
            },
            fileFilter(req, file, callback) {
                // console.log(file);
                if (file.mimetype !== "video/mp4") {
                    return callback(new BadRequestException('mp4 타입만 업로드 가능!'), false);
                }
                // param1 은 해당 에러를 던짐, null이면 아무것도 안함
                // param2 는 파일을 저장할지 말지 결정 , false 이면 저장 안함
                return callback(null, true);
            }
        }
    ))
    createVideo(
        @UploadedFile() movie: Express.Multer.File
    ) {
        return {
            fileName: movie.filename
        };
    }
}
