import { Injectable } from '@nestjs/common';
import {
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
} from 'date-fns';
import { FilterQuery } from 'mongoose';
import { TrackDocument } from '../../../schemas';
import { audioExtensions, videoExtensions } from '../../../utils/constants';
import { roundWithPrecision } from '../../../utils/numbers';
import { GenericReport } from '../IReportGenerator.interface';
import { AbstractTracksReport } from './abstractTracksReport';

type GroupResult = {
  total: number;
  average: number;
};

export interface AverageUploadedFilesServiceReportValue {
  general: GroupResult;
  audio: GroupResult;
  video: GroupResult;
  other: GroupResult;
}

export type AverageUploadedFilesGroupBy = 'day' | 'month' | 'week';

type ReportType = GenericReport<AverageUploadedFilesServiceReportValue>;

@Injectable()
export class AverageUploadedFiles extends AbstractTracksReport<ReportType> {
  startAt: Date;
  endAt: Date;
  groupBy: AverageUploadedFilesGroupBy;

  get name() {
    return 'average-uploaded-files';
  }

  get uniqueId() {
    return `${this.name}-${this.startAt.getTime()}-${this.endAt.getTime()}-${
      this.groupBy
    }`;
  }

  get type(): ReportType['type'] {
    return 'generic';
  }

  create(startDate: Date, endDate: Date, groupBy: AverageUploadedFilesGroupBy) {
    this.startAt = startDate;
    this.endAt = endDate;
    this.groupBy = groupBy;

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

  async getData(): Promise<AverageUploadedFilesServiceReportValue> {
    const dateFilter: FilterQuery<TrackDocument> = {
      createdAt: {
        $gte: this.startAt,
        $lte: this.endAt,
      },
    };

    const total = await this.trackModel.find(dateFilter).count();
    const totalAudio = await this.trackModel
      .find({
        ...dateFilter,
        extension: {
          $in: audioExtensions,
        },
      })
      .count();
    const totalVideo = await this.trackModel
      .find({
        ...dateFilter,
        extension: {
          $in: videoExtensions,
        },
      })
      .count();
    const totalOtherFormats = total - totalAudio - totalVideo; // GarageBand, ProTools, etc.

    const average = this.calculateAverageByGroup(total);
    const averageAudio = this.calculateAverageByGroup(totalAudio);
    const averageVideo = this.calculateAverageByGroup(totalVideo);
    const averageOtherFormats = this.calculateAverageByGroup(totalOtherFormats);

    return {
      general: {
        total,
        average,
      },
      audio: {
        total: totalAudio,
        average: averageAudio,
      },
      video: {
        total: totalVideo,
        average: averageVideo,
      },
      other: {
        total: totalOtherFormats,
        average: averageOtherFormats,
      },
    };
  }

  calculateAverageByGroup(total: number): number {
    let divider;

    switch (this.groupBy) {
      case 'day':
        divider = differenceInDays(this.endAt, this.startAt);
        break;
      case 'month':
        divider = differenceInMonths(this.endAt, this.startAt);
        break;
      case 'week':
        divider = differenceInWeeks(this.endAt, this.startAt, {
          roundingMethod: 'round',
        });
        break;
    }

    const average = total / (divider || 1);

    return roundWithPrecision(average, 2);
  }
}
