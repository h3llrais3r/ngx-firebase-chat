import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Chat } from './chat';


@Injectable()
export class ChatService {

  constructor(private db: AngularFireDatabase) { }

  getChats(): AngularFireList<Chat> {
    return this.db.list('/chats');
  }

  submitChat(chat: Chat): void {
    this.db.list('/chats').push(chat);
  }

}