import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collaboration, CollaborationDocument } from '../../../schemas';
import { IReportGenerator, Report } from '../IReportGenerator.interface';

export abstract class AbstractCollaborationsReport<T extends Report>
  implements IReportGenerator<T>
{
  constructor(
    @InjectModel(Collaboration.name)
    protected readonly collaborationModel: Model<CollaborationDocument>,
  ) {}

  abstract get name(): string;
  abstract get uniqueId(): string;
  abstract get type(): T['type'];
  abstract create(...args: any[]): this;
  abstract generateReport(): Promise<T>;
}
