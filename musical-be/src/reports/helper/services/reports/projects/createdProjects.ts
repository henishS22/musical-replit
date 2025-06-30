import { Injectable } from '@nestjs/common';
import { GenericReport } from '../IReportGenerator.interface';
import { AbstractProjectsReport } from './abstractProjectsReport';

export interface CreatedProjectsReportValue {
  total: number;
  public: number;
  private: number;
}

type ReportType = GenericReport<CreatedProjectsReportValue>;

@Injectable()
export class CreatedProjects extends AbstractProjectsReport<ReportType> {
  startAt: Date;
  endAt: Date;

  get name(): string {
    return 'created-projects';
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

  async generateReport(): Promise<GenericReport<CreatedProjectsReportValue>> {
    const data = await this.getData();

    return {
      uniqueId: this.uniqueId,
      type: this.type,
      data,
    };
  }

  private async getData(): Promise<CreatedProjectsReportValue> {
    const projects = await this.projectModel
      .find({
        createdAt: {
          $gte: this.startAt,
          $lte: this.endAt,
        },
      })
      .exec();
    const total = projects.length;
    const publicProjects = projects.filter(
      (project) => project.isPublic,
    ).length;
    const privateProjects = projects.filter(
      (project) => !project.isPublic,
    ).length;

    return {
      total,
      public: publicProjects,
      private: privateProjects,
    };
  }
}
