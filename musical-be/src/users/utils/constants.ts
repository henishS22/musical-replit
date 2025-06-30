export const DEFAULT_LANGUAGE = 'en';

//Defines the image file redis cache ttl in seconds
export const DEFAULT_IMAGE_FILE_REDIS_CACHE_TTL = 120;


/**
 *  @file Utils file for consts definition for Library module
 *  @author Rafael Marques Siqueira
 *  @exports FileType
 */

//Defines the default max size for audio files in bytes
export const DEFAULT_AUDIO_FILE_SIZE_LIMIT = 500000000; //20971520

//Defines the default max size for image files in bytes
export const DEFAULT_IMAGE_FILE_SIZE_LIMIT = 200000000; //10485760

//Defines the allowed mimetypes for images uploads
export const ALLOWED_IMAGE_MIMETYPES = ['image/bmp', 'image/jpeg', 'image/png'];
export const ALLOWED_AUDIO_MIMETYPES = [
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mpeg',
  'audio/mpeg3',
  'audio/x-mpeg-3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
];

export const ALLOWED_VIDEO_MIMETYPES = [
  'video/mp4',
  'video/x-msvideo',
  'video/mov',
  'video/quicktime'
];

export const ALLOWED_PROJECT_MIMETYPES = [
  'application/zip',
  'application/octet-stream',
];

export const DEFAULT_AUDIO_FILE_REDIS_CACHE_TTL = 300;
