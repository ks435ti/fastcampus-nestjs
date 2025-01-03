import { Controller, Post, Headers, UseGuards, Request, Get, Head } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGard } from './strategy/local.strategy';
import { JwtAuthGard } from './strategy/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("register")
  // authorization : Basic $token
  registerUser(@Headers('authorization') token: string) {
    return this.authService.registor(token);
  }

  @Post('login')
  loginUser(@Headers('authorization') token: string) {
    return this.authService.login(token);
  }
  //accessToken 재발급
  @Post('token/access')
  async rotateAccessToken(@Headers('authorization') token: string) {
    const payload = await this.authService.parseBearerToken(token, true);
    return {
      accessToken: await this.authService.issueToken(payload, false),
    };
  }

  @UseGuards(LocalAuthGard)
  @Post('login/passport')
  async loginUserPassword(@Request() req) {
    return {
      refreshToken: await this.authService.issueToken(req.user, true),
      accessToken: await this.authService.issueToken(req.user, false)
    };
  }

  @UseGuards(JwtAuthGard)
  @Get('private')
  async private(@Request() req) {
    console.log('run '); // authGard 를 통과해서 실행됨
    return req.user;
  }

}
