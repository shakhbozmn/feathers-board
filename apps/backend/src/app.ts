import express, {
  cors,
  errorHandler,
  json,
  notFound,
  rest,
  serveStatic,
  urlencoded,
} from '@feathersjs/express';
import { feathers } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio';
import { playground } from 'feathers-playground';

import { channels } from './channels';
import { services } from './services';

const PORT = process.env.PORT || 3030;

// Create Express app
const app = express(feathers());

// Load app configuration
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Set public directory and host the public folder
app.set('public', './public');
// Only serve static files if the directory exists, otherwise skip
try {
  app.use('/', serveStatic('./public'));
} catch {
  console.log('No public directory found, skipping static file serving');
}

// Configure services and real-time functionality
app.configure(rest());
app.configure(
  socketio({
    cors: {
      origin: app.get('origins'),
    },
  })
);

// Configure services
app.configure(services);

// Configure channels
app.configure(channels);

// Configure the playground plugin (registers /services + serves the UI at /playground)
app.configure(
  playground({
    path: '/playground',
    title: 'My API Playground',
  })
);

// Configure a middleware for 404s and the error handler
app.use(notFound());
app.use(errorHandler());

app.hooks({
  around: {
    all: [],
  },
  before: {},
  after: {},
  error: {},
});

// Start the server
app.listen(PORT).then(() => {
  console.log(`🪶 Feathers app listening on http://localhost:${PORT}`);
  console.log(`🎮 Playground available at http://localhost:${PORT}/playground`);
  console.log(`📋 Services API at http://localhost:${PORT}/services`);
});

export { app };
