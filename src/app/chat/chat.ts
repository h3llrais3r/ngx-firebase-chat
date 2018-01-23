import { DateTimeFormatPipe } from "../shared/pipe/date-time-format.pipe";

export class Chat {
  user: ChatUser;
  timestamp: string;
  message: string;

  constructor(user: ChatUser, timestamp: Date, message: string) {
    this.user = user;
    this.timestamp = new DateTimeFormatPipe('nl-BE').transform(timestamp);
    this.message = message;
  }
}

export class ChatUser {
  uuid: string; // references to the firebase.User identifier
  displayName: string;
  isTyping: boolean = false;

  constructor(uuid: string, displayName: string) {
    this.uuid = uuid;
    this.displayName = displayName;
    this.isTyping = false;
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