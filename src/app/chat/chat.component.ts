import { Component, OnInit, Input } from '@angular/core';
import { EmojiService } from 'ng-emoji-picker';
import { PushNotificationsService } from 'ng-push';

import { Chat } from './chat';
import { ChatRoom } from './chat-room';
import { ChatService } from './chat.service';
import { AuthService } from '../auth/auth.service';

declare var $; // declare jquery

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  @Input()
  chatRoom: ChatRoom;

  currentUser: any;
  chats: any[];
  message: string = '';

  openPopup: Function;

  constructor(private authService: AuthService,
    private chatService: ChatService,
    private emojiService: EmojiService,
    private pushNotificationsService: PushNotificationsService) {
    console.log('request permission');
    this.pushNotificationsService.requestPermission();
  }

  ngOnInit(): void {
    this.chatService.getChats(this.chatRoom).valueChanges()
      .subscribe(chats => {
        this.chats = chats.reverse();
        console.log(this.chats[0].user);
        // Don't show notification for own messages
        if (this.chats[0].user !== this.getChatUser()) {
          this.pushNotificationsService.create('New chat available', { body: 'Hurry up and read it! :-)' })
            .subscribe(
            res => console.log(res),
            err => console.log(err)
            );
        }
      });
    this.authService.getAuthState().subscribe(user => this.currentUser = user);
  }

  setPopupAction(fn: any): void {
    this.openPopup = fn;
  }

  focus(): void {
    // Focus on our own message input element
    // This is needed until https://github.com/lbertenasco/ng-emoji-picker/issues/12 is fixed
    // Then we can style the emoji-input input element by using a class
    console.log('focus');
    $('#message').focus();
  }

  emojify(): void {
    // Emojify our own message (needed because we are using our own input element)
    // This is needed until https://github.com/lbertenasco/ng-emoji-picker/issues/12 is fixed
    // Then we can style the emoji-input input element by using a class and we don't need our own input element anymore
    this.message = this.emojiService.emojify(this.message);
  }

  submitChat(event: any): void {
    // Only submit real message (don't submit empty ones)
    if (this.message) {
      let chat = new Chat(this.getChatUser(), new Date(), this.message);
      console.log('Submitting chat message');
      console.log(chat);
      this.chatService.submitChat(chat, this.chatRoom);
      this.message = '';
    }
  }

  isMyChat(chat: Chat): boolean {
    return this.getChatUser() === chat.user;
  }

  private getChatUser(): string {
    return this.currentUser.displayName ? this.currentUser.displayName : this.currentUser.email ? this.currentUser.email : this.currentUser.uid;
  }

}
