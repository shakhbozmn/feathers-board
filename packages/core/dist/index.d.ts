import { Application } from '@feathersjs/feathers';
export interface PlaygroundOptions {
  path?: string;
  exposeSchemas?: boolean;
  title?: string;
  description?: string;
  version?: string;
  apiUrl?: string;
  cors?: boolean;
  authentication?: {
    enabled: boolean;
    strategies?: string[];
  };
}
export declare function playground(
  options?: PlaygroundOptions
): (app: Application) => void;
export declare function extractSchema(validator: any): any;
export default playground;
