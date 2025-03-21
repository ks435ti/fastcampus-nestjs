import { ConsoleLogger, Injectable } from "@nestjs/common";

@Injectable()
export class DefaultLogger extends ConsoleLogger {
    warn(message: unknown, ...rest: unknown[]): void {
        console.log('---- warn log ----',);
        super.warn(message, ...rest);


    }
    error(message: unknown, ...rest: unknown[]): void {
        console.log('---- error log ----',);
        super.error(message, ...rest);
    }
}