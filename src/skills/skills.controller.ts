import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkillLevelsResponseDto } from './dto/definitions/skillLevelsResponse.dto';
import { SkillsTypesResponseDto } from '../docs/dto/skillsTypesResponse.dto';
import { StylesResponseDto } from '../docs/dto/stylesResponse.dto';

// Services Imports
import { SkillsService } from './skills.service';

@Controller('skills')
@ApiTags('Skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) { }

  @Get('levels/:lang')
  @ApiOperation({
    summary: 'Get all skills',
  })
  @ApiOkResponse({
    description: 'Return the list of skills as a list',
    type: SkillLevelsResponseDto,
  })
  getSkillLevels(@Param('lang') lang: string) {
    return this.skillsService.getSkillsLevel(lang);
  }

  @Post('types/:lang')
  @ApiOperation({
    summary: 'Returns a list of skills type in specific language',
  })
  @ApiOkResponse({
    description: 'Return the list of type skills as a list',
    type: [SkillsTypesResponseDto],
  })
  addSkillsType(@Body() data: any) {

    return this.skillsService.addSkillsType(data);
  }

  @Get('types/:lang')
  @ApiOperation({
    summary: 'Returns a list of skills type in specific language',
  })
  @ApiOkResponse({
    description: 'Return the list of type skills as a list',
    type: [SkillsTypesResponseDto],
  })
  getSkillsType(@Param('lang') lang: string) {
    return this.skillsService.getSkillsType(lang);
  }
}

@Controller('styles')
@ApiTags('Styles')
export class StylesController {
  constructor(private readonly skillsService: SkillsService) { }

  @Get('/:lang')
  @ApiOperation({
    summary: 'Returns a list of styles in specific language',
  })
  @ApiOkResponse({
    description: 'Return the list of styles as a list',
    type: [StylesResponseDto],
  })
  getStyles(@Param('lang') lang: string) {
    return this.skillsService.getStyles(lang);
  }
}


@Controller('collabRoles')
@ApiTags('CollabRoles')
export class CollabRoleController {
  constructor(private readonly skillsService: SkillsService) { }

  @Get('/:lang')
  @ApiOperation({
    summary: 'Returns a list of collaborator roles specific language',
  })
  @ApiOkResponse({
    description: 'Return the list of collaborator roles as a list',
    type: [StylesResponseDto],
  })
  getStyles(@Param('lang') lang: string) {
    return this.skillsService.getCollabRoles(lang);
  }
}