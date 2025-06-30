import { Injectable } from '@nestjs/common';
import { GroupedReport } from '../IReportGenerator.interface';
import { AbstractProjectsReport } from './abstractProjectsReport';
import { endOfDay, endOfMonth, endOfYear } from 'date-fns';
import { Project, ProjectDocument, User, UserDocument } from '../../../schemas';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RolesEnum } from '../../../utils/enums';
import { roundWithPrecision } from '../../../utils/numbers';
import getDateGroupName, { GroupByDate } from '../../../utils/getDateGroupName';

export interface CreatedProjectsPerUserAcrossTimeReportGroup {
  date: string;
  total: number;
  totalUsers: number;
  average: number;
}

export type CreatedProjectsPerUserAcrossTimeGroupBy = Exclude<
  GroupByDate,
  'week'
>;

@Injectable()
export class CreatedProjectsPerUserAcrossTime extends AbstractProjectsReport<
  GroupedReport<CreatedProjectsPerUserAcrossTimeReportGroup>
> {
  startAt: Date;
  endAt: Date;
  groupBy: CreatedProjectsPerUserAcrossTimeGroupBy;

  constructor(
    @InjectModel(Project.name)
    protected readonly projectModel: Model<ProjectDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super(projectModel);
  }

  create(
    startAt: Date,
    endAt: Date,
    groupBy: CreatedProjectsPerUserAcrossTimeGroupBy = 'day',
  ) {
    this.startAt = startAt;
    this.endAt = endAt;
    this.groupBy = groupBy;

    return this;
  }

  get name(): 'created-projects-per-user-across-time' {
    return 'created-projects-per-user-across-time';
  }

  get uniqueId(): string {
    return `${this.name}-${this.startAt.getTime()}-${this.endAt.getTime()}-${
      this.groupBy
    }`;
  }

  get type(): 'grouped' {
    return 'grouped';
  }

  async generateReport(): Promise<
    GroupedReport<CreatedProjectsPerUserAcrossTimeReportGroup>
  > {
    const data = await this.getData();

    return {
      uniqueId: this.uniqueId,
      type: 'grouped',
      data,
    };
  }

  async getData(): Promise<{
    groups: CreatedProjectsPerUserAcrossTimeReportGroup[];
  }> {
    const projects = await this.projectModel
      .find({
        createdAt: {
          $gte: this.startAt,
          $lte: this.endAt,
        },
      })
      .exec();

    const totalGroups = projects.reduce<
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
          group.total / totalUsersRegisteredUntilDate,
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
    groupBy: CreatedProjectsPerUserAcrossTimeGroupBy,
  ): Date {
    if (groupBy === 'day') {
      return endOfDay(date);
    }

    if (groupBy === 'month') {
      return endOfMonth(date);
    }

    return endOfYear(date);
  }
}
