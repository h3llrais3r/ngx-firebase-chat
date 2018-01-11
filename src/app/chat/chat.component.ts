import { Component, OnInit } from '@angular/core';
import { EmojiService } from 'ng-emoji-picker';

import { AuthService } from '../auth/auth.service';
import { ChatService } from './chat.service';
import { Chat } from './chat';

declare var $; // declare jquery

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  currentUser: any;
  chats: any[];
  message: string = '';

  openPopup: Function;

  constructor(private authService: AuthService,
    private chatService: ChatService,
    private emojiService: EmojiService) { }

  ngOnInit(): void {
    this.chatService.getChats().valueChanges().subscribe(chats => this.chats = chats.reverse());
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

  submitChat(): void {
    let chat = new Chat(this.getChatUser(), new Date(), this.message);
    console.log('Submitting chat message');
    console.log(chat);
    this.chatService.submitChat(chat);
    this.message = '';
  }

  isMyChat(chat: Chat): boolean {
    return this.getChatUser() === chat.user;
  }

  private getChatUser(): string {
    return this.currentUser.displayName ? this.currentUser.displayName : this.currentUser.email ? this.currentUser.email : this.currentUser.uid;
  }

}
