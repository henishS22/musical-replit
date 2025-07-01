import { Injectable, NotFoundException } from '@nestjs/common';
import { MetadataDto } from './dto/metadata.dto';
import { Distro, DistroDocument, Metadata, MetadataDocument, Track, TrackDocument } from '../schemas/schemas';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { resourceDistroError, resourceDuplicateError, resourceNotFoundError, } from './utils/errors';
import { DistroStatus } from '../distro/dto/distro.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class MetadataService {

  constructor(
    @InjectModel(Metadata.name) private readonly metadataModel: Model<MetadataDocument>,
    @InjectModel(Distro.name) private readonly distroModel: Model<DistroDocument>,
    @InjectModel(Track.name) private readonly trackModel: Model<TrackDocument>,

  ) { }

  //create metadata
  async create(body: MetadataDto, owner: string) {

    const existing = await this.metadataModel.findOne({ "track.trackId": body?.track?.trackId.toString(), userId: owner }).populate("track.trackId");
    if (existing) {
      return resourceDuplicateError('Metadata')
    }

    const createdMetadata = new this.metadataModel({
      ...body,
      userId: owner
    });

    const metadata = await createdMetadata.save();

    const track = await this.trackModel.findOne({ _id: body?.track?.trackId.toString() })
    track.metadata_id = metadata._id
    track.save()

    return metadata;
  }

  //get metadata
  async get(trackId: string, owner: string) {
    const metadata = await this.metadataModel.findOne({ "track.trackId": trackId, userId: owner }).populate("track.trackId");
    // if (!metadata) {
    //   return resourceNotFoundError('Metadata')
    // }

    return metadata;
  }

  //update metadata
  async update(trackId: string, owner: string, body: MetadataDto) {

    //check distro status
    const distro = await this.distroModel.findOne({ userId: owner })
    if (distro && distro.status !== DistroStatus.APPROVED) {
      return resourceDistroError('distro')
    }

    const metadata = await this.metadataModel.findOneAndUpdate(
      { "track.trackId": new ObjectId(trackId), userId: new ObjectId(owner) },
      { $set: body },
      { new: true }
    );

    if (!metadata) {
      return resourceNotFoundError('Track metadata')
    }

    return metadata;
  }
}