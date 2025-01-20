import { BadRequestException, Injectable } from "@nestjs/common";
import { SelectQueryBuilder } from "typeorm";
import { PagePagenationDto } from "./dto/page-pagination.dto";
import { CursorPaginationDto } from "./dto/cursor-pagination.dto";
import { dir } from "console";

@Injectable()
export class CommonService {
    constructor() { }
    applyPagePaginationParamsToQb<T>(qb: SelectQueryBuilder<T>, dto: PagePagenationDto) {
        const { page, take } = dto;
        const skip = (page - 1) * take;
        qb.take(take);
        qb.skip(skip);
    }

    async applyCursorPaginationParamsToQb<T>(qb: SelectQueryBuilder<T>, dto: CursorPaginationDto) {
        let { cursor, order, take } = dto;

        if (cursor) {
            const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');
            /**
            * {
            * values:{
            *      id:27
            *  },
            *  order:["id_DESC"]
            * }
            * 
            */
            const cursorObj = JSON.parse(decodedCursor);
            order = cursorObj.order; // front에서 order 값을 입력해서 데이터가 오염되는 것을 방지하기 위해 cursor에 기록되어 있는데이터로 덮는다.
            const { values } = cursorObj;

            // (movie.column1, movie.column2, movie.column3) > (:vlaues1, :value2, :value3)  // postgresql or mysql 문법
            const columns = Object.keys(values);
            const comparisonOperator = order.some((o) => o.endsWith('DESC')) ? '<' : '>'; // 정렬이 모두 같을경우 , 만약 다르다면 sql을 코드를 js로 구현해야함
            const whereConditions = columns.map(c => `${qb.alias}.${c}`).join(',');
            const whereParams = columns.map(c => `:${c}`).join(',');

            qb.where(`(${whereConditions}) ${comparisonOperator} (${whereParams})`, values);
        }

        // ["id_DESC", "likeCount_DESC"]
        for (let i = 0; i < order.length; i++) {
            const [column, direction] = order[i].split('_');
            if (direction !== "ASC" && direction !== "DESC") {
                throw new BadRequestException("Order는 ASC or DESC로 입력");
            }
            if (i === 0) {
                qb.orderBy(`${qb.alias}.${column}`, direction);
            } else {
                qb.addOrderBy(`${qb.alias}.${column}`, direction);
            }
        }


        // if (cursor) {
        //     const direction = order === "ASC" ? ">" : "<";
        //     /// order --> ASC : movie.id > :id
        //     qb.where(`${qb.alias}.id ${direction} :id`, { id: cursor });
        // }
        // // id 를 입력하지않으면 정렬 순서만 다름
        // qb.orderBy(`${qb.alias}.id`, order); // qb.alias 는 내가 선택한 테이블, Movie 테이블 선택했으면 Movie라고 나옴

        qb.take(take);
        const results = await qb.getMany();
        const nextCursor = this.generateNextCursor(results, order);
        // return results;
        return { qb, nextCursor };
    }

    generateNextCursor<T>(results: T[], order: string[]): string | null {
        if (results.length === 0) return null;
        /**
         * {
         * values:{
         *      id:27
         *  },
         *  order:["id_DESC"]
         * }
         * 
         */
        const lastItem = results[results.length - 1];
        const values = {};
        order.forEach((columnOrder) => {
            const [column] = columnOrder.split('_');
            values[column] = lastItem[column];
        });
        const cursorObj = { values, order };
        const nextCursor = Buffer.from(JSON.stringify(cursorObj)).toString('base64');
        return nextCursor;

    }
}