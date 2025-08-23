import { Application } from '@feathersjs/feathers';
import { UsersService } from './users.class';
import { userJsonSchema } from './users.schema';

export const users = (app: Application) => {
  const service = new UsersService();
  
  // Add schema for playground discovery
  (service as any).schema = userJsonSchema;
  (service as any).description = 'User management service';
  
  app.use('/users', service);
};