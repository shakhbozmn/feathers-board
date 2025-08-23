/* eslint-disable @typescript-eslint/no-unused-vars */
import { Id, NullableId, Paginated, Params } from '@feathersjs/feathers';
import { Message, MessageData, MessageQuery } from './messages.schema';

// In-memory data store for demo purposes
let messages: Message[] = [
  {
    id: 1,
    text: 'Hello, world!',
    userId: 1,
    createdAt: new Date('2023-01-01T10:00:00Z'),
    updatedAt: new Date('2023-01-01T10:00:00Z'),
  },
  {
    id: 2,
    text: 'How are you doing?',
    userId: 2,
    createdAt: new Date('2023-01-01T11:00:00Z'),
    updatedAt: new Date('2023-01-01T11:00:00Z'),
  },
  {
    id: 3,
    text: 'Great to see you!',
    userId: 1,
    createdAt: new Date('2023-01-01T12:00:00Z'),
    updatedAt: new Date('2023-01-01T12:00:00Z'),
  },
  {
    id: 4,
    text: 'This is a test message',
    userId: 3,
    createdAt: new Date('2023-01-01T13:00:00Z'),
    updatedAt: new Date('2023-01-01T13:00:00Z'),
  },
];

let nextId = 5;

export interface MessagesParams extends Params {
  query?: MessageQuery;
}

export class MessagesService {
  async find(params?: MessagesParams): Promise<Message[] | Paginated<Message>> {
    const { query = {} } = params || {};
    let result = [...messages];

    // Filter by text
    if (query.text) {
      result = result.filter(message =>
        message.text.toLowerCase().includes(query.text!.toLowerCase())
      );
    }

    // Filter by userId
    if (query.userId) {
      result = result.filter(message => message.userId === query.userId);
    }

    // Sort
    if (query.$sort) {
      const sortKey = Object.keys(query.$sort)[0] as keyof Message;
      const sortOrder = query.$sort[sortKey];
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal !== undefined && bVal !== undefined) {
          if (aVal < bVal) return sortOrder === 1 ? -1 : 1;
          if (aVal > bVal) return sortOrder === 1 ? 1 : -1;
        }
        return 0;
      });
    }

    // Pagination
    const skip = query.$skip || 0;
    const limit = query.$limit || result.length;
    const total = result.length;

    result = result.slice(skip, skip + limit);

    return {
      total,
      limit,
      skip,
      data: result,
    };
  }

  async get(id: Id, params?: MessagesParams): Promise<Message> {
    const message = messages.find(m => m.id === Number(id));
    if (!message) {
      throw new Error(`Message with id ${id} not found`);
    }
    return message;
  }

  async create(data: MessageData, params?: MessagesParams): Promise<Message> {
    const message: Message = {
      id: nextId++,
      text: data.text || '',
      userId: data.userId || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    messages.push(message);
    return message;
  }

  async patch(
    id: NullableId,
    data: MessageData,
    params?: MessagesParams
  ): Promise<Message> {
    if (id === null) {
      throw new Error('Bulk patch not supported');
    }

    const messageIndex = messages.findIndex(m => m.id === Number(id));
    if (messageIndex === -1) {
      throw new Error(`Message with id ${id} not found`);
    }

    messages[messageIndex] = {
      ...messages[messageIndex],
      ...data,
      updatedAt: new Date(),
    };

    return messages[messageIndex];
  }

  async remove(id: NullableId, params?: MessagesParams): Promise<Message> {
    if (id === null) {
      throw new Error('Bulk remove not supported');
    }

    const messageIndex = messages.findIndex(m => m.id === Number(id));
    if (messageIndex === -1) {
      throw new Error(`Message with id ${id} not found`);
    }

    const [removedMessage] = messages.splice(messageIndex, 1);
    return removedMessage;
  }
}
