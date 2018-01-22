import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';

import { Chat, ChatRoom } from './chat';
import { StoreService } from '../store/store.service';
import { StringFormat } from '../shared/util/string-format';

@Injectable()
export class ChatService {

  private CHATBOX_REF = '/chatbox/';
  private CHATBOX_CHATS_REF = '/chatbox/chats/';
  private CHATBOX_TYPING_REF = '/chatbox/typing/';
  private CHATROOMS_REF = '/chatrooms/';
  private CHATROOMS_LIST_REF = '/chatrooms/list/';
  private CHATROOMS_LIST_CHATROOM_REF = '/chatrooms/lists/{0}/';
  private CHATROOMS_CHATROOM_REF = '/chatrooms/{0}/';
  private CHATROOMS_CHATROOM_CHATS_REF = '/chatrooms/{0}/chats/';
  private CHATROOMS_CHATROOM_TYPING_REF = '/chatrooms/{0}/typing/';

  constructor(private db: AngularFireDatabase, private storeService: StoreService) { }

  getChatRoom(): ChatRoom {
    let uuid = this.storeService.chatRoomUuid;
    if (uuid) {
      console.log('Activating chatroom: ' + uuid);
      return this.activateChatRoom(uuid);
    } else {
      let chatRoom = this.createChatRoom();
      this.storeService.chatRoomUuid = chatRoom.uuid;
      console.log('Creating chatroom: ' + chatRoom.uuid);
      return chatRoom;
    }
  }

  private activateChatRoom(uuid: string): ChatRoom {
    // Ativate chatroom
    let chatRoomReference = this.db.database.ref(StringFormat.format(this.CHATROOMS_LIST_CHATROOM_REF, uuid));
    let chatRoom = new ChatRoom(uuid);
    chatRoomReference.update(chatRoom);
    // Handle disconnect of chatroom
    chatRoomReference.onDisconnect().update({ active: false });
    return chatRoom;
  }

  private createChatRoom(): ChatRoom {
    // Create chatroom (we use the key from firebase as uuid of the chat)
    let chatRoomReference = this.db.database.ref(this.CHATROOMS_LIST_REF).push();
    let uuid = chatRoomReference.key;
    let chatRoom = new ChatRoom(uuid);
    chatRoomReference.set(chatRoom);
    // Handle disconnect of chatroom
    chatRoomReference.onDisconnect().update({ active: false });
    // Push welcome message
    this.db.database.ref(StringFormat.format(this.CHATROOMS_CHATROOM_CHATS_REF, uuid)).push(new Chat('', new Date(), 'Welcome to chatroom ' + uuid));
    return chatRoom;
  }

  getChatRooms(active: boolean = false): AngularFireList<ChatRoom> {
    // We keep a list of chatroom uuids to prevent the loading of all chatrooms
    if (active) {
      return this.db.list(this.CHATROOMS_LIST_REF, ref => ref.orderByChild('active').equalTo(true));
    } else {
      return this.db.list(this.CHATROOMS_LIST_REF);
    }
  }

  getChats(chatRoom: ChatRoom = null): AngularFireList<Chat> {
    if (chatRoom) {
      console.log('Getting chats from chatroom ' + chatRoom.uuid + '...');
      return this.db.list(StringFormat.format(this.CHATROOMS_CHATROOM_CHATS_REF, chatRoom.uuid));
    } else {
      console.log('Getting chats from chatbox...')
      return this.db.list(this.CHATBOX_CHATS_REF);
    }
  }

  submitChat(chat: Chat, chatRoom: ChatRoom = null): void {
    if (chatRoom) {
      console.log('Submitting chat to chatroom ' + chatRoom.uuid + '...');
      this.db.list(StringFormat.format(this.CHATROOMS_CHATROOM_CHATS_REF, chatRoom.uuid)).push(chat);
    } else {
      console.log('Submitting chat to chatbox...')
      this.db.list(this.CHATBOX_CHATS_REF).push(chat);
    }
  }

}