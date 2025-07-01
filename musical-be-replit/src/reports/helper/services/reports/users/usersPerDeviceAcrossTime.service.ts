import { Injectable } from '@nestjs/common';
import { Device } from '../../../schemas';
import { GroupedReport } from '../IReportGenerator.interface';
import { AbstractUsersReport } from './abstractUsersReport';
import getDateGroupName, { GroupByDate } from '../../../utils/getDateGroupName';

export interface UsersPerDeviceAcrossTimeReportGroup {
  date: string;
  devices: {
    [key: string]: number;
  };
}

export type UsersPerDeviceAcrossTimeGroupBy = Exclude<GroupByDate, 'week'>;

@Injectable()
export class UsersPerDeviceAcrossTime extends AbstractUsersReport<
  GroupedReport<UsersPerDeviceAcrossTimeReportGroup>
> {
  startAt: Date;
  endAt: Date;
  groupBy: UsersPerDeviceAcrossTimeGroupBy;

  create(
    startAt: Date,
    endAt: Date,
    groupBy: UsersPerDeviceAcrossTimeGroupBy = 'day',
  ) {
    this.startAt = startAt;
    this.endAt = endAt;
    this.groupBy = groupBy;

    return this;
  }

  get name(): 'users-per-device-across-time' {
    return 'users-per-device-across-time';
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
    GroupedReport<UsersPerDeviceAcrossTimeReportGroup>
  > {
    const data = await this.getData();

    return {
      uniqueId: this.uniqueId,
      type: 'grouped',
      data,
    };
  }

  private async getData(): Promise<{
    groups: UsersPerDeviceAcrossTimeReportGroup[];
  }> {
    const registers = await this.userModel
      .find({
        createdAt: {
          $gte: this.startAt,
          $lte: this.endAt,
        },
        registerDevice: {
          $exists: true,
        },
      })
      .exec();

    const groups = registers.reduce((acc, register) => {
      const groupName = getDateGroupName(register.createdAt, this.groupBy);
      const group = acc.find((group) => group.date === groupName);
      const deviceName = this.getDeviceName(register.registerDevice);

      if (group) {
        group.devices[deviceName]++;

        return acc;
      }

      const newGroup: UsersPerDeviceAcrossTimeReportGroup = {
        date: groupName,
        devices: {
          android: 0,
          ios: 0,
          web: 0,
          ...{ [deviceName]: 1 },
        },
      };

      return [...acc, newGroup];
    }, []);

    return {
      groups,
    };
  }

  private getDeviceName(device: Device): 'android' | 'ios' | 'web' {
    if (device.os.name.toLowerCase() === 'android') {
      return 'android';
    }

    if (device.os.name.toLowerCase() === 'ios') {
      return 'ios';
    }

    return 'web';
  }
}
