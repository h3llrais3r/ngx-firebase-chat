import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import * as firebase from '@firebase/app';

import { Chat, ChatRoom, ChatUser } from './chat';
import { StoreService } from '../store/store.service';
import { StringFormat } from '../shared/util/string-format';

@Injectable()
export class ChatService {

  // Chatbox refs
  private CHATBOX_REF = '/chatbox';
  private CHATBOX_CHATS_REF = this.CHATBOX_REF + '/chats';
  private CHATBOX_USERS_REF = this.CHATBOX_REF + '/users';
  private CHATBOX_USERS_USER_REF = this.CHATBOX_USERS_REF + '/{0}';
  // Chatrooms refs
  private CHATROOMS_REF = '/chatrooms';
  private CHATROOMS_LIST_REF = this.CHATROOMS_REF + '/list';
  private CHATROOMS_LIST_CHATROOM_REF = this.CHATROOMS_LIST_REF + '/{0}';
  private CHATROOMS_CHATROOM_REF = this.CHATROOMS_REF + '/{0}';
  private CHATROOMS_CHATROOM_CHATS_REF = this.CHATROOMS_CHATROOM_REF + '/chats';
  private CHATROOMS_CHATROOM_USERS_REF = this.CHATROOMS_CHATROOM_REF + '/users';
  private CHATROOMS_CHATROOM_USERS_USER_REF = this.CHATROOMS_CHATROOM_USERS_REF + '/{1}';

  constructor(private db: AngularFireDatabase, private storeService: StoreService) { }

  getChatRoom(chatRoomName: string): Promise<ChatRoom> {
    return this.db.database.ref(this.CHATROOMS_LIST_REF).orderByChild('displayName').equalTo(chatRoomName)
      .once('value')
      .then(snapshot => {
        if (snapshot.exists()) {
          console.debug('Chatroom ' + chatRoomName + ' found');
          // Retrieve chatroom
          let uuid = Object.keys(snapshot.val())[0]; // uuid is the key under which the chatroom has been stored!
          return this.db.database.ref(StringFormat.format(this.CHATROOMS_LIST_CHATROOM_REF, uuid))
            .once('value')
            .then(snapshot => {
              return <ChatRoom>snapshot.val();
            });
        } else {
          console.debug('Chatroom ' + chatRoomName + ' not found');
          return null;
        }
      });
  }

  createChatRoom(displayName: string = null): Promise<ChatRoom> {
    // Create chatroom (we use the key from firebase as uuid of the chat)
    let chatRoomReference = this.db.database.ref(this.CHATROOMS_LIST_REF).push();
    let uuid = chatRoomReference.key;
    let chatRoom = new ChatRoom(uuid, displayName);
    return chatRoomReference.set(chatRoom)
      .then(() => {
        console.debug('Chatroom ' + this.getChatRoomDisplayName(chatRoom) + ' created');
        // Push welcome message
        this.db.database.ref(StringFormat.format(this.CHATROOMS_CHATROOM_CHATS_REF, uuid))
          .push(new Chat(null, new Date(), 'Welcome to chatroom ' + this.getChatRoomDisplayName(chatRoom)));
        // return created chatroom
        return chatRoom;
      });
  }

  activateChatRoom(uuid: string): Promise<ChatRoom> {
    // Ativate chatroom
    let chatRoomReference = this.db.database.ref(StringFormat.format(this.CHATROOMS_LIST_CHATROOM_REF, uuid));
    return chatRoomReference
      .update({ active: true })
      .then(() => {
        return chatRoomReference
          .once('value')
          .then(snapshot => {
            let chatRoom = <ChatRoom>snapshot.val();
            console.debug('Activating chatroom ' + this.getChatRoomDisplayName(chatRoom))
            return chatRoom;
          });
      });
    // Handle disconnect of chatroom
    //chatRoomReference.onDisconnect().update({ active: false });
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
      console.debug('Getting chats from chatroom ' + chatRoom.uuid + '...');
      return this.db.list(StringFormat.format(this.CHATROOMS_CHATROOM_CHATS_REF, chatRoom.uuid));
    } else {
      console.debug('Getting chats from chatbox...')
      return this.db.list(this.CHATBOX_CHATS_REF);
    }
  }

  submitChat(chat: Chat, chatUserRef: firebase.database.Reference, chatRoom: ChatRoom = null): void {
    if (chatRoom) {
      console.debug('Submitting chat to chatroom ' + chatRoom.uuid + '...');
      this.db.list(StringFormat.format(this.CHATROOMS_CHATROOM_CHATS_REF, chatRoom.uuid)).push(chat);
      this.setChatUserIsTyping(chatUserRef, false);
    } else {
      console.debug('Submitting chat to chatbox...')
      this.db.list(this.CHATBOX_CHATS_REF).push(chat);
      this.setChatUserIsTyping(chatUserRef, false);
    }
  }

  registerUser(chatUser: ChatUser, chatRoom: ChatRoom = null): firebase.database.Reference {
    if (chatRoom) {
      // Register user in chatroom if not already done
      let userRef = this.db.database.ref(StringFormat.format(this.CHATROOMS_CHATROOM_USERS_USER_REF, chatRoom.uuid, chatUser.uuid));
      userRef.once('value', res => {
        if (!res.exists()) {
          userRef.set(chatUser);
        }
      });
      // Remove user on disconnect
      userRef.onDisconnect().remove();
      // TODO: chatRoom should become inactive when no more users are connected
      // Handle disconnect of chatroom
      // chatRoomReference.onDisconnect().update({ active: false });
      return userRef;
    } else {
      // Register user in chatbox if not already done
      let userRef = this.db.database.ref(StringFormat.format(this.CHATBOX_USERS_USER_REF, chatUser.uuid));
      userRef.once('value', res => {
        if (!res.exists()) {
          userRef.set(chatUser);
        }
      });
      // Remove user on disconnect
      userRef.onDisconnect().remove();
      // TODO: chatRoom should become inactive when no more users are connected
      // Handle disconnect of chatroom
      // chatRoomReference.onDisconnect().update({ active: false });
      return userRef;
    }
  }

  setChatUserIsTyping(chatUserRef: firebase.database.Reference, isTyping: boolean = false) {
    chatUserRef.update({ isTyping: isTyping });
  }

  getChatUsers(chatRoom: ChatRoom = null): AngularFireList<ChatUser> {
    if (chatRoom) {
      console.debug('Getting chat users in chatroom ' + chatRoom.uuid + '...');
      return this.db.list(StringFormat.format(this.CHATROOMS_CHATROOM_USERS_REF, chatRoom.uuid));
    } else {
      console.debug('Getting chat users in chatbox...')
      return this.db.list(this.CHATBOX_USERS_REF);
    }
  }

  private getChatRoomDisplayName(chatRoom: ChatRoom): string {
    return chatRoom ? chatRoom.displayName ? chatRoom.displayName : chatRoom.uuid : '';
  }

}