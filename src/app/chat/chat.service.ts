import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import * as firebase from 'firebase/app';

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

  startChatRoom(name: string): Promise<firebase.database.Reference> {
    console.debug('Checking if chatroom ' + name + ' already exists...');
    return this.getChatRoomByName(name)
      .then(ref => {
        if (ref) {
          // Activate the existing chatroom and return its reference
          return this.activateChatRoom(ref, name);
        } else {
          // Create a new chatroom and return its reference
          console.debug('Creating chatroom ' + name + '...');
          return this.createChatRoom(name);
        }
      });
  }

  getChatRoomByName(name: string): Promise<firebase.database.Reference> {
    return this.db.database.ref(this.CHATROOMS_LIST_REF).orderByChild('name').equalTo(name)
      .once('value')
      .then(snapshot => {
        if (snapshot.exists()) {
          // Chatroom found, return chatroom reference
          console.debug('Chatroom ' + name + ' found');
          let uuid = Object.keys(snapshot.val())[0]; // uuid is the key under which the chatroom has been stored!
          return this.db.database.ref(StringFormat.format(this.CHATROOMS_LIST_CHATROOM_REF, uuid));
        } else {
          // Chatroom doesn't exist
          console.debug('Chatroom ' + name + ' not found');
          return null;
        }
      });
  }

  getChatRoomByUuid(uuid: string): Promise<firebase.database.Reference> {
    return Promise.resolve(this.db.database.ref(StringFormat.format(this.CHATROOMS_CHATROOM_REF, uuid)));
  }

  createChatRoom(chatRoomName: string = null): Promise<firebase.database.Reference> {
    // Create chatroom
    let chatRoomRef = this.db.database.ref(this.CHATROOMS_LIST_REF).push();
    let uuid = chatRoomRef.key;
    let chatRoom = new ChatRoom(uuid, chatRoomName);
    return chatRoomRef.set(chatRoom)
      .then(() => {
        console.debug('Chatroom ' + chatRoomName + ' created');
        // Push welcome message
        this.db.database.ref(StringFormat.format(this.CHATROOMS_CHATROOM_CHATS_REF, uuid))
          .push(new Chat(null, new Date(), 'Welcome to chatroom ' + chatRoom.displayName));
        // Return chatroom reference
        return chatRoomRef;
      });
  }

  activateChatRoom(chatRoomRef: firebase.database.Reference, name: string): Promise<firebase.database.Reference> {
    // Ativate chatroom
    return chatRoomRef
      .update({ active: true })
      .then(() => {
        console.debug('Activating chatroom ' + name + '...');
        return chatRoomRef;
      });
  }

  getChatRooms(active?: boolean): AngularFireList<ChatRoom> {
    // We keep a list of chatroom uuids to prevent the loading of all chatrooms
    if (active === undefined) {
      // Fetch all
      return this.db.list(this.CHATROOMS_LIST_REF);
    } else {
      // Fetch based on active flag
      return this.db.list(this.CHATROOMS_LIST_REF, ref => ref.orderByChild('active').equalTo(active));
    }
  }

  getChats(chatRoom: ChatRoom = null): AngularFireList<Chat> {
    if (chatRoom) {
      console.debug('Getting chats from chatroom ' + chatRoom.displayName + '...');
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

  connectUser(chatUser: ChatUser, chatRoom: ChatRoom = null): Promise<firebase.database.Reference> {
    if (chatRoom) {
      let chatRoomUserRef = this.db.database.ref(StringFormat.format(this.CHATROOMS_CHATROOM_USERS_USER_REF, chatRoom.uuid, chatUser.uuid));
      // Remove user on disconnect (to handle real disconnects like killing browser, ...)
      chatRoomUserRef.onDisconnect().remove();
      // Connect user to chatroom if not already done
      return chatRoomUserRef
        .once('value', snapshot => {
          if (!snapshot.exists()) {
            console.debug('Connecting user ' + chatUser.displayName + ' to chatroom ' + chatRoom.displayName + '...');
            chatRoomUserRef.set(chatUser);
          }
        })
        .then(snapshot => Promise.resolve(chatRoomUserRef));
    } else {
      let chatBoxUserRef = this.db.database.ref(StringFormat.format(this.CHATBOX_USERS_USER_REF, chatUser.uuid));
      // Remove user on disconnect
      chatBoxUserRef.onDisconnect().remove();
      // Connect user to chatbox if not already done
      return chatBoxUserRef
        .once('value', snapshot => {
          if (!snapshot.exists()) {
            console.debug('Connecting user ' + chatUser.displayName + ' to chatbox...');
            chatBoxUserRef.set(chatUser);
          }
        })
        .then(() => Promise.resolve(chatBoxUserRef));
    }
  }

  disconnectUser(chatUserRef: firebase.database.Reference, chatUser: ChatUser, chatRoom: ChatRoom = null): Promise<any> {
    if (chatUserRef) {
      if (chatRoom) {
        console.debug('Disconnecting user ' + chatUser.displayName + ' from chatroom ' + chatRoom.displayName + '...');
        // Remove user from chatroom and handle chatroom status
        return chatUserRef.remove(() => this.handleChatRoomStatus(chatRoom));
      } else {
        console.debug('Disconnecting user ' + chatUser.displayName + ' from chatbox...');
        // Remove user from chatbox
        return chatUserRef.remove();
      }
    }
    // No need to disconnect since we weren't connected before
    return Promise.resolve(null);
  }

  private handleChatRoomStatus(chatRoom: ChatRoom): void {
    console.debug('Handling status of chatroom  ' + chatRoom.displayName + '...');
    this.db.database.ref(StringFormat.format(this.CHATROOMS_CHATROOM_USERS_REF, chatRoom.uuid))
      .once('value', snapshot => {
        if (!snapshot.exists()) {
          // Deactivate chatroom if no more users are connected
          console.debug('Deactivating chatroom ' + chatRoom.displayName + '...')
          this.db.database.ref(StringFormat.format(this.CHATROOMS_LIST_CHATROOM_REF, chatRoom.uuid))
            .update({ 'active': false });
        }
      });
  }

  setChatUserIsTyping(chatUserRef: firebase.database.Reference, isTyping: boolean = false) {
    chatUserRef.update({ isTyping: isTyping });
  }

  getChatUsers(chatRoom: ChatRoom = null): AngularFireList<ChatUser> {
    if (chatRoom) {
      console.debug('Getting chat users in chatroom ' + chatRoom.displayName + '...');
      return this.db.list(StringFormat.format(this.CHATROOMS_CHATROOM_USERS_REF, chatRoom.uuid));
    } else {
      console.debug('Getting chat users in chatbox...')
      return this.db.list(this.CHATBOX_USERS_REF);
    }
  }

}