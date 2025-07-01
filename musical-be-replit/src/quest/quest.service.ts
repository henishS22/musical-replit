import { Injectable, Logger } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Quest, QuestDocument } from '../schemas/schemas/quest';
import { CreatorQuestDto, PublishedQuestDto, UpdateCreatorQuestDto } from './dto/quest.dto';
import { resourceDuplicateError, resourceForbidden, resourceForbiddenError, resourceNotFoundError } from './utils/errors';
import { CreatorQuest, CreatorQuestDocument } from '../schemas/schemas/creatorQuest';
import { QuestHistory, QuestHistoryDocument } from '../schemas/schemas/questHistory.schema';
import { EventTransaction, EventTransactionDocument } from '../schemas/schemas/eventTransaction';
import { Leaderboard, LeaderboardDocument } from '../schemas/schemas/leaderboard';
import { NotifiesService } from '../notifies/notifies.service';
import { ObjectId } from 'mongodb';


@Injectable()
export class QuestService {
  constructor(
    @InjectModel(Quest.name) private readonly questModel: Model<QuestDocument>,
    @InjectModel(CreatorQuest.name) private readonly creatorQuestModel: Model<CreatorQuestDocument>,
    @InjectModel(EventTransaction.name) private readonly eventTransactionModel: Model<EventTransactionDocument>,
    @InjectModel(Leaderboard.name) private readonly leaderboardModel: Model<LeaderboardDocument>,
    @InjectModel(QuestHistory.name) private readonly questHistoryModel: Model<QuestHistoryDocument>,
    private readonly notificationsService: NotifiesService,
  ) { }

  //create quest
  async create(owner: string, body: CreatorQuestDto) {
    const { questId, metaData, description, isPublished } = body

    const creatorPublishable = await this.questModel.findOne({ _id: questId, isPublished: true })
    if (!creatorPublishable) {
      return resourceNotFoundError("Mission")
    }
    if (creatorPublishable && creatorPublishable.isPublishByAdmin) {
      return resourceForbiddenError()
    }

    const existingQuest = await this.creatorQuestModel.findOne({ userId: owner.toString(), questId })
    if (existingQuest) {
      return resourceDuplicateError()
    }

    const createdQuest = new this.creatorQuestModel({
      questId,
      metaData,
      isPublished,
      description,
      userId: owner,
      identifier: creatorPublishable.identifier,
    });

    const newQuest = await createdQuest.save();
    return newQuest;
  }

  //update quest
  async update(owner: string, body: UpdateCreatorQuestDto) {
    const { creatorQuestId, metaData, description } = body

    const update = await this.creatorQuestModel.findOneAndUpdate(
      {
        userId: owner.toString(),
        _id: creatorQuestId,
        isPublished: false
      },
      {
        $set: {
          metaData,
          description,
          isPublished: true
        }
      },
      {
        new: true
      }
    );

    if (!update) {
      return resourceNotFoundError("Mission")
    }
    return update
  }

  //publish quest
  async publish(owner: string, body: PublishedQuestDto) {
    const { creatorQuestId, isPublished } = body

    const existingQuest = await this.creatorQuestModel.findOne({ userId: owner.toString(), _id: creatorQuestId })
    if (!existingQuest) {
      return resourceNotFoundError("Mission")
    }

    existingQuest.isPublished = isPublished
    await existingQuest.save();
    return existingQuest;
  }


  //List of quest that created by admin that performed by user
  async questList(owner: string) {
    const quests = await this.questModel.find({ isPublishByAdmin: true, isPublished: true });

    if (quests.length === 0) {
      return resourceNotFoundError("Missions");
    }
    const questIds = quests.map(q => q._id);

    const questHistories = await this.questHistoryModel.find({
      userId: owner,
      questId: { $in: questIds }
    });

    const historyMap = new Map();
    for (const history of questHistories) {
      historyMap.set(history.questId.toString(), history);
    }

    const updatedQuests = quests.map((quest) => {
      const history = historyMap.get(quest._id.toString());
      let isAvailable = true;

      if (history) {
        isAvailable = history.occurrence < history.maxOccurrence;
      }

      return {
        ...quest.toObject(),
        isAvailable,
      };
    });

    return updatedQuests;
  }

  //List of quest that created by admin that published by user
  async questPublishableByUser(owner: string) {
    const quests = await this.questModel.find({ isPublishByAdmin: false, isPublished: true });

    if (quests.length === 0) {
      return resourceNotFoundError("Missions");
    }

    const questIds = quests.map((q) => q._id);

    const creatorQuests = await this.creatorQuestModel.find({
      questId: { $in: questIds },
      userId: owner,
      // isPublished: true
    });

    const performedQuestIds = new Set(creatorQuests.map((cq) => cq.questId.toString()));

    const updatedQuests = quests.map((quest) => {
      const isAvailable = !performedQuestIds.has(quest._id.toString());
      return {
        ...quest.toObject(),
        isAvailable,
      };
    });

    return updatedQuests;
  }

