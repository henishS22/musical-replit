import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import ServiceException from '../exceptions/ServiceException';
import { TrackProjectDocument, Track } from '@/src/schemas/schemas';
import { ExceptionsEnum } from '../utils/enums';
import { FileStorageService } from '@/src/file-storage/fileStorage.service';
@Injectable()
export class ProjectTracksService {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<Track>,
    @InjectModel('tracks_projects')
    private trackProjectModel: Model<TrackProjectDocument>,
    private fileStorageService: FileStorageService,
  ) { }

  /**
   * Get all tracks according to the filters
   *
   * @param filters Mongo queries to select documents
   * @returns
   */
  async getAllTracks({
    filters,
    options = { withAudioUrl: true },
    query = {},
  }: {
    filters: any;
    options?: { withAudioUrl: boolean };
    query?:
    | { startDate: string; endDate: string; limit: string; page: string }
    | {};
  }) {
    let skip = ((Number(query['page']) - 1) * Number(query['limit'])) | 0;

    // Get total count
    const totalCount = await this.trackModel.countDocuments(filters);

    // Get paginated data
    // const tracks = await this.trackModel.aggregate([
    //   {
    //     $match: filters,
    //   },
    //   {
    //     $lookup: {
    //       from: 'users',
    //       localField: 'user_id',
    //       foreignField: '_id',
    //       pipeline: [{ $project: { _id: 1, name: 1, profile_img: 1 } }],
    //       as: 'user',
    //     },
    //   },
    //   { $unwind: '$user' },
    //   {
    //     $lookup: {
    //       from: 'trackcomments',
    //       localField: '_id',
    //       foreignField: 'track_id',
    //       as: 'trackComments',
    //     },
    //   },
    //   // Unwind each comment in trackComments to enrich with user data
    //   {
    //     $unwind: {
    //       path: "$trackComments",
    //       preserveNullAndEmptyArrays: true,
    //     }
    //   },
    //   {
    //     $unwind: {
    //       path: "$trackComments.comments",
    //       preserveNullAndEmptyArrays: true,
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "trackComments.comments.user_id",
    //       foreignField: "_id",
    //       pipeline: [{ $project: { _id: 1, name: 1, profile_img: 1 } }],
    //       as: "trackComments.comments.user",
    //     }
    //   },
    //   {
    //     $unwind: {
    //       path: "$trackComments.comments.user",
    //       preserveNullAndEmptyArrays: true,
    //     }
    //   },
    //   // Rebuild the comments array with user info
    //   {
    //     $group: {
    //       _id: {
    //         trackId: "$_id",
    //         commentGroupId: "$trackComments._id",
    //       },
    //       doc: { $first: "$$ROOT" },
    //       comments: {
    //         $push: {
    //           $cond: [
    //             {
    //               $and: [
    //                 { $ne: ["$trackComments.comments", null] },
    //                 { $ne: ["$trackComments.comments._id", null] },
    //               ],
    //             },
    //             {
    //               _id: "$trackComments.comments._id",
    //               comment: "$trackComments.comments.comment",
    //               commentedAt: "$trackComments.comments.commentedAt",
    //               user_id: "$trackComments.comments.user_id",
    //               user: "$trackComments.comments.user",
    //             },
    //             "$$REMOVE"
    //           ],
    //         },
    //       },
    //     }
    //   },
    //   {
    //     $group: {
    //       _id: "$_id.trackId",
    //       doc: { $first: "$doc" },
    //       trackComments: {
    //         $push: {
    //           _id: "$_id.commentGroupId",
    //           comments: "$comments",
    //           createdAt: "$doc.trackComments.createdAt",
    //           updatedAt: "$doc.trackComments.updatedAt",
    //           isResolved: "$doc.trackComments.isResolved",
    //           duration: "$doc.trackComments.duration",
    //           track_id: "$doc.trackComments.track_id",
    //           user_id: "$doc.trackComments.user_id",
    //           __v: "$doc.trackComments.__v",
    //         },
    //       },
    //     }
    //   },
    //   {
    //     $addFields: {
    //       "doc.trackComments": "$trackComments",
    //     },
    //   },
    //   {
    //     $addFields: {
    //       "doc.trackComments": {
    //         $map: {
    //           input: "$doc.trackComments",
    //           as: "tc",
    //           in: {
    //             $mergeObjects: [
    //               "$$tc",
    //               {
    //                 comments: {
    //                   $filter: {
    //                     input: "$$tc.comments",
    //                     as: "comment",
    //                     cond: { $ne: ["$$comment", {}] },
    //                   },
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $replaceRoot: { newRoot: "$doc" },
    //   },
    //   {
    //     $lookup: {
    //       from: 'skill_types',
    //       localField: 'instrument',
    //       foreignField: '_id',
    //       pipeline: [
    //         {
    //           $project: {
    //             _id: 1,
    //             instrument: "$instrument.en",
    //           },
    //         },
    //         {
    //           $addFields: {
    //             icon: {
    //               $concat: ["/instrument/", "$instrument", ".png"],
    //             },
    //           },
    //         },
    //       ],
    //       as: 'instrument',
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'lyrics',
    //       localField: 'lyrics',
    //       foreignField: '_id',
    //       as: 'lyrics',
    //     },
    //   },
    //   { $skip: skip },
    //   { $limit: Number(query['limit']) || 10 },
    // ]);

    const tracks = await this.trackModel.aggregate([
      {
        $match: filters,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          pipeline: [{ $project: { _id: 1, name: 1, profile_img: 1 } }],
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'trackcomments',
          localField: '_id',
          foreignField: 'track_id',
          as: 'trackComments',
        },
      },
      // Unwind each comment in trackComments to enrich with user data
      {
        $unwind: {
          path: "$trackComments",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$trackComments.comments",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "trackComments.comments.user_id",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 1, name: 1, profile_img: 1 } }],
          as: "trackComments.comments.user"
        }
      },
      {
        $unwind: {
          path: "$trackComments.comments.user",
          preserveNullAndEmptyArrays: true
        }
      },
      // Rebuild the comments array with user info
      {
        $group: {
          _id: {
            trackId: "$_id",
            commentGroupId: "$trackComments._id"
          },
          doc: { $first: "$$ROOT" },
          comments: {
            $push: {
              _id: "$trackComments.comments._id",
              comment: "$trackComments.comments.comment",
              commentedAt: "$trackComments.comments.commentedAt",
              user_id: "$trackComments.comments.user_id",
              user: "$trackComments.comments.user"
            }
          }
        }
      },
      {
        $group: {
          _id: "$_id.trackId",
          doc: { $first: "$doc" },
          trackComments: {
            $push: {
              _id: "$_id.commentGroupId",
              comments: "$comments",
              createdAt: "$doc.trackComments.createdAt",
              updatedAt: "$doc.trackComments.updatedAt",
              isResolved: "$doc.trackComments.isResolved",
              duration: "$doc.trackComments.duration",
              track_id: "$doc.trackComments.track_id",
              user_id: "$doc.trackComments.user_id",
              __v: "$doc.trackComments.__v"
            }
          }
        }
      },
      {
        $addFields: {
          "doc.trackComments": "$trackComments"
        }
      },
      {
        $replaceRoot: { newRoot: "$doc" }
      },
      {
        $lookup: {
          from: 'skill_types',
          localField: 'instrument',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                _id: 1,
                instrument: "$instrument.en"
              }
            },
            {
              $addFields: {
                icon: {
                  $concat: ["/instrument/", "$instrument", ".png"]
                }
              }
            }
          ],
          as: 'instrument',
        },
      },
      {
        $lookup: {
          from: 'lyrics',
          localField: 'lyrics',
          foreignField: '_id',
          as: 'lyrics',
        },
      },
      { $skip: skip },
      { $limit: Number(query['limit']) || 10 },
    ]);


    if (options.withAudioUrl) {
      //Get all tracks url files from the client storage and create list only with valid tracks
      const newTracks = [];
      let trackUrls: any;

      //Build track names for url search
      const trackNames = tracks.map(
        (track) => `${track._id}.${track.extension}`,
      );

      //Get all URLs
      try {
        trackUrls = await this.fileStorageService.getAudioUrl({
          name: trackNames,
        });
      } catch (error) {
        throw new ServiceException(
          'Error searching from tracks urls (getAllTracks projectTracks).' +
          JSON.stringify(error),
          ExceptionsEnum.InternalServerError,
        );
      }

      //Add the valid tracks to the result array
      for (let i = 0; i < tracks.length; i++) {
        const myTrack = tracks[i];
        const myUrl = trackUrls[i];

        if (myTrack && myUrl) {
          myTrack.url = myUrl;
          newTracks.push(myTrack);
        }
      }
    }

    let pagination = {
      totalCount,
      page: Number(query['page']) || 1,
      limit: Number(query['limit']) || 10,
      pages: Math.ceil(totalCount / (Number(query['limit']) || 10)),
    };

    return { data: tracks, pagination };
  }

  async getProjectTracks({
    projectId,
    options = {},
    query = {},
  }: {
    projectId: string;
    options?: {};
    query?: {};
  }) {
    const tracksProjects = await this.trackProjectModel.find({
      projectId: new ObjectId(projectId) as unknown,
    });

    let filters = {
      _id: {
        $in: tracksProjects.map((trackProject) => trackProject.trackId),
      },
    };

    //let total = await this.countTrackDocuments(filters);

    if (query['startDate']) {
      filters['createdAt'] = { $gte: new Date(query['startDate']) };
    }
    if (query['endDate']) {
      filters['createdAt'] = {
        ...filters['createdAt'],
        $lte: new Date(query['endDate']),
      };
    }

    let allTracks = await this.getAllTracks({
      filters,
      options: { withAudioUrl: true },
      query,
    });

    let MappedTracks = allTracks.data.map((track) => {
      const linkedTrack = tracksProjects.find(
        (trackProject) =>
          trackProject.trackId.toString() === track._id.toString(),
      );
      return {
        ...track,
        linkedAt: linkedTrack?.createdAt || track.createdAt,
      };
    });

    // Sort by track.createdAt in descending order (latest first)
    MappedTracks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { tracks: MappedTracks, pagination: allTracks.pagination };
  }
}
