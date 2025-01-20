import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Public } from "../decorator/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector
    ) { }
    canActivate(context: ExecutionContext): boolean {
        // 만약 public decoration이 돼어 있으면
        // 모든 로직을 bypass 한다
        const isPublic = this.reflector.get(Public, context.getHandler());

        // isPublic이 빈객체가 나오면 
        if (isPublic) {
            return true;
        }
        // isPublic 이 undefined 이면 다음 코드

        // 요청에서 user 객체가 존재하는지 확인한다.
        const request = context.switchToHttp().getRequest();
        if (!request.user || request.user.type !== 'access') {
            return false;
        }

        return true;
    }

}