import { Injectable, Logger } from '@nestjs/common';
import {
    GamificationEvent,
    GamificationEventDocument,
    UserActivity,
    UserActivityDocument,
} from '../schemas/schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
    EventTransaction,
    EventTransactionDocument,
} from '../schemas/schemas/eventTransaction';
import { NotifiesService } from '../notifies/notifies.service';
import { Leaderboard, LeaderboardDocument } from '../schemas/schemas/leaderboard';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { resourceNotFoundError } from '../users/utils/errors';
import axiosRetry from 'axios-retry';
import { chromium, Page, BrowserContext } from 'playwright';
import got from 'got';
import { ScrapingBeeClient } from 'scrapingbee';
const FormData = require('form-data');

axiosRetry(axios, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
    }
});

@Injectable()
export class UserActivityService {
    constructor(
        @InjectModel(Leaderboard.name) private readonly leaderboardModel: Model<LeaderboardDocument>,
        @InjectModel(UserActivity.name)
        private readonly userActivityModel: Model<UserActivityDocument>,
        @InjectModel(EventTransaction.name)
        private readonly eventTransactionModel: Model<EventTransactionDocument>,
        @InjectModel(GamificationEvent.name)
        private readonly gamificationEventModel: Model<GamificationEventDocument>,
        private readonly notificationsService: NotifiesService,
    ) { }

    async activity(userId: string | ObjectId, eventName: string) {

        const event = await this.gamificationEventModel.findOne({
            identifier: eventName,
            isActive: true,
        });

        if (!event) {
            Logger.warn(`No active event found for identifier: ${eventName}`);
            return;
        }

        const userActivity = await this.userActivityModel.findOne({
            userId: userId,
            eventName: eventName,
        });

        //create userActivity
        if (userActivity) {
            if (userActivity.occurrence < event.occurrence) {
                userActivity.occurrence += 1;
                userActivity.points += event.points;
                await userActivity.save();
                Logger.warn('User activity updated');

                //event transaction added
                const newTransaction = new this.eventTransactionModel({
                    eventName: event.identifier,
                    eventId: event._id,
                    userId,
                    occurrence: 1,
                    points: event.points,
                    maxOccurrence: event.occurrence,
                });
                await newTransaction.save();

                // Update or create leaderboard data
                await this.leaderboardModel.findOneAndUpdate(
                    { userId: userId },
                    {
                        $inc: {
                            eventPoints: event.points,
                            eventPerformed: 1,
                            points: event.points,
                        },
                    },
                    {
                        new: true,
                        upsert: true,
                        setDefaultsOnInsert: true,
                    }
                );

                //notification send for gamification points
                await this.notificationsService.eventTokens(
                    event._id.toString(),
                    userId.toString(),
                    userId.toString(),
                );
            } else {
                Logger.warn('User already reached max occurrence');
            }
        } else {
            const newActivity = new this.userActivityModel({
                eventName: event.identifier,
                eventId: event._id,
                userId,
                occurrence: 1,
                points: event.points,
                maxOccurrence: event.occurrence,
            });

            await newActivity.save();

            //event transaction added
            const newTransaction = new this.eventTransactionModel({
                eventName: event.identifier,
                eventId: event._id,
                userId,
                occurrence: 1,
                points: event.points,
                maxOccurrence: event.occurrence,
            });
            await newTransaction.save();

            // Update or create leaderboard data
            await this.leaderboardModel.findOneAndUpdate(
                { userId: userId },
                {
                    $inc: {
                        eventPoints: event.points,
                        eventPerformed: 1,
                        points: event.points,
                    },
                },
                {
                    new: true,
                    upsert: true,
                    setDefaultsOnInsert: true,
                }
            );

            //notification send for gamification points
            await this.notificationsService.eventTokens(
                event._id.toString(),
                userId.toString(),
                userId.toString(),
            );

            Logger.warn('User activity created');
        }
    }

    async getEventActivity({
        userId,
        filter = {},
        search,
    }: {
        userId: string;
        filter?:
        | { startDate: string; endDate: string; limit: string; page: string }
        | {};
        search?: string;
    }): Promise<any> {
        const conditions: any = {
            userId: new ObjectId(userId),
        };

        // Date filter
        if (filter['startDate'] && filter['endDate']) {
            const start = new Date(filter['startDate']);
            const end = new Date(filter['endDate']);
            if (start.toDateString() === end.toDateString()) {
                conditions.createdAt = {
                    $gte: start,
                    $lt: new Date(start.getTime() + 86400000),
                };
            } else {
                conditions.createdAt = {
                    $gte: new Date(filter['startDate']),
                    $lte: new Date(filter['endDate']),
                };
            }
        }

        const limit = filter['limit'] ? Number(filter['limit']) : 10;
        const page = filter['page'] ? Number(filter['page']) : 1;
        const skip = (page - 1) * limit;

        const pipeline: any[] = [
            { $match: conditions },
            {
                $lookup: {
                    from: 'gamificationevents',
                    localField: 'eventId',
                    foreignField: '_id',
                    as: 'eventDetails',
                },
            },
            { $unwind: '$eventDetails' },
        ];

        if (search) {
            pipeline.push({
                $match: {
                    'eventDetails.name': {
                        $regex: new RegExp('^' + search, 'i'),
                    },
                },
            });
        }

        const countPipeline = [...pipeline, { $count: 'total' }];
        const dataPipeline = [
            ...pipeline,
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ];

        const [countResult, events] = await Promise.all([
            this.userActivityModel.aggregate(countPipeline),
            this.userActivityModel.aggregate(dataPipeline),
        ]);

        const total = countResult.length > 0 ? countResult[0].total : 0;

        return {
            pagination: {
                total,
                limit,
                page,
                pages: Math.ceil(total / limit),
            },
            events,
        };
    }

    async countUserActiveDocuments(userId: string): Promise<number> {
        return await this.userActivityModel.countDocuments({
            user: new ObjectId(userId),
        });
    }

}
