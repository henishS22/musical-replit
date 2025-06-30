import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Lyrics, Project, Track, TrackProject } from '@/src/schemas/schemas';
import { LyricsDto } from '../dto/lyrics.dto';
import { LyricsService } from '@/src/projects/services/lyrics.service';
import { resourceDuplicateError } from '@/src/distro/utils/errors';
import { resourceDuplicatedError, resourceForbiddenError, resourceNotFoundError } from '../utils/errors';

@Injectable()
export class TrackLyricsService {
  constructor(
    @InjectModel(Lyrics.name) private readonly lyricsModel: Model<Lyrics>,
    @InjectModel(Track.name) private readonly trackModel: Model<Track>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel('tracks_projects') private trackProjectModel: Model<TrackProject>,
    @Inject(forwardRef(() => LyricsService))
    private readonly projectLyricsService: LyricsService,
  ) { }

  /**
   * Creates a new lyrics document.
   *
   * @param {CreateLyricsDto} lyricsDto
   * @param {string | ObjectId} userId
   * @returns {Promise<Lyrics>}
   */
  async create({
    lyricsDto,
    userId,
    trackId,
    projectId,
  }: {
    lyricsDto: LyricsDto;
    userId: string | ObjectId;
    trackId?: string | ObjectId;
    projectId?: string | ObjectId;
  }): Promise<any> {
    if (projectId) {
      const existingLyrics = await this.lyricsModel.findOne({
        project_id: projectId,
      })

      if (existingLyrics) {
        return resourceDuplicateError('Lyrics')
      }

      const project: any = await this.projectModel.findById(projectId);
      if (!project) {
        return resourceNotFoundError('Project')
      }

      const isOwner = project?.user?.toString() === userId.toString();
      const isCollaborator = project?.collaborators?.some((collab: any) =>
        collab.user.toString() === userId.toString() &&
        (collab.permission === 'UPLOAD_ONLY' || collab.permission === 'UPLOAD_DOWNLOAD')
      );
      if (!isOwner && !isCollaborator) {
        return resourceForbiddenError()
      }

      const newLyrics = await this.lyricsModel.create({
        ...lyricsDto,
        project_id: projectId,
        user_id: userId,
      });

      //lyricsId add to track
      project.lyrics = newLyrics._id;
      await project.save();

      return newLyrics;
    }

    if (trackId) {
      const existingLyrics = await this.lyricsModel.findOne({
        track_id: trackId,
      })

      if (existingLyrics) {
        return resourceDuplicateError('Lyrics')
      }

      const track: any = await this.trackModel.findById(trackId);
      if (!track) {
        return resourceNotFoundError('Track')
      }

      const allow = await this.checkLyricsOwner(trackId, userId);
      if (!allow) {
        return resourceForbiddenError()
      }
      const newLyrics = await this.lyricsModel.create({
        ...lyricsDto,
        track_id: trackId,
        user_id: userId,
      });

      //lyricsId add to track
      track.lyrics = newLyrics._id;
      await track.save();

      return newLyrics;
    }
  }

  /**
   * Updates a lyrics document.
   *
   * @param {string | ObjectId} lyricsId
   * @param {LyricsDto} LyricsDto
   * @returns {Promise<Lyrics>}
   */
  async update({
    lyricsId,
    lyricsDto,
    owner,
  }: {
    lyricsId: string | ObjectId;
    lyricsDto: LyricsDto;
    owner: string | ObjectId;
  }): Promise<Lyrics> {

    const track = await this.lyricsModel.findOne({ _id: lyricsId });
    if (!track.project_id) {
      const allow = await this.checkLyricsOwner(track.track_id, owner);
      if (!allow) {
        return resourceForbiddenError()
      }
    } else {
      const project: any = await this.projectModel.findOne({ lyrics: lyricsId });
      const isOwner = project?.user?.toString() === owner.toString();
      const isCollaborator = project?.collaborators?.some((collab: any) =>
        collab.user.toString() === owner.toString() &&
        (collab.permission === 'UPLOAD_ONLY' || collab.permission === 'UPLOAD_DOWNLOAD')
      );

      if (!isOwner && !isCollaborator) {
        return resourceForbiddenError()
      }
    }

    const updatedLyrics = await this.lyricsModel.findByIdAndUpdate(
      lyricsId,
      lyricsDto,
      { new: true },
    );

    return updatedLyrics;
  }

