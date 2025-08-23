import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { User, UserData, UserQuery } from './users.schema';

// In-memory data store for demo purposes
let users: User[] = [
  {
    id: 1,
    email: 'john@example.com',
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=1',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: 2,
    email: 'jane@example.com',
    name: 'Jane Smith',
    avatar: 'https://i.pravatar.cc/150?img=2',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
  {
    id: 3,
    email: 'bob@example.com',
    name: 'Bob Johnson',
    avatar: 'https://i.pravatar.cc/150?img=3',
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-03'),
  },
];

let nextId = 4;

export interface UsersParams extends Params {
  query?: UserQuery;
}

export class UsersService implements ServiceMethods<User> {
  async find(params?: UsersParams): Promise<User[] | Paginated<User>> {
    const { query = {} } = params || {};
    let result = [...users];

    // Filter by email
    if (query.email) {
      result = result.filter(user => 
        user.email.toLowerCase().includes(query.email!.toLowerCase())
      );
    }

    // Filter by name
    if (query.name) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(query.name!.toLowerCase())
      );
    }

    // Sort
    if (query.$sort) {
      const sortKey = Object.keys(query.$sort)[0] as keyof User;
      const sortOrder = query.$sort[sortKey];
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal < bVal) return sortOrder === 1 ? -1 : 1;
        if (aVal > bVal) return sortOrder === 1 ? 1 : -1;
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

  async get(id: Id, params?: UsersParams): Promise<User> {
    const user = users.find(u => u.id === Number(id));
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  async create(data: UserData, params?: UsersParams): Promise<User> {
    const user: User = {
      id: nextId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(user);
    return user;
  }

  async patch(id: NullableId, data: UserData, params?: UsersParams): Promise<User> {
    if (id === null) {
      throw new Error('Bulk patch not supported');
    }

    const userIndex = users.findIndex(u => u.id === Number(id));
    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`);
    }

    users[userIndex] = {
      ...users[userIndex],
      ...data,
      updatedAt: new Date(),
    };

    return users[userIndex];
  }

  async remove(id: NullableId, params?: UsersParams): Promise<User> {
    if (id === null) {
      throw new Error('Bulk remove not supported');
    }

    const userIndex = users.findIndex(u => u.id === Number(id));
    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`);
    }

    const [removedUser] = users.splice(userIndex, 1);
    return removedUser;
  }
}