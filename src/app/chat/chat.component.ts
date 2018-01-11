import { Component, OnInit } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { ChatService } from './chat.service';
import { Chat } from './chat';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  currentUser: any;
  chatMessages: any[];
  message: string;

  constructor(private authService: AuthService, private chatService: ChatService) { }

  ngOnInit(): void {
    this.chatService.getChats().valueChanges().subscribe(chats => this.chatMessages = chats);
    this.authService.getAuthState().subscribe(user => this.currentUser = user);
  }

  submitChat(): void {
    let chat = new Chat(this.getChatUser(), new Date(), this.message);
    console.log('Submitting chat message');
    console.log(chat);
    this.chatService.submitChat(chat);
    this.message = null;
  }

  isMyChat(chat: Chat) {
    return this.getChatUser() === chat.user;
  }

  private getChatUser(): string {
    return this.currentUser.displayName ? this.currentUser.displayName : this.currentUser.email ? this.currentUser.email : this.currentUser.uid;
  }

}
