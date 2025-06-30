import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Track, TrackDocument } from '../../../schemas';
import { IReportGenerator, Report } from '../IReportGenerator.interface';

export abstract class AbstractTracksReport<T extends Report>
  implements IReportGenerator<T>
{
  constructor(
    @InjectModel(Track.name)
    protected readonly trackModel: Model<TrackDocument>,
  ) {}

  abstract get name(): string;
  abstract get uniqueId(): string;
  abstract get type(): T['type'];
  abstract create(...args: any[]): this;
  abstract generateReport(): Promise<T>;
}
