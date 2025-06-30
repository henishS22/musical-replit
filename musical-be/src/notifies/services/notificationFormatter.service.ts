import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NotificationFormat,
  NotificationFormatDocument,
  Notify,
} from '@/src/schemas/schemas';
import { NotifyTypeEnum } from '../utils/enums';
import { Notification } from '../utils/types';

@Injectable()
export class NotificationFormatterService {
  constructor(
    @InjectModel(NotificationFormat.name)
    private readonly notificationFormatModel: Model<NotificationFormatDocument>,
  ) {}

  /**
   * Format title and body of notification.
   *
   * @param {Notify} notify
   * @returns {Promise<null | Notification>}}
   */
  async format(notify: Notify): Promise<null | Notification> {
    const { type } = notify;
    const formatter = await this.getFormatterForType(type);

    if (!formatter) {
      return null;
    }

    const { title: titleFormat, body: bodyFormat, importance } = formatter;
    const titleVars = this.extractVarsFromFormat(titleFormat);
    const bodyVars = this.extractVarsFromFormat(bodyFormat);
    const title = this.replaceVarsInFormat(titleFormat, notify, titleVars);
    const body = this.replaceVarsInFormat(bodyFormat, notify, bodyVars);

    return {
      title,
      body,
      type,
      importance,
      payload: notify.data,
    };
  }

  /**
   * Extracts vars from a format string.
   * Vars are defined as `{:varName}`.
   *
   * @param {string} format
   * @returns {string[]}
   */
  private extractVarsFromFormat(format: string): string[] {
    const matches = format.match(/\{:(.*?)\}/g);

    if (!matches) {
      return [];
    }

    const extractedVars = matches.map((str) => str.replace(/\{:(.*?)\}/, '$1'));

    return extractedVars;
  }

  /**
   * Find the value of a variable in a notification object.
   *
   * @param {object} notify
   * @param {string} varPath
   * @returns {any}
   */
  private findVarOnObject(notify: object, varPath: string): any {
    const varParts = varPath.split('.');

    let acc = notify;

    for (let currentIndex = 0; currentIndex < varParts.length; currentIndex++) {
      const part = varParts[currentIndex];
      const partValue = acc[part];
      const partIsArray = Array.isArray(partValue);

      if (partIsArray) {
        const pathInsideObjectFromArray = varParts
          .slice(currentIndex + 1)
          .join('.');
        const partValues = partValue.map((item) =>
          this.findVarOnObject(item, pathInsideObjectFromArray),
        );

        return partValues.join(', ');
      }

      if (currentIndex === varParts.length - 1) {
        return partValue;
      }

      if (partValue) {
        acc = partValue;
      } else {
        return null;
      }
    }
  }

  /**
   * Replace variables in a format string.
   *
   * @param {string} format
   * @param {object} notify
   * @param {string[]} vars
   * @returns {string}
   */
  private replaceVarsInFormat(
    format: string,
    notify: object,
    vars: string[],
  ): string {
    const formatted = vars.reduce((acc, varName) => {
      const varValue = this.findVarOnObject(notify, varName);

      if (varValue) {
        return acc.replace(`{:${varName}}`, varValue);
      }

      return acc;
    }, format);

    return formatted;
  }

  /**
   * Get a formatter for a notification type.
   *
   * @param {NotifyTypeEnum} type
   * @returns {Promise<NotificationFormatDocument>}
   */
  private async getFormatterForType(
    type: NotifyTypeEnum,
  ): Promise<NotificationFormatDocument> {
    return this.notificationFormatModel.findOne({ type });
  }
}
