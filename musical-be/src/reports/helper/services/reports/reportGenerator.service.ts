import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { IReportGenerator, Report } from './IReportGenerator.interface';

@Injectable()
export class ReportGeneratorService {
  readonly CACHE_TTL: number;

  constructor(
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    this.CACHE_TTL = this.configService.get<number>('REPORTS_CACHE_TTL');
  }

  async generateCachedReport<X extends IReportGenerator<Report>>(
    generator: X,
  ): Promise<Awaited<ReturnType<X['generateReport']>>> {
    const isCached = await this.isCached(generator.uniqueId);

    if (!isCached) {
      const cachedData = await this.getCached<
        Awaited<ReturnType<X['generateReport']>>
      >(generator.uniqueId);

      return {
        uniqueId: generator.uniqueId,
        type: generator.type,
        data: cachedData,
      } as Awaited<ReturnType<X['generateReport']>>;
    }

    const report = await generator.generateReport();

    await this.setCached(generator.uniqueId, report.data);

    return report as Awaited<ReturnType<X['generateReport']>>;
  }

  private async isCached(cacheKey: string): Promise<boolean> {
    if (process.env.NODE_ENV === 'development') {
      return false;
    }

    const exists = (await this.redis.exists(cacheKey)) > 0;

    return exists;
  }

  private async getCached<T>(cacheKey: string): Promise<T> {
    const cached = await this.redis.get(cacheKey);

    return JSON.parse(cached);
  }

  private async setCached<T>(cacheKey: string, data: T): Promise<void> {
    await this.redis.set(cacheKey, JSON.stringify(data), 'EX', this.CACHE_TTL);
  }
}
