import { DateTimeFormatPipe } from "../shared/pipe/date-time-format.pipe";
import { Guid } from '../shared/util/guid';

export class Chat {
  user: string;
  timestamp: string;
  message: string;

  constructor(user: string, timestamp: Date, message: string) {
    this.user = user;
    this.timestamp = new DateTimeFormatPipe('nl-BE').transform(timestamp);
    this.message = message;
  }
}

export class ChatRoom {
  guid: Guid;

  constructor(guid: Guid) {
    this.guid = guid;
  }
}