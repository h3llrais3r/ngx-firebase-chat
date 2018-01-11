import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';

import { Chat } from './chat';
import { ChatRoom } from './chat-room';
import { Guid } from '../shared/util/guid';

@Injectable()
export class ChatService {

  constructor(private db: AngularFireDatabase) { }

  createChatRoom(): ChatRoom {
    // Create chatroom and push welcome chat
    let chatRoom = new ChatRoom(Guid.newGuid());
    this.db.list('/chatrooms/list').push(chatRoom.guid);
    this.db.list('/chatrooms/' + chatRoom.guid).push(new Chat('', new Date(), 'Welcome to chatroom ' + chatRoom.guid));
    return chatRoom;
  }

  getChatRooms(): any {
    // We keep a list of chatroom guids to prevent the loading of all chatrooms
    return this.db.list('/chatrooms/list');
  }

  getChats(chatRoom: ChatRoom = null): AngularFireList<Chat> {
    if (chatRoom) {
      console.log('Getting chats from chatroom ' + chatRoom.guid + '...');
      return this.db.list('/chatrooms/' + chatRoom.guid);
    } else {
      console.log('Getting chats...')
      return this.db.list('/chats');
    }
  }

  submitChat(chat: Chat, chatRoom: ChatRoom = null): void {
    if (chatRoom) {
      console.log('Submitting to chatroom ' + chatRoom.guid + '...');
      this.db.list('/chatrooms/' + chatRoom.guid).push(chat);
    } else {
      console.log('Submitting to chats...')
      this.db.list('/chats').push(chat);
    }
  }

}