import { JwtService } from '@nestjs/jwt';
import { BadRequestException, Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction } from "express";
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from 'src/common/const/env.const';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }
    async use(req: Request, res: Response, next: NextFunction) {
        /// Basic $token
        /// Bearer $token
        /// None
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            next();
            return;
        }
        const token = this.validateBearerToken(authHeader);
        try {
            const decodedPayload = this.jwtService.decode(token);
            const secret = decodedPayload.type === "refresh" ?
                envVariableKeys.refreshTokenSecret :
                envVariableKeys.accessTokenSecret;
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>(secret)
            });
            /// accessToken으로 accessToken 발급 방지
            if (decodedPayload) {
                console.log(payload.type);
                if (payload.type !== 'refresh') {
                    throw new BadRequestException('Refresh 토큰을 입력해주세요');
                }
            } else {
                if (payload.type !== 'access') {
                    throw new BadRequestException('access 토큰을 입력해주세요');
                }
            }
            return payload;
        } catch (e) {
            // 다른 예외가 있으면 에러 메세지 읽어서 처리하면 된다.
            throw new UnauthorizedException('토큰이 만료 되었습니다.');
        }
    }
    validateBearerToken(rawToken) {
        // 1) 토큰을 ' ' 기준으로 스필릿 한 후 토큰 값만 추출하기
        // ['Bearer', '$token']
        const bearerSplit = rawToken.split(' ');
        if (bearerSplit.length !== 2) {
            throw new BadRequestException("토큰 포멧이 잘못됐습니다.");
        }

        const [bearer, token] = bearerSplit;

        if (bearer.toLocaleLowerCase() !== 'bearer') {
            throw new BadRequestException('토큰 포맷이 잘못됐습니다.');
        }
        return token;
    }

}