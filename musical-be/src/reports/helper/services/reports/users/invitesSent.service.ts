import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Invite, InviteDocument, User, UserDocument } from '../../../schemas';
import { InviteStatusEnum } from '../../../utils/enums';
import { ListReport } from '../IReportGenerator.interface';
import { AbstractUsersReport } from './abstractUsersReport';

export interface InviterReportItem {
  user: User;
  invites_sent: number;
  invites_used: number;
}

@Injectable()
export class InvitesSent extends AbstractUsersReport<
  ListReport<InviterReportItem>
> {
  startAt: Date;
  endAt: Date;

  constructor(
    @InjectModel(User.name) protected readonly userModel: Model<UserDocument>,
    @InjectModel(Invite.name)
    protected readonly inviteModel: Model<InviteDocument>,
  ) {
    super(userModel);
  }

  create(startAt: Date, endAt: Date) {
    this.startAt = startAt;
    this.endAt = endAt;

    return this;
  }

  get name(): 'invites-sent' {
    return 'invites-sent';
  }

  get uniqueId(): string {
    return `${this.name}-${this.startAt.getTime()}-${this.endAt.getTime()}`;
  }

  get type(): 'list' {
    return 'list';
  }

  async generateReport(): Promise<ListReport<InviterReportItem>> {
    const data = await this.getData();

    return {
      uniqueId: this.uniqueId,
      type: 'list',
      data,
    };
  }

  async getData(): Promise<InviterReportItem[]> {
    const invites = await this.inviteModel
      .find({
        updatedAt: {
          $gte: this.startAt,
          $lte: this.endAt,
        },
        status: {
          $in: [InviteStatusEnum.SEND, InviteStatusEnum.USED],
        },
      })
      .populate({
        path: 'user',
        select: 'name profile_img',
      })
      .exec();

    const invitesGroupedByUser = invites.reduce((acc, invite) => {
      const user = invite.user as UserDocument & { _id: ObjectId };
      const userId = user._id.toString();

      if (!acc[userId]) {
        acc[userId] = {
          user: user,
          invites_sent: 0,
          invites_used: 0,
        };
      }

      acc[userId].invites_sent++;

      if (invite.status === InviteStatusEnum.USED) {
        acc[userId].invites_used++;
      }

      return acc;
    }, {});

    return Object.values(invitesGroupedByUser);
  }
}
