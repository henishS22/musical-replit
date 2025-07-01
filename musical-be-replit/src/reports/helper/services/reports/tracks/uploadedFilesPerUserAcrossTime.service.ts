import { Injectable } from '@nestjs/common';
import { GroupedReport } from '../IReportGenerator.interface';
import { endOfDay, endOfMonth, endOfYear } from 'date-fns';
import { Track, TrackDocument, User, UserDocument } from '../../../schemas';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RolesEnum } from '../../../utils/enums';
import { roundWithPrecision } from '../../../utils/numbers';
import { AbstractTracksReport } from './abstractTracksReport';
import getDateGroupName, { GroupByDate } from '../../../utils/getDateGroupName';
import { audioExtensions, videoExtensions } from '../../../utils/constants';

export interface UploadedFilesPerUserAcrossTimeReportGroup {
  date: string;
  total: number;
  totalUsers: number;
  average: number;
}

export type UploadedFilesPerUserAcrossTimeGroupBy = Exclude<
  GroupByDate,
  'week'
>;

export type MediaType = 'all' | 'audio' | 'video' | 'other';

@Injectable()
export class UploadedFilesPerUserAcrossTime extends AbstractTracksReport<
  GroupedReport<UploadedFilesPerUserAcrossTimeReportGroup>
> {
  startAt: Date;
  endAt: Date;
  groupBy: UploadedFilesPerUserAcrossTimeGroupBy;
  mediaType: MediaType;

  constructor(
    @InjectModel(Track.name)
    protected readonly trackModel: Model<TrackDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super(trackModel);
  }

  create(
    startAt: Date,
    endAt: Date,
    groupBy: UploadedFilesPerUserAcrossTimeGroupBy = 'day',
    mediaType: MediaType = 'all',
  ) {
    this.startAt = startAt;
    this.endAt = endAt;
    this.groupBy = groupBy;
    this.mediaType = mediaType;

    return this;
  }

  get name(): 'uploaded-files-per-user-across-time' {
    return 'uploaded-files-per-user-across-time';
  }

  get uniqueId(): string {
    return `${this.name}-${this.startAt.getTime()}-${this.endAt.getTime()}-${
      this.groupBy
    }-${this.mediaType}`;
  }

  get type(): 'grouped' {
    return 'grouped';
  }

  async generateReport(): Promise<
    GroupedReport<UploadedFilesPerUserAcrossTimeReportGroup>
  > {
    const data = await this.getData();

    return {
      uniqueId: this.uniqueId,
      type: 'grouped',
      data,
    };
  }

  async getData(): Promise<{
    groups: UploadedFilesPerUserAcrossTimeReportGroup[];
  }> {
    const tracks = await this.trackModel
      .find({
        createdAt: {
          $gte: this.startAt,
          $lte: this.endAt,
        },
        ...this.getFilterForType(),
      })
      .exec();

    const totalGroups = tracks.reduce<
      { date: string; actualDate: Date; total: number }[]
    >((acc, project) => {
      const groupName = getDateGroupName(project.createdAt, this.groupBy);
      const group = acc.find((group) => group.date === groupName);

      if (group) {
        group.total++;

        return acc;
      }

      return [
        ...acc,
        {
          date: groupName,
          actualDate: project.createdAt,
          total: 1,
        },
      ];
    }, []);

    const groupsPromises = totalGroups.map(async (group) => {
      const limitDate = this.getLimitDate(group.actualDate, this.groupBy);
      const totalUsersRegisteredUntilDate = await this.userModel
        .countDocuments({
          createdAt: {
            $lte: limitDate,
          },
          role: {
            $in: [RolesEnum.USER],
          },
        })
        .exec();

      return {
        date: group.date,
        total: group.total,
        totalUsers: totalUsersRegisteredUntilDate,
        average: roundWithPrecision(
          group.total / (totalUsersRegisteredUntilDate || 1),
          2,
        ),
      };
    });

    const groups = await Promise.all(groupsPromises);

    return {
      groups,
    };
  }

  private getLimitDate(
    date: Date,
    groupBy: UploadedFilesPerUserAcrossTimeGroupBy,
  ): Date {
    if (groupBy === 'day') {
      return endOfDay(date);
    }

    if (groupBy === 'month') {
      return endOfMonth(date);
    }

    return endOfYear(date);
  }

  private getFilterForType(): FilterQuery<TrackDocument> {
    if (this.mediaType === 'all') {
      return {};
    }

    if (this.mediaType === 'video') {
      return {
        extension: {
          $in: videoExtensions,
        },
      };
    }

    if (this.mediaType === 'audio') {
      return {
        extension: {
          $in: audioExtensions,
        },
      };
    }

    return {
      extension: {
        $nin: [...audioExtensions, ...videoExtensions],
      },
    };
  }
}
