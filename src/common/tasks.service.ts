import { Inject, Injectable, Logger, LoggerService } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { readdir, unlink } from "fs/promises";
import { join, parse } from "path";
import { Movie } from "src/movie/entity/movie.entity";
import { Repository } from "typeorm";
import { DefaultLogger } from "./logger/default.logger";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";


@Injectable()
export class TasksService {
    // private readonly logger = new Logger(TasksService.name);
    constructor(
        @InjectRepository(Movie)
        private readonly movieRepository: Repository<Movie>,
        private readonly schedulerRegistry: SchedulerRegistry,
        // private readonly logger: DefaultLogger,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService
    ) { }

    // @Cron('*/5 * * * * *')
    logEverySecond() {
        this.logger.fatal('fatal 레벨 로그', null, TasksService.name); // 지금 당장 수정해야 하는 부분 , swagger 에서 동작하지 않는거 같음.
        this.logger.error('error 레벨 로그', null, TasksService.name); // 중요한 문제 발생
        this.logger.warn('warn 레벨 로그', TasksService.name); // 일어나면 안되는데, 실행에는 문제 되지 않음
        this.logger.log('log 레벨 로그', TasksService.name); // 정보성 로그 , info level
        this.logger.debug('debug 레벨 로그', TasksService.name); // 개발환경에서 중요한 내용
        this.logger.verbose('verbose 레벨 로그', TasksService.name); // 진짜 중요하지 않음, 쓸데없는
    }

    // @Cron('* * * * * *')
    async eraseOrphjanFiles() {
        const files = await readdir(join(process.cwd(), 'public', 'temp'));
        const deleteFilesTargets = files.filter(file => {
            const filename = parse(file).name;
            const split = filename.split('_');
            if (split.length !== 2) {
                return true;
            }

            try {
                const date = +new Date(parseInt(split[split.length - 1]));
                const aDayInMilSec = (24 * 60 * 60 * 1000);
                const now = +new Date();
                return (now - date) > aDayInMilSec;
            } catch (e) {
                return true;
            }
        });
        console.log(deleteFilesTargets);
        await Promise.all([
            deleteFilesTargets.map(x => unlink(join(process.cwd(), 'public', 'temp', x)))
        ]);
        // for (let i = 0; i < deleteFilesTargets.length; i++) {
        //     const filename = deleteFilesTargets[i];

        //     await unlink(join(process.cwd(), 'public', 'temp', filename));
        // }

    }
    // @Cron('0 * * * * *')
    async calculateMovieLikeCounts() {
        await this.movieRepository.query(
            `
UPDATE movie m
SET "likeCount" = (
    SELECT count(*) FROM movie_user_like mul
    WHERE m.id = mul."movieId" AND mul."isLike" = true
)`
        );
        await this.movieRepository.query(
            `
UPDATE movie m
SET "dislikeCount" = (
    SELECT count(*) FROM movie_user_like mul
    WHERE m.id = mul."movieId" AND mul."isLike" = false
)`
        );
    }

    // @Cron('* * * * * *', {
    //     name: 'printer',
    // })
    printer() {
        console.log('print every seconds');
    }

    // @Cron('*/5 * * * * *')
    stopper() {
        console.log('--stopper run --');
        const job = this.schedulerRegistry.getCronJob('printer');
        // console.log('# current date');
        // console.log(new Date());
        // console.log('# Last date');
        // console.log(job.lastDate());
        // console.log('# next date');
        // console.log(job.nextDate());
        // console.log('# next dates');
        // console.log(job.nextDates(5));
        if (job.running) {
            job.stop();
        } else {
            job.start();
        }
    }

}