import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateLyricsDto, LyricsDto } from '../dto/lyrics.dto';
import { ObjectId } from 'mongodb';
import {
  Lyrics,
  LyricsDocument,
  Project,
  ProjectDocument,
} from '@/src/schemas/schemas';
import ServiceException from '../exceptions/ServiceException';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { ExceptionsEnum, TypeCollaboratorEnum } from '../utils/enums';
import { forbiddenError, resourceNotFoundError } from '../utils/errors';
import { TrackLyricsService } from '@/src/tracks/services/trackLyrics.service';

type LyricsResult = Document<unknown, any, Lyrics> &
  Omit<
    Lyrics &
    Required<{
      _id: string;
    }>,
    never
  > & {
    status?: 'error';
    message?: string;
  };

@Injectable()
export class LyricsService {
  constructor(
    @InjectModel(Lyrics.name)
    private readonly lyricsModel: Model<LyricsDocument>,
    @Inject(forwardRef(() => TrackLyricsService))
    private readonly tracksLyricsService: TrackLyricsService,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) { }

  async createLyrics({
    lyricsDto,
    userId,
    trackId,
    projectId
  }: {
    lyricsDto: CreateLyricsDto;
    userId: ObjectId | string;
    trackId?: ObjectId | string;
    projectId: ObjectId | string;
  }): Promise<LyricsResult> {
    const result: Document<unknown, any, Lyrics> &
      Omit<
        Lyrics &
        Required<{
          _id: string;
        }>,
        never
      > & {
        status?: 'error';
        message?: string;
      } = await this.tracksLyricsService.create({
        userId,
        trackId,
        lyricsDto,
      });
    const error = result.status === 'error';
    const hasCreated = !!result._id;

    if (!error && hasCreated) {
      return result;
    }

    throw new ServiceException(
      error ? result.message : 'Error creating lyrics',
      ExceptionsEnum.UnprocessableEntity,
    );
  }

  async findLyricsById(id: string | ObjectId) {
    return this.lyricsModel.findById(id).exec();
  }

  async cloneLyricsToProject(
    id: string | ObjectId,
    projectId: string | ObjectId,
  ) {
    const lyrics = await this.lyricsModel.findById(id).exec();

    if (!lyrics) {
      throw new ServiceException('Lyrics not found', ExceptionsEnum.NotFound);
    }

    const newLyrics = await this.createLyrics({
      lyricsDto: {
        title: lyrics.title,
        lines: lyrics.lines,
      },
      userId: lyrics.user_id,
      projectId,
    });

    return newLyrics;
  }

  /**
   * Add lyrics to a project.
   *
   * @param {string | ObjectId} projectId
   * @param {(string | LyricsDto)[]} lyricsObj
   * @param {string | ObjectId} userId
   * @returns {Promise<Project & { _id: ObjectId }>}
   */
  async addLyricsToProject({
    projectId,
    lyricsObj,
    userId,
  }: {
    projectId: string;
    lyricsObj: (string | LyricsDto)[];
    userId: string | ObjectId;
  }) {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      resourceNotFoundError('Project');
    }

    const isSingle = project.type === TypeCollaboratorEnum.Single;

    if (isSingle && lyricsObj.length > 1) {
      throw new ServiceException(
        'You can only add one lyrics to a single project',
        ExceptionsEnum.UnprocessableEntity,
      );
    }

    const toBeAdded = lyricsObj.filter(
      (lyrics): lyrics is string => typeof lyrics === 'string',
    );

    await this.userOwnLyrics(toBeAdded, userId);

    const allLyricsPromises = lyricsObj.map(
      async (lyricsId: string | LyricsDto) => {
        const isFromId = typeof lyricsId === 'string';
        const lyrics = isFromId
          ? await this.cloneLyricsToProject(lyricsId, projectId)
          : await this.createLyrics({
            lyricsDto: { ...lyricsId, title: lyricsId.title || project.name },
            userId,
            projectId,
          });
        return lyrics;
      },
    );
    const allLyrics = await Promise.all(allLyricsPromises);
    const lyricsIds = allLyrics.map(({ _id }) => _id);

    const updatedProject = await this.projectModel.findByIdAndUpdate(
      projectId,
      { lyrics: lyricsIds },
      { new: true },
    );

    return updatedProject;
  }

  /**
   * Detach lyrics from all projects containing it.
   *
   * @param {string | ObjectId} lyricsId
   */
  async detachLyricsFromProjects(lyricsId: string | ObjectId): Promise<any> {
    const projectsWithLyric = await this.projectModel
      .find({
        lyrics: lyricsId,
      })
      .exec();

    const promises = projectsWithLyric.map(async (project: any) => {
      const lyrics = project.lyrics.filter(
        (lyric: any) => lyric?.toString() !== lyricsId,
      );

      return await this.projectModel.updateOne(
        { _id: project._id },
        {
          $set: { lyrics },
        },
      );
    });

    return await Promise.all(promises);
  }

  async getOneUserLyrics(
    userId: ObjectId | string,
    id: string | ObjectId,
  ): Promise<boolean> {
    return !!this.lyricsModel.findOne({ _id: id, user_id: userId }).exec();
  }

  private async userOwnLyrics(
    lyricsIds: string[],
    userId: string | ObjectId,
  ): Promise<void> {
    for (const lyricsId of lyricsIds) {
      const userOwnLyrics = await this.getOneUserLyrics(lyricsId, userId);

      if (!userOwnLyrics) {
        forbiddenError('Lyrics');
      }
    }
  }
}
