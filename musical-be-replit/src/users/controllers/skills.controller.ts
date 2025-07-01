/**
 *  @file App main controller file. Defines the messages and events to wait for
 *  @author Rafael Marques Siqueira
 *  @exports AppController
 */

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  SkillTypeService,
  SkillLevelService,
  StylesService,
} from '../services/skills.service';

@Controller()
export class SkillsController {
  constructor(
    private readonly skillTypeService: SkillTypeService,
    private readonly skillLevelService: SkillLevelService,
    private readonly stylesService: StylesService,
  ) {}

  @MessagePattern('skills.get.type')
  async getSkillsType(payload: any) {
    return this.skillTypeService.getSkillsType(payload?.value?.lang);
  }

  @MessagePattern('skills.get.level')
  async getSkillsLevel(payload: any) {
    return this.skillLevelService.getSkillsLevel(payload?.value?.lang);
  }

  @MessagePattern('styles.get')
  async getStyles(payload: any) {
    return this.stylesService.getStyles(payload?.value?.lang);
  }
}
