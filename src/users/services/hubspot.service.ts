import ServiceException from '../exceptions/ServiceException';

import { Inject, Injectable } from '@nestjs/common';
import { Client as HubspotClient } from '@hubspot/api-client';
import { createRegisterDto } from '../dto/createRegister.dto';
import { ExceptionsEnum } from '../utils/enums';
import { AddTicketDto } from '../dto/addTicket.dto';
import {
  SimplePublicObjectInputForCreate as ContactsSimplePublicObjectInput,
  FilterOperatorEnum,
} from '@hubspot/api-client/lib/codegen/crm/contacts';
import { HubspotOriginForm } from '../utils/enums';

@Injectable()
export class HubspotService {
  constructor(@Inject('HUBSPOT') private readonly client: HubspotClient) {}

  async insertContact(contact: createRegisterDto) {
    const firstName = contact.firstName || '';
    const lastName = contact.lastName || '';
    const properties = {
      ...contact,
      firstname: contact.firstName || '',
      lastname: contact.lastName || '',
      fullname: `${firstName} ${lastName}`,
      jobtitle: contact.title || '',
      business: contact.business || '',
      company: contact.company || '',
      comments: contact.comments || '',
      origin_form: contact.originForm,
      genre_of_music: contact.genreOfMusic || '',
      message: contact.message || '',
      topic: contact.topic || '',
    };

    delete properties.firstName;
    delete properties.lastName;
    delete properties.title;
    delete properties.originForm;
    delete properties.genreOfMusic;

    const simplePublicObjectInput: ContactsSimplePublicObjectInput = {
      properties,
      associations: null,
    };

    try {
      return await this.client.crm.contacts.basicApi.create(
        simplePublicObjectInput,
      );
    } catch (e) {
      const message = e.response ? JSON.stringify(e.response) : e.message;

      throw new ServiceException(
        `Sending contact to Hubspot: ${message}`,
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  async insertTicket(ticket: AddTicketDto) {
    const firstName = ticket.firstName || '';
    const lastName = ticket.lastName || '';
    const contact = await this.getContactByEmail(ticket.email);

    if (contact) {
      await this.updateContact(contact.id, {
        firstName,
        lastName,
        company: ticket.company || '',
        topic: ticket.topic || '',
        message: ticket.message,
      });

      return;
    }

    await this.insertContact({
      email: ticket.email,
      firstName,
      lastName,
      company: ticket.company || '',
      topic: ticket.topic || '',
      message: ticket.message,
      originForm: HubspotOriginForm.Contact,
    } as createRegisterDto);

    // TODO: add ticket and associate it to contact

    // const input: TicketsSimplePublicObjectInput = {
    //   properties: {
    //     subject: ticket.topic,
    //     content: ticket.message,
    //     hs_pipeline_stage: '1',
    //     hs_pipeline: '0',
    //   },
    // };

    // let createdTicket: SimplePublicObject;

    // try {
    //   createdTicket = await this.client.crm.tickets.basicApi.create(input);
    // } catch (e) {
    //   const message = e.response ? JSON.stringify(e.response) : e.message;

    //   throw new ServiceException(
    //     `Sending ticket to Hubspot: ${message}`,
    //     ExceptionsEnum.InternalServerError,
    //   );
    // }

    // await this.createAssociation(
    //   'contacts',
    //   contact.id,
    //   'tickets',
    //   createdTicket.id,
    // );
  }

  async createAssociation(
    fromObjectType: string,
    fromObjectId: string,
    toObjectType: string,
    toObjectId: string,
  ) {
    const path = `/crm/v4/objects/${fromObjectType}/${fromObjectId}/associations/${toObjectType}/${toObjectId}`;

    try {
      return await this.client.apiRequest({
        method: 'PUT',
        path,
        body: {
          associationCategory: 'HUBSPOT_DEFINED',
          associationTypeId: '0',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (e) {
      const message = e.response ? JSON.stringify(e.response) : e.message;

      throw new ServiceException(
        `Creating association to Hubspot: ${message}`,
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  async getContactByEmail(email: string, properties: string[] = ['email']) {
    const contacts = await this.client.crm.contacts.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'email',
              operator: FilterOperatorEnum.Eq,
              value: email,
            },
          ],
        },
      ],
      properties,
      limit: 1,
      after: String(0),
      sorts: [],
    });

    const contact = contacts.results[0];

    return contact || null;
  }

  async updateContact(contactId: string, properties: any) {
    const input: ContactsSimplePublicObjectInput = {
      properties,
      associations: null,
    };

    try {
      return await this.client.crm.contacts.basicApi.update(contactId, input);
    } catch (e) {
      const message = e.response ? JSON.stringify(e.response) : e.message;

      throw new ServiceException(
        `Updating contact to Hubspot: ${message}`,
        ExceptionsEnum.InternalServerError,
      );
    }
  }
}
