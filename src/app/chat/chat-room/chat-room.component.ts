import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

import { ChatRoom } from '../chat';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit {

  private CHATROOM_PREFIX = '#';

  chatRooms: ChatRoom[];
  chatRoom: ChatRoom;
  chatRoomRef: firebase.database.Reference;

  chatRoomName: string = null; // the chatroom name to start

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    // Only get active chatrooms
    this.chatService.getChatRooms(true).valueChanges()
      .subscribe(chatRooms => {
        // Since the AngularFireList does not actually returns of the typed objects, we need to cast them ourselves
        // See https://github.com/angular/angularfire2/issues/1299
        this.chatRooms = chatRooms.map(chatRoom => ChatRoom.fromData(chatRoom));
        // this.chatRooms = chatRooms;
        if (this.chatRoom && !this.chatRooms.find(chatRoom => chatRoom.uuid === this.chatRoom.uuid)) {
          // Remove current chatroom when it's disconnected
          console.log('Chatroom ' + this.chatRoom.displayName + ' no longer active');
          this.chatRoom = null;
        }
      });
  }

  startChatRoom(): void {
    console.log('Starting chatroom ' + this.getFullChatRoomName());
    this.chatService.startChatRoom(this.getFullChatRoomName())
      .then(chatRoomRef => {
        this.chatRoomRef = chatRoomRef;
        this.chatRoomRef.once('value')
          .then(snapshot => {
            this.chatRoom = <ChatRoom>snapshot.val();
            this.chatRoomName = null;
          });
      });
  }

  joinChatRoom(chatRoom: ChatRoom): void {
    console.log('Joining chatroom ' + chatRoom.displayName);
    this.chatService.getChatRoomByUuid(chatRoom.uuid)
      .then(chatRoomRef => {
        this.chatRoomRef = chatRoomRef;
        this.chatRoom = chatRoom;
      });
  }

  isChatRoomJoined(chatRoom: ChatRoom): boolean {
    return this.chatRoom && this.chatRoom.uuid === chatRoom.uuid;
  }

  private getFullChatRoomName(): string {
    if (this.chatRoomName) {
      return this.CHATROOM_PREFIX + this.chatRoomName;
    }
    return null;
  }

}
