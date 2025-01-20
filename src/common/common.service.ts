import { Injectable } from "@nestjs/common";
import { SelectQueryBuilder } from "typeorm";
import { PagePagenationDto } from "./dto/page-pagination.dto";

@Injectable()
export class CommonService {
    constructor() { }
    applyPagePaginationParamsToQb<T>(qb: SelectQueryBuilder<T>, dto: PagePagenationDto) {
        const { page, take } = dto;
        const skip = (page - 1) * take;
        qb.take(take);
        qb.skip(skip);
    }
}