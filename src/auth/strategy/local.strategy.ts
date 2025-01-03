import { validate } from 'class-validator';
import { Injectable } from "@nestjs/common";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from '../auth.service';


export class LocalAuthGard extends AuthGuard('codefactory') { }

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "codefactory") { // PassportStrategy의 두번째 input은 전략 이름(alias)이다
    constructor(
        private readonly authService: AuthService,
    ) {

        super({
            usernameField: 'email' // username이 아니라 "email"로 사용할때,
        });
    }
    /**
     * LocalStrategy
     * 
     * validate : username, password
     * 
     * return -> Request();
     */
    async validate(email: string, password: string) {
        const user = await this.authService.authenticate(email, password);
        return user;
    }
}