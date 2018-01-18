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
  uuid: string;
  active: boolean;

  constructor(uuid: string) {
    this.uuid = uuid;
    this.active = true;
  }
}