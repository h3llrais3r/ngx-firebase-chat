import { Component, OnInit } from '@angular/core';

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

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    // Only get active chatrooms
    this.chatService.getChatRooms(true).valueChanges()
      .subscribe(chatRooms => {
        this.chatRooms = chatRooms;
        if (this.chatRoom && !this.chatRooms.includes(this.chatRoom)) {
          // Remove current chatroom when it's disconnected
          console.log('Chatroom ' + this.chatRoom.uuid + ' no longer active');
          this.chatRoom = null;
        }
      });
  }

  isChatRoomSelected(chatRoom: ChatRoom): boolean {
    return this.chatRoom && this.chatRoom == chatRoom;
  }

  showChatRoom(chatRoom: ChatRoom): void {
    this.chatRoom = chatRoom;
  }

}
