import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Role } from "src/user/entities/user.entity";
import { RBAC } from "../decorator/rbac.decorator";

@Injectable()
export class RBACGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
    ) { }
    canActivate(context: ExecutionContext): boolean {
        const role = this.reflector.get<Role>(RBAC, context.getHandler());
        // console.log("role", role);

        // Role Enum 에 해당되는 값이 데코레이터에 들어갔는지 확인하기!
        if (!Object.values(Role).includes(role)) {
            // 들어 있으면 true;
            return true;
        }

        const request = context.switchToHttp().getRequest();
        // console.log("request", request);

        const user = request.user;
        // console.log("user", user);

        if (!user) {
            return false;
        }
        return user.role <= role;
    }
}