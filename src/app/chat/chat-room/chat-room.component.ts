import { Component, OnInit } from '@angular/core';

import { ChatRoom } from '../chat';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit {

  chatRooms: ChatRoom[];
  chatRoom: ChatRoom = null;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    // Only get active chatrooms
    this.chatService.getChatRooms(true).valueChanges()
      .subscribe(chatRooms => {
        this.chatRooms = chatRooms;
        if (this.chatRoom && !this.chatRooms.find(chatRoom => chatRoom.uuid === this.chatRoom.uuid)) {
          // Remove current chatroom when it's disconnected
          console.log('Chatroom ' + this.chatRoom.uuid + ' no longer active');
          this.chatRoom = null;
        }
      });
  }

  createChatRoom(): void {
    this.chatRoom = this.chatService.getChatRoom();
    console.log('Created chatroom ' + this.chatRoom.uuid);
  }

  joinChatRoom(chatRoom: ChatRoom): void {
    this.chatRoom = chatRoom;
    console.log('Joined chatroom ' + this.chatRoom.uuid);
  }

  isChatRoomJoined(chatRoom: ChatRoom): boolean {
    return this.chatRoom && this.chatRoom.uuid === chatRoom.uuid;
  }
}
