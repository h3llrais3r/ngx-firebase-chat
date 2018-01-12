import { Component, OnInit } from '@angular/core';

import { ChatRoom } from '../chat';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat-admin',
  templateUrl: './chat-admin.component.html',
  styleUrls: ['./chat-admin.component.css']
})
export class ChatAdminComponent implements OnInit {

  chatRoomGuids: string[];
  chatRoom: ChatRoom;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.chatService.getChatRooms().valueChanges()
      .subscribe(chatRoomGuids => {
        this.chatRoomGuids = chatRoomGuids;
      });
  }

  isChatRoomSelected(chatRoomGuid: string): boolean {
    return this.chatRoom && this.chatRoom.guid === chatRoomGuid;
  }

  showChatRoom(chatRoomGuid:string): void {
    this.chatRoom = new ChatRoom(chatRoomGuid);
  }

}
