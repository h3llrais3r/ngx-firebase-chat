import { v4 as uuid } from 'uuid';
import { DateTimeFormatPipe } from "../shared/pipe/date-time-format.pipe";

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
  uuid: uuid;

  constructor(uuid: uuid) {
    this.uuid = uuid;
  }
}