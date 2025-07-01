import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../schemas';
import { IReportGenerator, Report } from '../IReportGenerator.interface';

export abstract class AbstractUsersReport<T extends Report>
  implements IReportGenerator<T>
{
  constructor(
    @InjectModel(User.name) protected readonly userModel: Model<UserDocument>,
  ) {}

  abstract get name(): string;
  abstract get uniqueId(): string;
  abstract get type(): T['type'];
  abstract create(...args: any[]): this;
  abstract generateReport(): Promise<T>;
}
