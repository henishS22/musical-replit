import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { UserSubscription, UserSubscriptionStatus } from '../schemas/schemas/user-subscription.schema';
import { Subscription } from '../schemas/schemas/subscription.schema';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

interface FeatureRequest {
  featureKey: string; // The key of the feature to validate (e.g., 'storage')
  requestedUsage?: number; // Optional: The amount of usage requested for this feature
}

export class SubscriptionException extends HttpException {
  constructor(errorCode: string, message: string, statusCode: HttpStatus) {
    super({ statusCode, errorCode, message }, statusCode);
  }
}

@Injectable()
export class FeatureValidationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(UserSubscription.name)
    private readonly userSubscriptionModel: Model<UserSubscription>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const req = context.switchToHttp().getRequest();
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User ID is missing.');
    }

    let totalFileSizeInBytes = 0;
    if (req.files) {
      // Iterate over each field in req.files
      for (const fieldName in req.files) {
        if (Array.isArray(req.files[fieldName])) {
          // Sum up the sizes of all files in the field
          req.files[fieldName].forEach((file: Express.Multer.File) => {
            totalFileSizeInBytes += file.size;
          });
        }
      }
    }

    //track size added
    if (req?.route?.path === '/tracks' && req?.body?.url && req?.body?.fileSize) {
      totalFileSizeInBytes = Number(req?.body?.fileSize)
    }

    // Convert bytes to GB for storage feature validation
    const totalFileSizeInGB = totalFileSizeInBytes / (1024 * 1024 * 1024);
    // Get the features to validate from the metadata
    const featureRequests: FeatureRequest[] = this.reflector.get<FeatureRequest[]>(
      'features',
      context.getHandler(),
    );

    if (!featureRequests || featureRequests.length === 0) {
      return true; // No features to validate, allow the request
    }

    // Dynamically update requestedUsage for the storage feature
    featureRequests.forEach((feature) => {
      if (feature.featureKey === 'storage') {
        feature.requestedUsage = totalFileSizeInGB; // Convert to GB for storage
      }
    });

    // Fetch all active subscriptions for the user, sorted by startDate (oldest first)
    const userSubscriptions = await this.userSubscriptionModel
      .find({
        userId: new ObjectId(userId),
        status: UserSubscriptionStatus.Active,
      })
      .sort({ startDate: 1 }) // Sort by startDate (oldest first)
      .populate<{ subscriptionId: Subscription }>('subscriptionId');

    if (!userSubscriptions || userSubscriptions.length === 0) {
      // throw new BadRequestException('No active subscription found.');
      throw new SubscriptionException(
        'SUBSCRIPTION_REQUIRED',
        'Subscription required to access this feature. Please subscribe to continue.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    // Validate each feature
    for (const { featureKey, requestedUsage } of featureRequests) {
      let totalLimit = 0;
      let totalUsage = 0;
      let limitExist = false;
      let available = false;
      let description = '';
      let unit = ''; // Default unit

      userSubscriptions.forEach((userSub) => {
        const feature = userSub.subscriptionId.features.find(
          (f) => f.featureKey === featureKey,
        );
        if (feature) {
          // Aggregate total limit and usage if the feature has a limit
          if (feature.limit && feature.limit !== null && feature.limit !== undefined) {
            limitExist = true;
            totalLimit += Number(feature.limit) || 0;

            const usageForFeature = userSub.usage.find(
              (usage) => usage.featureKey === featureKey,
            )?.usage || 0;

            totalUsage += Number(usageForFeature);

            // Set the unit dynamically
            unit = feature.unit || ''; // Use the unit from the feature, or default to an empty string
          }

          // Check if the feature is available in any plan
          if (feature.available) {
            available = true;
          }

          description = feature.description;
        }
      });

      // Special handling for 'social_management_suite'
      // if (featureKey === 'social_management_suite') {
      //   // Attach availability status to the request object
      //   req.featureAvailability = req.featureAvailability || {};
      //   req.featureAvailability[featureKey] = available;
      //   continue; // Do not throw an error, allow the request to proceed
      // }

      // If the feature has a limit, validate the requested usage
      if (limitExist) {
        if (requestedUsage === undefined) {
          throw new SubscriptionException(
            'FEATURE_LIMIT_EXCEEDED',
            `Feature ${featureKey} requires a requestedUsage value.`,
            HttpStatus.FORBIDDEN,
          );
        }
        // Validate total usage + requested usage against the total limit
        if (totalUsage + requestedUsage > totalLimit) {
          if (featureKey === 'storage') {
            throw new SubscriptionException(
              'FEATURE_LIMIT_EXCEEDED_STORAGE',
              //Total usage: ${totalUsage} GB, Total limit: ${totalLimit} GB, Requested: ${requestedUsage} GB
              `You have exceeded the storage limit in your current subscription plan. Please upgrade your plan to increase your storage limit.`,
              HttpStatus.FORBIDDEN,
            );
          }
        }
      } else {
        // If the feature does not have a limit, check if it is available
        if (!available) {
          throw new SubscriptionException(
            'FEATURE_NOT_AVAILABLE',
            `${description} is not available in your current plan. Please upgrade your plan to access this feature.`,
            HttpStatus.FORBIDDEN,
          );
        }
      }
    }
    return true;
  }
}