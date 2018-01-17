import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';

import { Chat, ChatRoom } from './chat';

@Injectable()
export class ChatService {

  constructor(private db: AngularFireDatabase) { }

  createChatRoom(): ChatRoom {
    // Create chatroom and push welcome chat
    let chatRoom = new ChatRoom(uuid());
    this.db.list('/chatrooms/list').push(chatRoom.uuid);
    this.db.list('/chatrooms/' + chatRoom.uuid).push(new Chat('', new Date(), 'Welcome to chatroom ' + chatRoom.uuid));
    return chatRoom;
  }

  getChatRooms(): AngularFireList<string> {
    // We keep a list of chatroom uuids to prevent the loading of all chatrooms
    return this.db.list('/chatrooms/list');
  }

  getChats(chatRoom: ChatRoom = null): AngularFireList<Chat> {
    if (chatRoom) {
      console.log('Getting chats from chatroom ' + chatRoom.uuid + '...');
      return this.db.list('/chatrooms/' + chatRoom.uuid);
    } else {
      console.log('Getting chats from chatbox...')
      return this.db.list('/chatbox');
    }
  }

  submitChat(chat: Chat, chatRoom: ChatRoom = null): void {
    if (chatRoom) {
      console.log('Submitting chat to chatroom ' + chatRoom.uuid + '...');
      this.db.list('/chatrooms/' + chatRoom.uuid).push(chat);
    } else {
      console.log('Submitting chat to chatbox...')
      this.db.list('/chatbox').push(chat);
    }
  }

}