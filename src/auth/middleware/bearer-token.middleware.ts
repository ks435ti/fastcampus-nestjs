import { JwtService } from '@nestjs/jwt';
import { BadRequestException, Inject, Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from 'src/common/const/env.const';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
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
        const blockedToken = await this.cacheManager.get(`BLOCK_TOEKN_${token}`);
        if (blockedToken) {
            throw new UnauthorizedException('blocked 토큰');
        }
        const tokenKey = `TOKEN_${token}`;
        const cachedPayload = await this.cacheManager.get(tokenKey);
        if (cachedPayload) {
            console.log('cache run');
            req.user = cachedPayload;
            return next();
        }
        const decodedPayload = this.jwtService.decode(token); // decode 는 검증은 안한다.

        if (decodedPayload.type !== 'refresh' && decodedPayload.type !== 'access') {
            throw new UnauthorizedException('잘못된 토큰입니다.');
        }
        try {
            const secretKey = decodedPayload.type === "refresh" ?
                envVariableKeys.refreshTokenSecret :
                envVariableKeys.accessTokenSecret;

            const payload = await this.jwtService.verifyAsync(token, { // 페이로드 검증`
                secret: this.configService.get<string>(secretKey)
            });

            /// payload('exp) epoch time seconds
            const expiryDate = +new Date(payload['exp'] * 1000);
            const now = +Date.now();

            const differenceInSeconds = expiryDate - now / 1000;

            await this.cacheManager.set(tokenKey, payload,
                Math.max((differenceInSeconds - 30) * 1000, 1) // ms
            );


            // const isRefreshToken = payload.type === 'refresh';
            // /// accessToken으로 accessToken 발급 방지
            // if (isRefreshToken) {
            //     console.log(payload.type);
            //     if (payload.type !== 'refresh') {
            //         throw new BadRequestException('Refresh 토큰을 입력해주세요');
            //     }
            // } else {
            //     if (payload.type !== 'access') {
            //         throw new BadRequestException('access 토큰을 입력해주세요');
            //     }
            // }
            req.user = payload; // passport는 basic auth가 아니라, body로 넘어온다.
            next();
        } catch (e) {
            if (e.name == "TokenExpiredError") {
                throw new UnauthorizedException('토큰이 만료됏습니다.');
            }
            next();
            // 다른 예외가 있으면 에러 메세지 읽어서 처리하면 된다.
            // throw new UnauthorizedException('토큰이 만료 되었습니다.'); // 여기서 토큰 해석 에러 처리 안하고 auth guard에서 처리하도록 넘긴다.
        }
    }
    validateBearerToken(rawToken) {
        // 1) 토큰을 ' ' 기준으로 스필릿 한 후 토큰 값만 추출하기
        // ['Bearer', '$token']
        const bearerSplit = rawToken.split(' ');
        if (bearerSplit.length !== 2) {
            throw new BadRequestException("토큰 포멧이 잘못됐습니다.8");
        }

        const [bearer, token] = bearerSplit;
        if (bearer.toLocaleLowerCase() !== 'bearer') {
            throw new BadRequestException('토큰 포맷이 잘못됐습니다.9');
        }
        return token;
    }

}