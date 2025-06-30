/**
 *  @file Utils file for consts definition for NFTs module
 *  @author Rafael Marques Siqueira
 *  @exports FileType
 */

//Defines the default max size for image files in bytes
export const DEFAULT_IMAGE_FILE_SIZE_LIMIT = 104857600; //10485760

//Defines the allowed mimetypes for images uploads
export const ALLOWED_IMAGE_MIMETYPES = ['image/bmp', 'image/jpeg', 'image/png'];
export const DEFAULT_IMAGE_FILE_REDIS_CACHE_TTL = 300;
