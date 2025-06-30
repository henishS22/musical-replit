import { Injectable } from '@nestjs/common';
import { translate } from './utils/translate';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SkillTypeDocument } from './schemas/skillType.schema';
import { SkillLevelDocument } from './schemas/skillLevel.schema';
import { StyleDocument, Style } from './schemas/style.schema';
import * as fs from 'fs';
import * as path from 'path';
import { CollabRoleDocument } from './schemas/collabRole.schema';

@Injectable()
export class SkillsService {
  private readonly imageFolderPath = path.join(__dirname, '..', 'docs', 'static', 'instrument');
  constructor(
    @InjectModel('skill_types')
    private skillTypeModel: Model<SkillTypeDocument>,
    @InjectModel('skill_levels')
    private skillLevelModel: Model<SkillLevelDocument>,
    @InjectModel('styles') private styleModel: Model<StyleDocument>,
    @InjectModel('collabRoles') private collabRolesModel: Model<CollabRoleDocument>,
  ) { }

  async getSkillsType(lang: string | null) {

    const skills = await this.skillTypeModel.find({}).sort({ title: 1 });

    const data = translate(skills, lang);
    const withImages = await this.getIntrucmentImages(data)

    return withImages;
  }


  async addSkillsType(data: any) {

    const skills = await this.skillTypeModel.insertMany(data)
    return skills;
  }


  async getSkillsLevel(lang: string | null) {
    const skills = await this.skillLevelModel.find({});
    return translate(skills, lang);
  }

  async getStyles(lang: string | null) {
    const styles = await this.styleModel.find({}).sort({ style: 1 });;
    return translate(styles, lang);
  }

  async getIntrucmentImages(skills) {
    try {
      const imageFiles = fs.readdirSync(this.imageFolderPath);

      return skills.map(item => {
        const matchingImage = imageFiles.find(file => file.startsWith(item.instrument));

        if (matchingImage) {
          // item.icon = path.join('https://dev-backend.musicalapp.com', 'instrument', matchingImage);
          item.icon = path.join(`${process.env.BACKEND_URL}`, 'instrument', matchingImage);
        }

        return item;
      });
    } catch (error) {
      console.error('Error reading image directory:', error);
      throw new Error('Could not retrieve image paths');
    }
  }

  async getCollabRoles(lang: string | null) {
    const collabRoles = await this.collabRolesModel.find({}).sort({ title: 1 });;
    return translate(collabRoles, lang);
  }

}
