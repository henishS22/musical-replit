import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { User, UserDocument } from '@/src/schemas/schemas';
import { ArtistSearch } from '../utils/types';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }

  /**
   * Search for artists.
   *
   * @param {ArtistSearch} props
   * @returns {Promise<{ data: UserDocument[], pagination: { total: number, page: number, limit: number, pages: number } }>}
   */
  async findArtists({
    query = '',
    skills,
    styles,
    page,
    limit,
  }: ArtistSearch): Promise<{
    data: UserDocument[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const queryObj: FilterQuery<UserDocument> = {
      $and: [
        {
          name: {
            $regex: query.trim(),
            $options: 'i',
          },
        },
      ],
    };

    if (skills?.length) {
      const skillsObjectIds = skills.map((skill) => new ObjectId(skill));
      queryObj.$and.push({
        'skills.type': { $in: skillsObjectIds },
      });
    }

    if (styles?.length) {
      const stylesObjectIds = styles.map((style) => new ObjectId(style));
      queryObj.$and.push({
        styles: { $in: stylesObjectIds },
      });
    }

    const total = await this.userModel.countDocuments(queryObj);
    const pages = Math.ceil(total / limit);

    const data = await this.userModel
      .find(queryObj)
      .select({
        name: 1,
        profile_img: 1,
        skills: 1,
        styles: 1,
      })
      .sort({ createdAt: -1, name: 1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('skills.type')
      .populate('skills.level')
      .populate('styles')
      .populate('tracks')
      .exec();

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    };
  }


  async sortArtists({
    query = '',
    skills,
    styles,
    page = 1,
    limit = 36,
  }: ArtistSearch): Promise<UserDocument[]> {
    const optional = (value: boolean, object: Record<any, any>) =>
      value ? object : {};
    const users = await this.userModel.aggregate([
      {
        $match: {
          ...optional(styles.length > 0, {
            styles: {
              in: styles.map((style) => new ObjectId(style)),
            },
          }),
          ...optional(skills.length > 0, {
            'skills.type': {
              in: skills.map((skill) => new ObjectId(skill)),
            },
            ...optional(query.length > 0, {
              name: { $regex: new RegExp('^' + query), $options: 'i' },
            }),
          }),
        },
      },
      {
        $project: {
          name: 1,
          profile_img: 1,
          skills: 1,
          styles: 1,
        },
      },
      {
        $lookup: {
          from: 'styles',
          localField: 'styles',
          foreignField: '_id',
          as: 'styles',
        },
      },
      {
        $lookup: {
          from: 'skill_types',
          localField: 'skills.type',
          foreignField: '_id',
          as: 'skills.types',
        },
      },
      {
        $lookup: {
          from: 'skill_levels',
          localField: 'skills.level',
          foreignField: '_id',
          as: 'skills.level',
        },
      },
      {
        $lookup: {
          from: 'tracks',
          localField: '_id',
          foreignField: 'user_id',
          as: 'tracks',
        },
      },
      { $addFields: { tracks_size: { $size: '$tracks' } } },
      { $sort: { tracks: -1 } },
      { $limit: limit },
      { $skip: (page - 1) * limit },
    ]);

    return users;
  }
}
