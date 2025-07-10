import { Injectable } from '@nestjs/common';
import { AbstractCollaborationsReport } from './abstractCollaborationsReport';
import { GenericReport } from '../IReportGenerator.interface';

export interface PostedCollaborationsReportValue {
  total: number;
}

type ReportType = GenericReport<PostedCollaborationsReportValue>;

@Injectable()
export class PostedCollaborations extends AbstractCollaborationsReport<ReportType> {
  startAt: Date;
  endAt: Date;

  get name(): 'posted-collaborations' {
    return 'posted-collaborations';
  }

  get uniqueId(): string {
    return `${this.name}-${this.startAt.getTime()}-${this.endAt.getTime()}`;
  }

  get type(): ReportType['type'] {
    return 'generic';
  }

  create(startAt: Date, endAt: Date) {
    this.startAt = startAt;
    this.endAt = endAt;

    return this;
  }

  async generateReport(): Promise<ReportType> {
    const data = await this.getData();

    return {
      uniqueId: this.uniqueId,
      type: this.type,
      data,
    };
  }

  private async getData(): Promise<PostedCollaborationsReportValue> {
    const collaborations = await this.collaborationModel
      .find({
        createdAt: {
          $gte: this.startAt,
          $lte: this.endAt,
        },
      })
      .exec();
    const total = collaborations.length;

    return { total };
  }
}
