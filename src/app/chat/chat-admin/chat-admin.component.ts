import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase/app';

import { ChatRoom, Chat } from '../chat';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat-admin',
  templateUrl: './chat-admin.component.html',
  styleUrls: ['./chat-admin.component.css']
})
export class ChatAdminComponent implements OnInit {

  chatRooms: ChatRoom[];
  chatRoom: ChatRoom;
  chatRoomRef: firebase.database.Reference;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    // Only get active chatrooms
    this.chatService.getChatRooms().valueChanges()
      .subscribe(chatRooms => {
        // Since the AngularFireList does not actually returns of the typed objects, we need to cast them ourselves
        // See https://github.com/angular/angularfire2/issues/1299
        this.chatRooms = chatRooms.map(chatRoom => ChatRoom.fromData(chatRoom));
        // this.chatRooms = chatRooms;
        if (this.chatRoom && !this.chatRooms.find(chatRoom => chatRoom.uuid === this.chatRoom.uuid)) {
          // Remove current chatroom when it's disconnected
          console.log('Chatroom ' + this.chatRoom.uuid + ' no longer active');
          this.chatRoom = null;
        }
      });
  }

  joinChatRoom(chatRoom: ChatRoom): void {
    console.log('Joining chatroom ' + chatRoom.displayName);
    this.chatService.getChatRoomByUuid(chatRoom.uuid)
      .then(chatRoomRef => {
        this.chatRoomRef = chatRoomRef;
        this.chatRoom = chatRoom;
        console.debug(chatRoomRef);
        console.debug(chatRoom);
      });
  }

  isChatRoomJoined(chatRoom: ChatRoom): boolean {
    return this.chatRoom && this.chatRoom.uuid === chatRoom.uuid;
  }

}
