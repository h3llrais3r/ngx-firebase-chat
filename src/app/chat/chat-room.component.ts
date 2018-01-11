import { Component, OnInit } from '@angular/core';

import { ChatService } from './chat.service';
import { ChatRoom } from './chat-room';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit {

  chatRoom: ChatRoom = null;

  constructor(private chatService: ChatService) {
    this.chatRoom = this.chatService.createChatRoom();
    console.log('Created chatroom ' + this.chatRoom.guid);
  }

  ngOnInit(): void { }

}
