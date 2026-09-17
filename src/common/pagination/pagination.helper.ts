import {
  PaginatedResult,
  PaginationOptions,
} from "@common/pagination/pagination.interface";

export class PaginationHelper {
  static parse(page: any, pageSize: any): PaginationOptions {
    let parsedPage = Number(page);
    let parsedPageSize = Number(pageSize);

    if (Number.isNaN(parsedPage)) {
      parsedPage = 1;
    }
    if (Number.isNaN(parsedPageSize)) {
      parsedPageSize = 15;
    }

    const sanitizedPage = Math.max(1, Math.floor(parsedPage));
    const sanitizedPageSize = Math.min(
      100,
      Math.max(1, Math.floor(parsedPageSize))
    );

    return {
      page: sanitizedPage,
      pageSize: sanitizedPageSize,
      offset: (sanitizedPage - 1) * sanitizedPageSize,
      limit: sanitizedPageSize,
    };
  }

  static createResult<T>(
    data: T[],
    total: number,
    options: PaginationOptions
  ): PaginatedResult<T> {
    const totalPages = Math.ceil(total / options.limit);

    return {
      data,
      meta: {
        page: options.page,
        pageSize: options.pageSize,
        total,
        totalPages,
        hasNext: options.page < totalPages,
        hasPrevious: options.page > 1,
      },
    };
  }
}
