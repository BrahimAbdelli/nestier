import { Request } from 'express';
import { ObjectId } from 'mongodb';

export interface IGetUserAuthInfoRequest extends Request {
  user: RequestUser;
}

interface RequestUser {
  _id: ObjectId;
  username: string;
  email: string;
  roles: string[];
  userCreated?: ObjectId;
  userUpdated?: ObjectId;
}
