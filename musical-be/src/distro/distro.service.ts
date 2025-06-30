import { Injectable } from '@nestjs/common';
import { DistroDto, DistroStatus } from './dto/distro.dto';
import { Distro, DistroDocument } from '../schemas/schemas';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { resourceDuplicateError, resourceForbiddenError, resourceNotFoundError } from './utils/errors';
import { ObjectId } from 'mongodb';


@Injectable()
export class DistroService {

  constructor(
    @InjectModel(Distro.name) private readonly distroModel: Model<DistroDocument>,
  ) { }

  //create distro
  async create(body: DistroDto, owner: string) {
    const existingDistro = await this.distroModel.findOne({ userId: owner.toString() })
    if (existingDistro) {
      return resourceDuplicateError('Distro')
    }

    const createdDistro = new this.distroModel({
      ...body,
      userId: owner
    });

    const newDistro = await createdDistro.save();
    return newDistro;
  }

  //get distro
  async get(owner: string) {
    const distro = await this.distroModel.findOne({ userId: owner })
    if (!distro) {
      return resourceNotFoundError('Distro')
    }

    return distro;
  }


  //update distro
  async update(body: DistroDto, owner: string) {
    const distro = await this.distroModel.findOne({ userId: owner })
    if (!distro) {
      return resourceNotFoundError('Distro')
    }
    if (distro.status === DistroStatus.APPROVED) {
      return resourceForbiddenError('Distro')
    }

    await this.distroModel.updateOne(
      { userId: new ObjectId(owner) },
      { ...body, status: DistroStatus.PENDING },
    );

    return await this.distroModel.findOne({ userId: owner });
  }
}
