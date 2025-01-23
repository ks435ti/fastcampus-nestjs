import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor } from "@nestjs/common";
import { delay, Observable, tap } from "rxjs";

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        /// 요청 보내기 전에 실행한다.
        const req = context.switchToHttp().getRequest();

        const reqTime = Date.now();

        /// 응답을 받고나서 실행한다.
        return next.handle()
            .pipe( // pipe 는  아래 함수를 순차적으로 실행하고 완료되면 다음 함수 실행 한다.
                // delay(1000), /// 1초 그냥 기다림 
                tap(() => {
                    const respTime = Date.now();
                    const diff = respTime - reqTime;
                    // if (diff > 1000) {
                    //     console.log(`!!!TimeOUT!!![${req.method} ${req.path}] ${diff}ms`);
                    //     throw new InternalServerErrorException('시간이 너무 오래 걸렸습니다.');
                    // } else {
                    console.log(`[${req.method} ${req.path}] ${diff}ms`);
                    // }
                }),
            );
    }
}