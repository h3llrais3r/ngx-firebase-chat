import { Component, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { EmojiService } from 'ng-emoji-picker';
import { PushNotificationsService } from 'ng-push';
import { UploadEvent, UploadFile } from 'ngx-file-drop';
import * as firebase from 'firebase/app';

import { Chat, ChatRoom, ChatUser, MessageType } from './chat';
import { ChatService } from './chat.service';
import { AuthService } from '../auth/auth.service';

declare var $; // declare jquery

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit, OnChanges {

  @Input()
  chatRoom: ChatRoom;

  chatUser: ChatUser;
  chatUserRef: firebase.database.Reference;

  chats: any[];
  chatUsers: ChatUser[];
  chatUsersTyping: string[];
  chatUsersTypingMessage: string;

  public files: UploadFile[] = [];

  notifyNewChats: boolean = false;

  message: string = '';

  openPopup: Function;

  constructor(private authService: AuthService,
    private chatService: ChatService,
    private emojiService: EmojiService,
    private pushNotificationsService: PushNotificationsService) {
    this.pushNotificationsService.requestPermission();
  }

  ngOnInit(): void {
    this.authService.getAuthState().subscribe(user => {
      this.chatUser = this.getChatUser(user);
      this.loadChatComponent(this.chatRoom);
    });
  }

  ngAfterViewInit(): void {
    $('#notifyNewChats').bootstrapToggle();
    $('#notifyNewChats').change((event) => {
      this.notifyNewChats = event.target.checked;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Only handle changes for chatRoom (for now only chatRoom is monitored)
    let chatRoomChange: SimpleChange = changes.chatRoom;
    if (chatRoomChange) {
      // Make sure it's a ChatRoom object (to be able to use the displayName property)
      this.chatRoom = this.chatRoom instanceof ChatRoom ? this.chatRoom : ChatRoom.fromData(this.chatRoom);
      // Only reload when currentValue != previousValue (on firstChange previousValue is undefined so skip that also)
      if (!chatRoomChange.firstChange && chatRoomChange.currentValue && chatRoomChange.currentValue !== chatRoomChange.previousValue) {
        let previousChatRoom = ChatRoom.fromData(chatRoomChange.previousValue);
        this.loadChatComponent(this.chatRoom, previousChatRoom);
      }
    }
  }

  setPopupAction(fn: any): void {
    this.openPopup = fn;
  }

  isTyping(): void {
    if (this.message) {
      this.chatService.setChatUserIsTyping(this.chatUserRef, true);
    } else {
      this.chatService.setChatUserIsTyping(this.chatUserRef, false);
    }
  }

  fileDrop(event: UploadEvent): void {
    this.files = event.files;
    for (const file of event.files) {
      file.fileEntry.file(fileObj => {
        this.chatService.uploadFile(fileObj).then(
          snapshot => {
            if (snapshot.metadata.contentType.indexOf('image') >= 0) {
              // Submit image chat
              let chat = new Chat(this.chatUser, new Date(), MessageType.IMAGE, snapshot.metadata.name, snapshot.downloadURL);
              this.chatService.submitChat(chat, this.chatUserRef, this.chatRoom);
            } else {
              // Submit file chat
              let chat = new Chat(this.chatUser, new Date(), MessageType.FILE, snapshot.metadata.name, snapshot.downloadURL);
              this.chatService.submitChat(chat, this.chatUserRef, this.chatRoom);
            }
          }
        );
      });
    }
  }

  fileOver(event) {
    console.log(event);
  }

  fileLeave(event) {
    console.log(event);
  }

  submitChatMessage(event: any): void {
    // Only submit real message (don't submit empty ones)
    if (this.message) {
      let chat = new Chat(this.chatUser, new Date(), MessageType.MESSAGE, this.message);
      this.chatService.submitChat(chat, this.chatUserRef, this.chatRoom);
      this.message = ''; // Clear message after submit
    }
  }

  isMyChat(chat: Chat): boolean {
    return this.chatUser === chat.user;
  }

  isMessageChat(chat: Chat): boolean {
    return chat.messageType === MessageType.MESSAGE;
  }

  isImageChat(chat: Chat): boolean {
    return chat.messageType === MessageType.IMAGE;
  }

  isFileChat(chat: Chat): boolean {
    return chat.messageType === MessageType.FILE;
  }

  private loadChatComponent(chatRoom: ChatRoom, previousChatRoom: ChatRoom = null): void {
    // Disconnect from previously connected chatroom/chatbox
    this.chatService.disconnectUser(this.chatUserRef, this.chatUser, previousChatRoom)
      .then(() => {
        // Connect to chatroom/chatbox
        this.chatService.connectUser(this.chatUser, chatRoom)
          .then(ref => {
            this.chatUserRef = ref;
            // Load data
            this.loadChats(chatRoom);
            this.loadChatUsers(chatRoom);
            if (chatRoom) {
              console.log('Chat loaded for chatroom ' + chatRoom.displayName);
            } else {
              console.log('Chat loaded for chatbox');
            }
          });
      });
  }

  private loadChats(chatRoom: ChatRoom): void {
    this.chatService.getChats(this.chatRoom).valueChanges()
      .subscribe(chats => {
        // Make sure it's a list of Chat objects and sort them to have the latest first
        this.chats = chats.map(chat => Chat.fromData(chat)).reverse();
        // Don't show notification for my own chats
        if (this.notifyNewChats && this.chats[0].user !== this.chatUser) {
          this.pushNotificationsService.create('New chat available').subscribe();
        }
      });
  }

  private loadChatUsers(chatRoom: ChatRoom): void {
    this.chatService.getChatUsers(this.chatRoom).valueChanges()
      .subscribe(chatUsers => {
        // Make sure it's a list of Chat objects and sort them alphabetically
        this.chatUsers = chatUsers.map(chatUser => ChatUser.fromData(chatUser)).sort((user1, user2) => user1.displayName < user2.displayName ? -1 : user1.displayName > user2.displayName ? 1 : 0);
        // Filter which users are typing (exluding current user)
        this.chatUsersTyping = this.chatUsers.filter(chatUser => chatUser.isTyping && chatUser.uuid !== this.chatUser.uuid).map(chatUser => chatUser.displayName);
        if (this.chatUsersTyping && this.chatUsersTyping.length > 0) {
          this.chatUsersTypingMessage = this.chatUsersTyping.join(',') + " is typing...";
        } else {
          this.chatUsersTypingMessage = null;
        }
      });
  }

  private getChatUser(user: firebase.User): ChatUser {
    let name = user.displayName ? user.displayName : user.email ? user.email : null;
    return new ChatUser(user.uid, name);
  }

}
