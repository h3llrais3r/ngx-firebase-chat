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

  startChatRoom(name: string): Promise<firebase.database.Reference> {
    console.debug('Checking if chatroom ' + name + ' already exists...');
    return this.getChatRoomByName(name)
      .then(ref => {
        if (ref) {
          // Return the chatroom reference if it already exists
          return ref;
        } else {
          // Create a new chatroom and return it's reference
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
    let chatRoomReference = this.db.database.ref(this.CHATROOMS_LIST_REF).push();
    let uuid = chatRoomReference.key;
    let chatRoom = new ChatRoom(uuid, chatRoomName);
    return chatRoomReference.set(chatRoom)
      .then(() => {
        console.debug('Chatroom ' + chatRoomName + ' created');
        // Push welcome message
        this.db.database.ref(StringFormat.format(this.CHATROOMS_CHATROOM_CHATS_REF, uuid))
          .push(new Chat(null, new Date(), 'Welcome to chatroom ' + chatRoom.displayName));
        // Return chatroom reference
        return chatRoomReference;
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
            console.debug('Activating chatroom ' + chatRoom.displayName);
            return chatRoom;
          });
      });
    // Handle disconnect of chatroom
    //chatRoomReference.onDisconnect().update({ active: false });
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

  connectUser(chatUser: ChatUser, chatRoom: ChatRoom = null): firebase.database.Reference {
    if (chatRoom) {
      let chatRoomUserRef = this.db.database.ref(StringFormat.format(this.CHATROOMS_CHATROOM_USERS_USER_REF, chatRoom.uuid, chatUser.uuid));
      // Remove user on disconnect (to handle real disconnects like killing browser, ...)
      chatRoomUserRef.onDisconnect().remove();
      // Connect user with chatroom if not already done
      chatRoomUserRef.once('value', snapshot => {
        if (!snapshot.exists()) {
          console.debug('Connecting user ' + chatUser.displayName + ' with chatroom ' + chatRoom.displayName + '...')
          chatRoomUserRef.set(chatUser);
        }
      });
      return chatRoomUserRef;
    } else {
      let chatBoxUserRef = this.db.database.ref(StringFormat.format(this.CHATBOX_USERS_USER_REF, chatUser.uuid));
      // Remove user on disconnect
      chatBoxUserRef.onDisconnect().remove();
      // Connect user with chatbox if not already done
      chatBoxUserRef.once('value', snapshot => {
        if (!snapshot.exists()) {
          console.debug('Connecting user ' + chatUser.displayName + ' with chatbox...')
          chatBoxUserRef.set(chatUser);
        }
      });
      return chatBoxUserRef;
    }
  }

  disconnectUser(chatUserRef: firebase.database.Reference, chatUser: ChatUser, chatRoom: ChatRoom = null): Promise<any> {
    if (chatUserRef) {
      if (chatRoom) {
        console.debug('Disconnecting user ' + chatUser.displayName + ' from chatroom ' + chatRoom.displayName + '...');
      } else {
        console.debug('Disconnecting user ' + chatUser.displayName + ' from chatbox...');
      }
      // Remove user from chatroom/chatbox
      return chatUserRef.remove();
    }
    return Promise.resolve(null);
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