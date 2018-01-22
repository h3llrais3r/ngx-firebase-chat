import { Component, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { EmojiService } from 'ng-emoji-picker';
import { PushNotificationsService } from 'ng-push';

import { Chat, ChatRoom } from './chat';
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

  currentUser: any;
  chats: any[];
  message: string = '';
  notifyNewChats: boolean = false;

  openPopup: Function;

  constructor(private authService: AuthService,
    private chatService: ChatService,
    private emojiService: EmojiService,
    private pushNotificationsService: PushNotificationsService) {
    this.pushNotificationsService.requestPermission();
  }

  ngOnInit(): void {
    this.loadChats(this.chatRoom);
    this.authService.getAuthState().subscribe(user => this.currentUser = user);
  }

  ngAfterViewInit(): void {
    $('#notifyNewChats').bootstrapToggle();
    $('#notifyNewChats').change((event) => {
      this.notifyNewChats = event.target.checked;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Only handle changes for chatRoom (for now only chatRoom is monitored)
    let chatRoomChanges: SimpleChange = changes.chatRoom;
    if (chatRoomChanges) {
      // Only reload when currentValue != previousValue (on firstChange previousValue is undefined so skip that also)
      if (!chatRoomChanges.firstChange && chatRoomChanges.currentValue !== chatRoomChanges.previousValue) {
        this.loadChats(this.chatRoom);
      }
    }
  }

  setPopupAction(fn: any): void {
    this.openPopup = fn;
  }

  onModelChange(): void {
    console.log('model changed');
  }

  submitChat(event: any): void {
    // Only submit real message (don't submit empty ones)
    if (this.message) {
      let chat = new Chat(this.getChatUser(), new Date(), this.message);
      this.chatService.submitChat(chat, this.chatRoom);
      this.message = ''; // Clear message after submit
    }
  }

  isMyChat(chat: Chat): boolean {
    return this.getChatUser() === chat.user;
  }

  private loadChats(chatRoom: ChatRoom): void {
    this.chatService.getChats(this.chatRoom).valueChanges()
      .subscribe(chats => {
        this.chats = chats.reverse();
        // Don't show notification for my own chats
        if (this.notifyNewChats && this.chats[0].user !== this.getChatUser()) {
          this.pushNotificationsService.create('New chat available').subscribe();
        }
      });
  }

  private getChatUser(): string {
    return this.currentUser.displayName ? this.currentUser.displayName : this.currentUser.email ? this.currentUser.email : this.currentUser.uid;
  }

}
