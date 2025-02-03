import { Controller, Post, Headers, UseGuards, Request, Get, Head, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGard } from './strategy/local.strategy';
import { JwtAuthGard } from './strategy/jwt.strategy';
import { Public } from './decorator/public.decorator';
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Authorization } from './decorator/authorization.decorator';

@Controller('auth')
@ApiTags('myAuth') // endpoint를 그룹화 할수 있음
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @ApiBasicAuth()
  @Post("register")
  // authorization : Basic $token
  registerUser(@Authorization() token: string) {
    return this.authService.registor(token);
  }

  @Public()
  @ApiBasicAuth()
  @Post('login')
  loginUser(@Authorization() token: string) {
    return this.authService.login(token);
  }

  //accessToken 재발급
  @Post('token/access')
  async rotateAccessToken(
    // @Headers('authorization') token: string
    @Request() req
  ) {
    // const payload = await this.authService.parseBearerToken(token, true);
    return {
      accessToken: await this.authService.issueToken(req.user, false),
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

  @Post('token/block')
  /// RBAC 같은 걸로 특정 권한만 블락 시킬수 있는 기능 구현 가능
  blockToken(
    @Body('token') token: string,
  ) {
    return this.authService.tokenBlock(token);
  }

  @UseGuards(JwtAuthGard)
  @Get('private')
  async private(@Request() req) {
    console.log('run '); // authGard 를 통과해서 실행됨
    return req.user;
  }

}
