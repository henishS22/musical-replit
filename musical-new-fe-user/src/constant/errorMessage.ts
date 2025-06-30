// Generic error message
export const REQUIRED = "This field is required."

// Email error message
export const INVALID_EMAIL = "Invalid email address."
export const EMAIL_REQUIRED = "Email is required."

// Passowrd error message
export const PASSSWORD_REQUIRED = "Password is required."
export const PASSSWORD_MIN_LENGTH =
	"Password must be at least 8 characters long."
export const PASSSWORD_INVALID =
	"Password must include uppercase, lowercase, number, and special character."

// Confirm Passowrd error message
export const CONFIRM_PASSSWORD_REQUIRED = "Confirm password is required."
export const CONFIRM_PASSSWORD_MATCH = "Passwords don't match."

// Name error message
export const NAME_REQUIRED = "Name is required"
export const NAME_MIN_LENGTH = "Name must be at least 2 characters"
export const USERNAME_REQUIRED = "Username is required"
export const USERNAME_MIN_LENGTH = "Username must be at least 2 characters"

// Create project messages
export const PRODUCT_TITLE_REQUIRED = "Product title is required"
export const PRODUCT_TITLE_TOO_LONG =
	"Product title cannot exceed 100 characters"
export const PRODUCT_TITLE_INVALID_CHARACTERS =
	"Product title cannot contain special characters"
export const AUDIO_FILE_REQUIRED = "Track file is required"
export const TITLE_INVALID_CHARACTERS =
	"Title cannot contain special characters"
export const ARTWORK_REQUIRED = "Artwork is required"
export const PROJECT_TYPE_REQUIRED = "Project type is required"
export const COLLABORATOR_REQUIRED = "At least one collaborator is required"
export const SPLIT_TOTAL_INVALID = "The sum of all splits must equal 100%"

// Colaborator error message
export const ROLE_REQUIRED =
	"Each collaborator must have at least one role assigned"
export const SPLIT_PERCENTAGE_REQUIRED =
	"Please add split percentage for all users"

//upload work message
export const INSTRUMENT_REQUIRED = "Instruments are required"
export const GENERS_REQUIRED = "Geners are required"
export const TAGS_REQUIRED = "Tags are required"
export const MAX_TAG = "Max tags reached"
export const TITLE_REQUIRED = " Title is required"
export const TITLE_TOO_LONG = "Title cannot exceed 100 characters"

//Upload Image
export const IMAGE_SIZE_ERROR = "File size must be less than 5MB"
export const IMAGE_TYPE_ERROR =
	"Invalid file type. Please upload a JPEG or PNG file."

//API Error message
export const GENRE_RESPONSE_ERROR =
	"Failed to fetch genre list: Response is null"
export const INSTRUMENT_RESPONSE_ERROR =
	"Failed to fetch instrument list: Response is null"
export const TAGS_RESPONSE_ERROR = "Failed to fetch tags list: Response is null"

//Upload File Error message
export const FILE_UPLOAD_ERROR = "Failed to upload file"
export const FILE_TYPE_ERROR = "Invalid file type. Please select an audio file."
export const FILE_FETCH_ERROR = "Failed to fetch file from drive"

//Create Opportunity Error message
export const PROJECT_REQUIRED = "Please select a project"
export const LANGUAGES_REQUIRED = "Please select at least one language"
export const SKILLS_OR_STYLES_REQUIRED =
	"Please select at least one skill or style"
export const DURATION_REQUIRED = "Please select a duration"
export const END_DATE_GREATER_THAN_START_DATE =
	"End date must be greater than start date"
export const BRIEF_REQUIRED = "Brief must be at least 10 characters"
export const TRACK_REQUIRED = "Please select at least one track"

//Invite Error message
export const INVALID_MOBILE = "Invalid mobile number."
export const MOBILE_REQUIRED = "Mobile number is required."

//Creative Agent Error message
export const FAILED_TO_GENERATE_IMAGE = "Failed to generate image"
export const FAILED_TO_GENERATE_VIDEO = "Failed to generate video"
export const FAILED_TO_GENERATE_AUDIO = "Failed to generate audio"

// Social Media URL error messages
export const INVALID_SPOTIFY_URL = "Must be a valid Spotify URL"
export const INVALID_APPLE_MUSIC_URL = "Must be a valid Apple Music URL"
export const INVALID_YOUTUBE_URL = "Must be a valid YouTube URL"
export const INVALID_INSTAGRAM_URL = "Must be a valid Instagram URL"
export const INVALID_TIKTOK_URL = "Must be a valid TikTok URL"
export const INVALID_X_URL = "Must be a valid X URL"

// Post to social media error message
export const TRACK_NAME_REQUIRED = "Track name is required"
export const POST_TEXT_REQUIRED = "Post text is required"
export const POST_TEXT_MAX_LENGTH = "Post text cannot exceed 300 characters"
export const TRACK_FILE_REQUIRED = "Track file is required"

export const LIVESTREAM_TYPE_REQUIRED = "Livestream type is required"
export const TOKEN_REQUIRED = "Token is  required"

// Schedule Post Error message
export const SCHEDULE_DATE_REQUIRED = "Schedule date is required"
export const SCHEDULE_TIME_REQUIRED = "Schedule time is required"
