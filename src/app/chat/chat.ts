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
  name: string;
  isTyping: boolean = false;

  constructor(uuid: string, name: string) {
    this.uuid = uuid;
    this.name = name;
    this.isTyping = false;
  }

  get displayName(): string {
    return this.name ? this.name : this.uuid;
  }
}

export class ChatRoom {
  uuid: string;
  name: string;
  active: boolean;

  // In case the name is empty, we consider it a private chatroom
  constructor(uuid: string, name: string = null, active: boolean = true) {
    this.uuid = uuid;
    this.name = name;
    this.active = active;
  }

  get displayName(): string {
    return this.name ? this.name : this.uuid;
  }

  // Helper method to construct the ChatRoom object from a json object (with same object interface)
  static fromData(chatRoomData: ChatRoom) {
    return new ChatRoom(chatRoomData.uuid, chatRoomData.name, chatRoomData.active);
  }

}