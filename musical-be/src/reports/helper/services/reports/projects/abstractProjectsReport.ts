import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../../../schemas';
import { IReportGenerator, Report } from '../IReportGenerator.interface';

export abstract class AbstractProjectsReport<T extends Report>
  implements IReportGenerator<T>
{
  constructor(
    @InjectModel(Project.name)
    protected readonly projectModel: Model<ProjectDocument>,
  ) {}

  abstract get name(): string;
  abstract get uniqueId(): string;
  abstract get type(): T['type'];
  abstract create(...args: any[]): this;
  abstract generateReport(): Promise<T>;
}
