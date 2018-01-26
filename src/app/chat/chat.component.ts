import { Component, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { EmojiService } from 'ng-emoji-picker';
import { PushNotificationsService } from 'ng-push';
import * as firebase from 'firebase/app';

import { Chat, ChatRoom, ChatUser } from './chat';
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
  chatRoomRef: firebase.database.Reference;

  chatUser: ChatUser;
  chatUserRef: firebase.database.Reference;

  chats: any[];
  chatUsers: ChatUser[];
  chatUsersTyping: string[];
  chatUsersTypingMessage: string;

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
      // Only reload when currentValue != previousValue (on firstChange previousValue is undefined so skip that also)
      if (!chatRoomChange.firstChange && chatRoomChange.currentValue !== chatRoomChange.previousValue) {
        console.log('Chatroom changed to ' + this.chatRoom.displayName);
        this.loadChatComponent(this.chatRoom);
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

  submitChat(event: any): void {
    // Only submit real message (don't submit empty ones)
    if (this.message) {
      let chat = new Chat(this.chatUser, new Date(), this.message);
      this.chatService.submitChat(chat, this.chatUserRef, this.chatRoom);
      this.message = ''; // Clear message after submit
    }
  }

  isMyChat(chat: Chat): boolean {
    return this.chatUser === chat.user;
  }

  private loadChatComponent(chatRoom: ChatRoom): void {
    this.chatUserRef = this.chatService.registerUser(this.chatUser, this.chatRoom);
    this.loadChats(chatRoom);
    this.loadChatUsers(chatRoom);
  }

  private loadChats(chatRoom: ChatRoom): void {
    this.chatService.getChats(this.chatRoom).valueChanges()
      .subscribe(chats => {
        this.chats = chats.reverse();
        // Don't show notification for my own chats
        if (this.notifyNewChats && this.chats[0].user !== this.chatUser) {
          this.pushNotificationsService.create('New chat available').subscribe();
        }
      });
  }

  private loadChatUsers(chatRoom: ChatRoom): void {
    this.chatService.getChatUsers(this.chatRoom).valueChanges()
      .subscribe(chatUsers => {
        this.chatUsers = chatUsers.sort((user1, user2) => user1.displayName < user2.displayName ? -1 : user1.displayName > user2.displayName ? 1 : 0);
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
