import { Application } from '@feathersjs/feathers';
import '@feathersjs/socketio';

export const channels = (app: Application) => {
  const socketApp = app as any;
  if (typeof socketApp.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return;
  }

  socketApp.on('connection', (connection: any) => {
    // On a new real-time connection, add it to the anonymous channel
    socketApp.channel('anonymous').join(connection);
  });

  socketApp.on('login', (authResult: any, { connection }: any) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if (connection) {
      // Obtain the logged in user from the connection
      // const user = connection.user;

      // The connection is no longer anonymous, remove it
      socketApp.channel('anonymous').leave(connection);

      // Add it to the authenticated user channel
      socketApp.channel('authenticated').join(connection);

      // Channels can be named anything and joined on any condition

      // E.g. to send real-time events only to admins use
      // if(user.isAdmin) { app.channel('admins').join(connection); }

      // If the user has joined e.g. chat rooms
      // if(Array.isArray(user.rooms)) user.rooms.forEach(room => app.channel(`rooms/${room.id}`).join(channel));
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  socketApp.publish((data: any, hook: any) => {
    // Here you can add event publishers to channels set up in `channels.js`
    // To publish only for a specific event use `app.publish(eventname, () => {})`

    console.log(
      'Publishing all events to all authenticated users. See `channels.js` and https://docs.feathersjs.com/api/channels.html for more information.'
    );

    // e.g. to publish all service events to all authenticated users use
    return socketApp.channel('authenticated');
  });
};