  //List of quest that created by user 
  async questListByUser(owner: string) {

    const quests = await this.creatorQuestModel.find({ userId: owner }).populate('questId');

    // if (!quests || quests.length === 0) {
    //   return resourceNotFoundError("Missions");
    // }
    return quests ? quests : null;
  }


  //List of quest that created by user (published) that shows in the profile
  async questListByCreator(userId: string) {
    const quests = await this.creatorQuestModel.find({ userId: userId, isPublished: true }).populate('questId');
    return quests ? quests : null;
  }

  //Quest details 
  async questDetails(owner: string, creatorQuestId: string) {
    const questPerformed = await this.questHistoryModel.findOne({ userId: owner, creatorQuestId })
    const isAvailable = questPerformed ? false : true

    const quest: any = await this.creatorQuestModel.findOne({ _id: creatorQuestId }).populate('questId').populate('userId', 'name profile_img');

    if (!quest) {
      return resourceNotFoundError("Mission")
    }

    return { isAvailable, ...quest.toObject() }
  }

  //List of quest that created by user and ready for join for all users (pagination and filter)
  async questListForPlatform({ owner, query }: { owner: string; query: any }) {
    const { startDate, endDate, search, limit = 10, page = 1 } = query;

    const matchStage: any = {
      isPublished: true,
      userId: { $ne: new mongoose.Types.ObjectId(owner) },
    };

    // Handle date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start.toDateString() === end.toDateString()) {
        matchStage.createdAt = {
          $gte: start,
          $lt: new Date(start.getTime() + 86400000),
        };
      } else {
        matchStage.createdAt = {
          $gte: start,
          $lte: end,
        };
      }
    }

    const pipeline: any[] = [
      { $match: matchStage },

      // Lookup quest data
      {
        $lookup: {
          from: 'quests',
          localField: 'questId',
          foreignField: '_id',
          as: 'quest',
        },
      },
      { $unwind: '$quest' },

      // Lookup user data
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          isActive: 1,
          isPublished: 1,
          identifier: 1,
          description: 1,
          metaData: 1,
          createdAt: 1,
          updatedAt: 1,

          quest: {
            _id: 1,
            name: 1,
            identifier: 1,
            points: 1,
            occurrence: 1,
          },

          user: {
            _id: 1,
            name: 1,
            profile_img: 1,
          },
        },
      },
    ];

    // Handle search filter
    if (search) {
      const regex = { $regex: search, $options: 'i' };

      pipeline.push({
        $match: {
          $or: [
            { 'quest.name': regex },
            { 'user.name': regex },
            { 'metaData.caption': regex },
            { 'metaData.mentions': { $elemMatch: regex } },
            { 'metaData.hashtags': { $elemMatch: regex } },
          ],
        },
      });
    }

    // Count total without pagination
    const countPipeline = [...pipeline, { $count: 'count' }];
    const totalCountResult = await this.creatorQuestModel.aggregate(countPipeline);
    const total = totalCountResult[0]?.count || 0;

    // Add pagination and sorting
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: Number(limit) }
    );

    const data = await this.creatorQuestModel.aggregate(pipeline);

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  //function for quest history save .
  async createQuestHistory(
    isPublishByAdmin: boolean,
    questId: string,
    creatorQuestId: string,
    owner: string
  ) {
    console.log({ isPublishByAdmin, questId, creatorQuestId, owner });

    const quest = await this.questModel.findOne({ _id: questId, isPublished: true });
    if (!quest) {
      Logger.warn(`No active mission found.`);
      return resourceNotFoundError("Mission");
    }

    const creatorQuest = await this.creatorQuestModel.findOne({ _id: creatorQuestId, isPublished: true });

    const questHistoryFilter: any = {
      userId: owner,
      questId: questId,
    };
    if (!isPublishByAdmin) {
      questHistoryFilter.creatorQuestId = creatorQuestId;
    }

    const existingQuest = await this.questHistoryModel.findOne(questHistoryFilter);
    let shouldUpdate = false;

    if (existingQuest) {
      if (existingQuest.occurrence < quest.occurrence) {
        existingQuest.occurrence += 1;
        existingQuest.points += quest.points;
        await existingQuest.save();
        Logger.warn('Existing Mission updated');
        shouldUpdate = true;
      } else {
        Logger.warn('Mission already reached max occurrence');
        return { success: false }; // exit early, no further updates needed
      }
    } else {
      const newQuest = new this.questHistoryModel({
        userId: owner,
        occurrence: 1,
        points: quest.points,
        maxOccurrence: quest.occurrence,
        questId,
        creatorQuestId,
      });
      await newQuest.save();
      Logger.warn('New Mission created');
      shouldUpdate = true;
    }

    if (!shouldUpdate) return { success: false };

    // Create event transaction
    await this.eventTransactionModel.create({
      eventName: quest.identifier,
      eventId: quest._id,
      userId: owner,
      questId: quest._id,
      creatorQuestId,
      occurrence: 1,
      points: quest.points,
      isQuest: true,
      maxOccurrence: quest.occurrence,
    });

    // Update leaderboard
    await this.leaderboardModel.findOneAndUpdate(
      { userId: owner },
      {
        $inc: {
          questPoints: quest.points,
          questPerformed: 1,
          points: quest.points,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // Optional Notifications
    await this.notificationsService.adminQuest(questId.toString(), owner.toString(), owner.toString());
    if (!isPublishByAdmin) {
      await this.notificationsService.questPerformed(questId.toString(), owner.toString(), creatorQuest.userId.toString());
    }

    return { success: true, quest };
  }


  //Quest History for user
  async history({ owner, query }: { owner: string; query: any }) {
    const { startDate, endDate, limit = 10, page = 1, search } = query;
    const skip = (page - 1) * limit;

    const matchStage: any = {
      userId: new ObjectId(owner),
    };

    // Date range filtering
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start.toDateString() === end.toDateString()) {
        matchStage.createdAt = {
          $gte: start,
          $lt: new Date(start.getTime() + 86400000),
        };
      } else {
        matchStage.createdAt = {
          $gte: start,
          $lte: end,
        };
      }
    }

    // Aggregation pipeline
    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: "quests",
          localField: "questId",
          foreignField: "_id",
          as: "questId",
        },
      },
      { $unwind: { path: "$questId", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "creatorquests", // Use actual collection name if different
          localField: "creatorQuestId",
          foreignField: "_id",
          as: "creatorQuestId",
        },
      },
      { $unwind: { path: "$creatorQuestId", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "creatorQuestId.userId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                email: 1,
                name: 1,
                profile_img: 1,
              }
            }
          ],
          as: "creatorQuestId.userId",
        },
      },
      { $unwind: { path: "$creatorQuestId.userId", preserveNullAndEmptyArrays: true } },
    ];

    // Search filter (after populating userId)
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "creatorQuestId.userId.username": { $regex: new RegExp("^" + search, "i") } },
            { "creatorQuestId.userId.name": { $regex: new RegExp("^" + search, "i") } },
            { "creatorQuestId.userId.email": { $regex: new RegExp("^" + search, "i") } },
          ],
        },
      });
    }

    // Count total
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await this.questHistoryModel.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Apply pagination
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: Number(limit) });

    const data = await this.questHistoryModel.aggregate(pipeline);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }


  //Quest History for quest
  async questHistory({ owner, query }: { owner: string; query: any }) {
    const { creatorQuestId, startDate, endDate, limit = 10, page = 1 } = query;

    const creatorQuest = await this.creatorQuestModel.findOne({ userId: owner, _id: creatorQuestId })
    if (!creatorQuest) {
      return resourceNotFoundError("Mission");
    }
    const conditions: any = { creatorQuestId: creatorQuestId };

    // Handle date range filtering
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start.toDateString() === end.toDateString()) {
        conditions.createdAt = {
          $gte: start,
          $lt: new Date(start.getTime() + 86400000),
        };
      } else {
        conditions.createdAt = {
          $gte: start,
          $lte: end,
        };
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.questHistoryModel
        .find(conditions)
        .populate("questId")
        .populate("creatorQuestId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      this.questHistoryModel.countDocuments(conditions),
    ]);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  //Quest History for quest
  async leaderboard({ owner, query }: { owner: string, query: any }) {
    const { limit = 10, page = 1 } = query;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.leaderboardModel
        .find()
        .populate("userId", 'name email profile_img')
        .sort({ questPoints: -1 })
        .skip(skip)
        .limit(Number(limit)),
      this.leaderboardModel.countDocuments(),
    ]);

    // const responseData = data.map((item: any) => {
    //   const isOwner = item.userId?._id?.toString() === owner.toString();
    //   return {
    //     ...item.toObject(),
    //     isOwner,
    //   };
    // });

    return {
      // data: responseData,
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }


  async questLeaderboard({ owner, query }: { owner: string, query: any }) {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const creatorQuests = await this.creatorQuestModel.find({ userId: owner });
    const questIds = creatorQuests.map((quest) => quest._id);

    const [result] = await this.questHistoryModel.aggregate([
      {
        $match: {
          creatorQuestId: { $in: questIds },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$points' },
          totalOccurrence: { $sum: '$occurrence' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          userId: '$_id',
          _id: 0,
          totalPoints: 1,
          totalOccurrence: 1,
          username: '$user.username',
          email: '$user.email',
          profile_img: '$user.profile_img',
        },
      },
      {
        $sort: { totalPoints: -1 },
      },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: Number(limit) },
          ],
          totalCount: [
            { $count: 'count' },
          ],
        },
      },
    ]);

    const data = result.data;
    const total = result.totalCount[0]?.count || 0;

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

}
