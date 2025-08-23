import { Application } from '@feathersjs/feathers';
import { messages } from './messages/messages';
import { users } from './users/users';

export const services = (app: Application) => {
  app.configure(users);
  app.configure(messages);
};
