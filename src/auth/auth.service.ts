import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as  bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { envVariableKeys } from 'src/common/const/env.const';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) { }

    parseBasicToken(rawToken: string) {
        // 1) 토큰을 ' ' 기준으로 스필릿 한 후 토큰 값만 추출하기
        // ['Basic', '$token']
        const basicSplit = rawToken.split(' ');
        if (basicSplit.length !== 2) {
            throw new BadRequestException("토큰 포멧이 잘못됐습니다.1");
        }

        const [basic, token] = basicSplit;

        if (basic.toLocaleLowerCase() !== 'basic') {
            throw new BadRequestException('토큰 포맷이 잘못됐습니다.2');
        }

        /// 2) 추출한 토큰을 base64 디코딩해서 이메일과 비밀번호로 나눈다.
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        // 'email:password
        const tokenSplit = decoded.split(':');
        if (tokenSplit.length !== 2) {
            throw new BadRequestException("토큰 포멧이 잘못됐습니다.3");
        }
        const [email, password] = tokenSplit;
        return { email, password };
    }

    async parseBearerToken(rawToken: string, isRefreshToken: boolean) {
        // 1) 토큰을 ' ' 기준으로 스필릿 한 후 토큰 값만 추출하기
        // ['Bearer', '$token']
        const bearerSplit = rawToken.split(' ');
        if (bearerSplit.length !== 2) {
            throw new BadRequestException("토큰 포멧이 잘못됐습니다.4");
        }

        const [bearer, token] = bearerSplit;

        if (bearer.toLocaleLowerCase() !== 'bearer') {
            throw new BadRequestException('토큰 포맷이 잘못됐습니다.5');
        }
        try {

            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>(
                    isRefreshToken ? envVariableKeys.refreshTokenSecret : envVariableKeys.accessTokenSecret)
            });
            /// accessToken으로 accessToken 발급 방지
            if (isRefreshToken) {
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

    // rawToken -> "Basic $token"
    async registor(rawToken: string) {
        const { email, password } = this.parseBasicToken(rawToken);
        const user = await this.userRepository.findOne({
            where: {
                email
            }
        });
        if (user) {
            throw new BadRequestException('이미 가입한 이메일 입니다.');
        }

        const hashRounds = this.configService.get<number>(envVariableKeys.hashRounds);
        // rouds를 하면 salt는 자동 생성됨
        const hash = await bcrypt.hash(password, hashRounds);
        await this.userRepository.save({
            email,
            password: hash
        });

        return this.userRepository.findOne({ where: { email: email } });
    }

    async authenticate(email: string, password: string) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new BadRequestException('잘못된 로그인 정보 입니다.');
        }
        const passOK = await bcrypt.compare(password, user.password);
        if (!passOK) {
            throw new BadRequestException('잘못된 로그인 정보 입니다.');
        }
        return user;
    }

    async issueToken(user: { id: number, role: Role; }, isRefreshToken: boolean) {

        const refreshTokenSecret = this.configService.get<string>(envVariableKeys.refreshTokenSecret);
        const accessTokenSecret = this.configService.get<string>(envVariableKeys.accessTokenSecret);
        return await this.jwtService.signAsync({
            sub: user.id,
            role: user.role,
            type: isRefreshToken ? 'refresh' : 'access',
        }, {
            secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
            expiresIn: isRefreshToken ? '24h' : 300
        });
    }

    async login(rawToken: string) {
        const { email, password } = this.parseBasicToken(rawToken);


        const user = await this.authenticate(email, password);
        return {
            refreshToken: await this.issueToken(user, true),
            accessToken: await this.issueToken(user, false),
        };
    }
}
