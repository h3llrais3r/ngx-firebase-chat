import { Component, OnInit } from '@angular/core';

import { ChatRoom } from '../chat';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat-admin',
  templateUrl: './chat-admin.component.html',
  styleUrls: ['./chat-admin.component.css']
})
export class ChatAdminComponent implements OnInit {

  chatRoomUuids: string[];
  chatRoom: ChatRoom;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.chatService.getChatRooms().valueChanges()
      .subscribe(chatRoomUuids => {
        this.chatRoomUuids = chatRoomUuids;
      });
  }

  isChatRoomSelected(chatRoomUuid: string): boolean {
    return this.chatRoom && this.chatRoom.uuid === chatRoomUuid;
  }

  showChatRoom(chatRoomUuid:string): void {
    this.chatRoom = new ChatRoom(chatRoomUuid);
  }

}
