/**
 *  @file App main service file. Defines the services to be used in the microservice.
 *  @author Rafael Marques Siqueira
 *  @exports AppService
 */

import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { translate } from '../utils/translate';
import {
  Style,
  StyleDocument,
  SkillTypeDocument,
  SkillLevelDocument,
} from '@/src/schemas/schemas';

@Injectable()
export class SkillTypeService {
  constructor(
    @InjectModel('skill_type') private skillModel: Model<SkillTypeDocument>,
  ) {}

  /**
   * Get all skills types ids and descriptions
   * @function
   * @param {string} lang - Returns descriptions in lang selected, if lang is null, the default language is chosen alternatively.
   */
  async getSkillsType(lang: string | null) {
    const skills = await this.skillModel.find({});
    return translate(skills, lang);
  }
}

@Injectable()
export class SkillLevelService {
  constructor(
    @InjectModel('skill_level') private skillModel: Model<SkillLevelDocument>,
  ) {}

  /**
   * Get all skills levels ids and descriptions
   * @function
   * @param {string} lang - Returns descriptions in lang selected, if lang is null, the default language is chosen alternatively.
   */
  async getSkillsLevel(lang: string | null) {
    const skills = await this.skillModel.find({});
    return translate(skills, lang);
  }
}

@Injectable()
export class StylesService {
  constructor(
    @InjectModel(Style.name) private styleModel: Model<StyleDocument>,
  ) {}

  async getStyles(lang: string | null) {
    const styles = await this.styleModel.find({});
    return translate(styles, lang);
  }
}
