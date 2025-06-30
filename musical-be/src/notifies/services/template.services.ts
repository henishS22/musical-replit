import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as Handlebars from 'handlebars';
import * as path from 'path';

@Injectable()
export class TemplateService {
    constructor() {
        Handlebars.registerHelper('raw', function (options) {
          return new Handlebars.SafeString(options.fn(this));
        });
      }
  private templateCache: Map<string, Handlebars.TemplateDelegate> = new Map();

  async getTemplate(templateId: string, params: any): Promise<string> {
    //if (!this.templateCache.has(templateId)) {
      const templatePath = path.join(__dirname, '..', 'templates', `${templateId}.hbs`);

      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template ${templateId} not found`);
      }

      const templateContent = await fs.readFile(templatePath, 'utf8');
      const compiledTemplate = Handlebars.compile(templateContent,{ noEscape: true });
      return compiledTemplate(params)
     // this.templateCache.set(templateId, compiledTemplate);
   // }

   // return this.templateCache.get(templateId)(params);
  }
}
