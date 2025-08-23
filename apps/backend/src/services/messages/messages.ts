import { Application } from '@feathersjs/feathers';
import { MessagesService } from './messages.class';
import { messageJsonSchema } from './messages.schema';

export const messages = (app: Application) => {
  const service = new MessagesService();
  
  // Add schema for playground discovery
  (service as any).schema = messageJsonSchema;
  (service as any).description = 'Message management service';
  
  app.use('/messages', service);
};