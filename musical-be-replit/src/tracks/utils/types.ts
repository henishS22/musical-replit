/**
 *  @file Utils file for types definition for library
 *  @author Rafael Marques Siqueira
 *  @exports AudioFileType
 *  @exports TransportAudioType
 *  @exports ImageFileType
 *  @exports TransportImageType
 */

import * as mongoose from 'mongoose';

//Defines file type for file upload
export type AudioFileType = {
  mimetype: // wav
  | 'audio/wav'
    | 'audio/wave'
    | 'audio/x-wav'
    // mp3
    | 'audio/mpeg'
    | 'audio/mpeg3'
    | 'audio/x-mpeg-3'
    // m4a
    | 'audio/mp4'
    | 'audio/x-m4a'
    | 'audio/m4a'
    // mov
    | 'video/mov'
    | 'video/quicktime';
  buffer: Buffer;
  size: number;
};

//Defines the audio type to be used to transfer data between services
export type TransportAudioType = {
  mimetype: // wav
  | 'audio/wav'
    | 'audio/wave'
    | 'audio/x-wav'
    // mp3
    | 'audio/mpeg'
    | 'audio/mpeg3'
    | 'audio/x-mpeg-3'
    // m4a
    | 'audio/mp4'
    | 'audio/m4a'
    | 'audio/x-m4a'
    | 'application/zip' // For Garageband
    | 'application/octet-stream' // For ProTools
    // mov
    | 'video/mov'
    | 'video/quicktime';
  fileCacheKey: string;
  size: number;
};

//Defines file type for file upload
export interface ImageFileType {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export type InitialImageFileType = {
  mimetype: 'image/bmp' | 'image/jpeg' | 'image/png';
  buffer: Buffer;
  size: number;
};

//Defines the image type to be used to transfer data between services
export type TransportImageType = {
  mimetype: string;
  fileCacheKey: string;
  size: number;
};

export type ForeignKeyField<T> = string | mongoose.Schema.Types.ObjectId | T;

export enum ExceptionsEnum {
  NotFound = 'NotFound',
  BadRequest = 'BadRequest',
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
  InternalServerError = 'InternalServerError',
  UnprocessableEntity = 'UnprocessableEntity',
  Conflict = 'Conflict',
}

export interface IMockPayload {
  value: string | object;
}
