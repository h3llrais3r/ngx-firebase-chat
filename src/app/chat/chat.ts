import { DateTimeFormatPipe } from "../shared/pipe/date-time-format.pipe";

export enum MessageType {
  MESSAGE = "MESSAGE",
  IMAGE = "IMAGE",
  FILE = "FILE"
}

export class Chat {
  user: ChatUser;
  timestamp: string;
  messageType: MessageType;
  message: string;
  downloadUrl?: string;

  constructor(user: ChatUser, timestamp: Date, messageType: MessageType, message: string, downloadUrl: string = null) {
    this.user = user;
    this.timestamp = new DateTimeFormatPipe('nl-BE').transform(timestamp);
    this.messageType = messageType;
    this.message = message;
    this.downloadUrl = downloadUrl;
  }

  // Helper method to construct the Chat object from a json object (with same object interface)
  static fromData(chat: Chat) {
    // The chatUser is empty for welcome messages!
    let chatUser = chat.user ? ChatUser.fromData(chat.user) : null;
    return new Chat(chatUser, new DateTimeFormatPipe('nl-BE').transform(chat.timestamp), chat.messageType, chat.message, chat.downloadUrl);
  }
}

export class ChatUser {
  uuid: string; // references to the firebase.User identifier
  name: string;
  isTyping: boolean = false;

  constructor(uuid: string, name: string, isTyping: boolean = false) {
    this.uuid = uuid;
    this.name = name;
    this.isTyping = isTyping;
  }

  get displayName(): string {
    return this.name ? this.name : this.uuid;
  }

  // Helper method to construct the ChatUser object from a json object (with same object interface)
  static fromData(chatUserData: ChatUser) {
    return new ChatUser(chatUserData.uuid, chatUserData.name, chatUserData.isTyping);
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