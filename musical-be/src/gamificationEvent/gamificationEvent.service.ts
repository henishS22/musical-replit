import { Injectable, Logger } from '@nestjs/common';
import { GamificationEvent, GamificationEventDocument } from '../schemas/schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GamificationEventService {
    constructor(
        @InjectModel(GamificationEvent.name) private readonly gamificationEventModel: Model<GamificationEventDocument>,
    ) { }

}
