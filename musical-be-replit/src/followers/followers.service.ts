/**
 *  @file Followers service file. Defines the services to be used in the module
 *  @author Rafael Marques Siqueira
 *  @exports FollowersService
 */

import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Injectable()
export class FollowersService {
  //Define the microservice to connect
  constructor(
    @Inject('API_USER_FOLLOWERS')
    private readonly clientKafka: ClientKafka,
  ) {}

  /**
   * Define the function to set the message to the microservice
   * @function
   * @param {string} topic - The route name for microservice.
   * @param {object} payload - The object that will be sent to microservice.
   * @returns {Observable<T>} - Returns a observable of type T
   */
  sendMessage(topic: string, payload: any): Observable<any> {
    return this.clientKafka.send(topic, payload);
  }
}
