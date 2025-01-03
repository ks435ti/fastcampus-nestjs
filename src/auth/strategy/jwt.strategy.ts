import { validate } from 'class-validator';
import { Injectable } from "@nestjs/common";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from 'src/common/const/env.const';

export class JwtAuthGard extends AuthGuard('jwt') { }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly configService: ConfigService,
    ) {
        super({
            /// bearer $token
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>(envVariableKeys.accessTokenSecret),
        });
    }
    validate(payload: any) {
        return payload;
    }
}