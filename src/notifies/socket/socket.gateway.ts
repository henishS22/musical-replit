import {
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import SocketController from './socket.controller';
import { Injectable } from '@nestjs/common';
import SocketService from './socket.service';
import { Content, Context, Event, EventOptions } from '../utils/types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly service: SocketService) {
    this.controller = new SocketController(this.service);
    this.session = new Map();
    this.socketId = new Map();
    this.pollEvents = new Map();
    this.configService = new ConfigService();
  }

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log('Brodcasting Socket...');
    this.server = server;
  }

  handleDisconnect(client: Socket) {
    try {
      const session = this.session.get(client.id);
      if (session != null) {
        for (const offEvent of session.offSubscriptions) {
          const { event } = offEvent;
          event(client);
        }

        for (const assocEvent of session.associateEvents) {
          const { user, id } = assocEvent;
          const events = this.pollEvents.get(user);
          events.delete(id);
        }

        this.session.delete(client.id);
        this.socketId.set(
          session.sub,
          this.socketId.get(session.sub).filter((id) => id != client.id),
        );
        if (this.socketId.get(session.sub).length < 1) {
          this.socketId.delete(session.sub);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (token == null) {
        client.disconnect();
        return;
      }
      const auth = verify(token, this.configService.get('SECRET_KEY')) as any;
      if (auth.sub) {
        this.session.set(client.id, {
          sub: auth.sub,
          client,
          associateEvents: [],
          offSubscriptions: [],
        });
        this.socketId.set(auth.sub, [
          ...(this.socketId.get(auth.sub) || []),
          client.id,
        ]);

        this.executeEvents(client.id, auth.sub);
        const controllers = Object.getOwnPropertyNames(
          SocketController.prototype,
        ).slice(1);

        for (const controller of controllers) {
          const context: Context = {
            /**
             * Send a message to some user based on this sub
             * @param {string} sub - User Id
             * @param {Function} event - The event callback
             * @param {{survive : boolean}} options - Configurable option, if the flag survive is set, it will not delete the event after being executed
             * @name sendMessageUser
             * @function
             */
            sendMessageUser: (
              sub: string,
              event: (socket: Socket) => void,
              options: { survive: boolean },
            ) => {
              const clients = this.socketId.get(sub) || [];
              for (const id of clients) {
                let user_poll = this.pollEvents.get(sub);
                if (user_poll == null) {
                  user_poll = new Map();
                  this.pollEvents.set(sub, user_poll);
                }
                this.createFreshEvent(user_poll, event, {
                  survive: options?.survive ? controller : null,
                });
                this.executeEvents(id, sub);
              }
            },
            /**
             * Link a event to a route to be called everytime that the user disconnect
             * @param {Function} callback - User Id
             * @param {string} route - The route
             * @name addOffSubscription
             * @function
             */
            addOffSubscription: (
              route: string,
              callback: (socket: Socket) => void,
            ) => {
              const refClient = this.session.get(client.id);
              if (refClient == null) {
                return;
              }
              refClient.offSubscriptions.push({
                route: route,
                event: callback,
              });
            },
            /**
             * Clear events to be called when the user disconnect
             * @param {string} route - The route
             * @param {string} sub - The user id
             * @name cleanOffSubscription
             * @function
             */
            cleanOffSubscription: (route: string, sub: string) => {
              const clients = this.socketId.get(sub) || [];
              for (const id of clients) {
                const refClient = this.session.get(id);
                if (refClient == null) {
                  return;
                }
                const offSubs = refClient.offSubscriptions;
                [...offSubs].forEach((value, index) => {
                  if (value.route == route) {
                    offSubs.splice(index, 1);
                  }
                });
              }
            },
            /**
             * Clear events marked as survival
             * @param {string} route - The route
             * @param {string} sub - The user id
             * @name cleanOffSurvivalEvents
             * @function
             */
            cleanOffSurvivalEvents: (route: string, sub: string) => {
              const tasks = this.pollEvents.get(sub) || [];
              tasks.forEach(({ survive }, key, map) => {
                if (survive == route) {
                  map.delete(key);
                }
              });
            },
            sub: auth.sub,
            client,
          };
          client.on(controller, (data) =>
            this.controller[controller](data, context),
          );
        }

        return true;
      } else {
        client.disconnect();
        return;
      }
    } catch (e) {
      console.log(e);
    }
  }

  createFreshEvent(
    pollEvents: Map<string, Event>,
    event: (socket: Socket) => void,
    options: EventOptions,
  ) {
    const name = (Math.random() * 9999999).toString(16);
    if (pollEvents.get(name) != null) {
      return this.createFreshEvent(pollEvents, event, options);
    }
    pollEvents.set(name, { action: event, ...options });
    return pollEvents;
  }

  executeEvents(id: string, sub: string, ignoreSurvival = false) {
    const node = this.session.get(id);

    if (node == null) {
      return;
    }

    const tasks = this.pollEvents.get(sub) || [];

    tasks.forEach(({ action }) => action(node.client));
    tasks.forEach(({ survive }, key, map) => {
      if (survive == null || ignoreSurvival) {
        map.delete(key);
      }
    });
  }

  private controller: SocketController;
  private session: Map<string, Content>;
  private socketId: Map<string, string[]>;
  private pollEvents: Map<string, Map<string, Event>>;
  private configService: ConfigService<Record<string, unknown>, false>;
}