  /**
   * Deletes a lyrics document.
   *
   * @param {string | ObjectId} lyricsId
   * @returns {Promise<Lyrics>}
   */
  async delete({
    lyricsId,
    userId
  }: {
    lyricsId: string | ObjectId;
    userId: string | ObjectId;
  }): Promise<void> {
    const lyrics = await this.lyricsModel.findOne({ _id: lyricsId });

    if (lyrics.track_id) {
      const track: any = await this.trackModel.findOne({ lyrics: lyricsId });
      const allow = await this.checkLyricsOwner(track._id, userId);
      if (!allow) {
        return resourceForbiddenError()
      }

      //delete lyricsId from track
      if (track) {
        await this.trackModel.updateOne(
          { lyrics: lyricsId },
          { $unset: { lyrics: "" } }
        );
      }
      await this.lyricsModel.findByIdAndDelete(lyricsId);
    } else {
      const project: any = await this.projectModel.findOne({ lyrics: lyricsId });
      const isOwner = project?.user?.toString() === userId.toString();
      const isCollaborator = project?.collaborators?.some((collab: any) =>
        collab.user.toString() === userId.toString() &&
        (collab.permission === 'UPLOAD_ONLY' || collab.permission === 'UPLOAD_DOWNLOAD')
      );
      if (!isOwner && !isCollaborator) {
        return resourceForbiddenError()
      }
      if (project) {
        await this.projectModel.updateOne(
          { lyrics: lyricsId },
          { $unset: { lyrics: "" } }
        );
      }
      await this.lyricsModel.findByIdAndDelete(lyricsId);
    }
  }

  /**
  * Get a lyrics document.
  *
  * @param {string | ObjectId} lyricsId
  * @returns {Promise<Lyrics>}
  */
  async get({ lyricsId, userId, }: { lyricsId: string | ObjectId; userId: string | ObjectId; }): Promise<Lyrics> {
    return await this.lyricsModel.findOne({ _id: lyricsId, user_id: userId })
  }

  /**
   * Returns all lyrics from a user.
   *
   * @param {string | ObjectId} userId
   * @returns {Promise<Lyrics[]>}
   */
  async readFromUser(userId: string | ObjectId) {
    return this.lyricsModel.find({ user_id: userId });
  }

  /**
   * Deletes all lyrics from a user.
   *
   * @param {string | ObjectId} userId
   * @returns {Promise<void>}
   */
  async deleteAllLyricsFromUser(userId: string | ObjectId): Promise<void> {
    await this.lyricsModel.deleteMany({ user_id: userId });
  }

  /**
   * When a project is deleted, all its lyrics are delete.
   *
   * @param {string | ObjectId} projectId
   * @returns {Promise<void>}
   */
  async deleteAllLyricsFromProject(
    projectId: string | ObjectId,
  ): Promise<void> {
    await this.lyricsModel.deleteMany({ project_id: projectId });
  }

  private detachLyricsFromProjects(
    lyricsId: string | ObjectId,
    // userId: string | ObjectId,
  ) {
    this.projectLyricsService.detachLyricsFromProjects(lyricsId);
  }

  async checkLyricsOwner(
    trackId: string | ObjectId,
    owner: string | ObjectId,
  ): Promise<any> {
    const track: any = await this.trackModel.findById(trackId);
    const trackProject = await this.trackProjectModel.find({ trackId: trackId })

    if (trackProject.length) {
      for (const track of trackProject) {
        const project: any = await this.projectModel.findById(track.projectId);
        const isOwner = project?.user?.toString() === owner.toString();
        const isCollaborator = project?.collaborators?.some((collab: any) =>
          collab.user.toString() === owner.toString() &&
          (collab.permission === 'UPLOAD_ONLY' || collab.permission === 'UPLOAD_DOWNLOAD')
        );
        if (!isOwner && !isCollaborator) {
          return false;
        }
      }
      return true
    }

    if (track.user_id.toString() !== owner.toString()) {
      return false
    }
    return true
  }
}
