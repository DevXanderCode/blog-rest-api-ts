import { Server } from 'socket.io';
import { IncomingMessage, ServerResponse } from 'http';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

let io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
export const init = (httpServer: any): Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized.');
  }
  return io;
};
