import { Component, OnInit } from '@angular/core';

import { ChatRoom } from '../chat';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit {

  chatRoom: ChatRoom = null;

  constructor(private chatService: ChatService) {
    this.chatRoom = this.chatService.getChatRoom();
    console.log('Opening chatroom ' + this.chatRoom.uuid);
  }

  ngOnInit(): void { }

}
