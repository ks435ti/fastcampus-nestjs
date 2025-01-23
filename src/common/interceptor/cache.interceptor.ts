import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, of, tap } from "rxjs";

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    // 이렇게 cache 하는 것보단 redis 같은걸로 하는게 좋다.
    private cache = new Map<String, any>();
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();

        /// GET /movie
        const key = `${request.method} - ${request.path}`;
        if (this.cache.has(key)) {
            return of(this.cache.get(key));
        }

        return next.handle()
            .pipe(
                /// 결과를  param으로 받을수 있다.
                tap(response => this.cache.set(key, response)
                )
            );

    }

}