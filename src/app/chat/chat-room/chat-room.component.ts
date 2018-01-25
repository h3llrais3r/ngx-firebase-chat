import { Component, OnInit } from '@angular/core';

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
  newChatRoomName: string = null;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    // Only get active chatrooms
    this.chatService.getChatRooms(true).valueChanges()
      .subscribe(chatRooms => {
        this.chatRooms = chatRooms;
        if (this.chatRoom && !this.chatRooms.find(chatRoom => chatRoom.uuid === this.chatRoom.uuid)) {
          // Remove current chatroom when it's disconnected
          console.log('Chatroom ' + this.getChatRoomDisplayName(this.chatRoom) + ' no longer active');
          this.chatRoom = null;
        }
      });
  }

  createChatRoom(): void {
    console.log('Creating chatroom ' + this.getNewChatRoomName());
    // check if the chatroom already exists, create a new one otherwise
    this.chatService.getChatRoom(this.getNewChatRoomName())
      .then(chatRoom => {
        if (chatRoom) {
          console.log('Chatroom ' + this.getNewChatRoomName() + ' already exists, retrieving it...')
          this.chatRoom = chatRoom;
          this.newChatRoomName = null;
        } else {
          console.log('Chatroom ' + this.getNewChatRoomName() + ' does not exist, creating it...');
          this.chatService.createChatRoom(this.getNewChatRoomName())
            .then(chatRoom => {
              this.chatRoom = chatRoom;
              this.newChatRoomName = null;
            });
        }
      });
  }

  joinChatRoom(chatRoom: ChatRoom): void {
    this.chatRoom = chatRoom;
    console.log('Joining chatroom ' + this.getChatRoomDisplayName(this.chatRoom));
  }

  isChatRoomJoined(chatRoom: ChatRoom): boolean {
    return this.chatRoom && this.chatRoom.uuid === chatRoom.uuid;
  }

  getChatRoomDisplayName(chatRoom: ChatRoom): string {
    return chatRoom ? chatRoom.displayName ? chatRoom.displayName : chatRoom.uuid : '';
  }

  private getNewChatRoomName(): string {
    if (this.newChatRoomName) {
      return this.CHATROOM_PREFIX + this.newChatRoomName;
    }
    return null;
  }

}
