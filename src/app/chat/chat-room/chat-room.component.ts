import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';

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
  newChatRoomName: string = null;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    // Only get active chatrooms
    this.chatService.getChatRooms(true).valueChanges()
      .subscribe(chatRooms => {
        // Since the AngularFireList does not actually returns of the typed objects, we need to cast them ourselves
        // See https://github.com/angular/angularfire2/issues/1299
        this.chatRooms = chatRooms.map(chatRoom => ChatRoom.fromData(chatRoom));
        // this.chatRooms = chatRooms;
        console.log(this.chatRooms);
        if (this.chatRoom && !this.chatRooms.find(chatRoom => chatRoom.uuid === this.chatRoom.uuid)) {
          // Remove current chatroom when it's disconnected
          console.log('Chatroom ' + this.chatRoom.displayName + ' no longer active');
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

  createNewChatRoom(): void {
    this.chatService.createNewChatRoom(this.getNewChatRoomName())
      .then(ref => {
        console.log(ref);
        this.chatRoomRef = ref;
        this.chatRoomRef.once('value')
          .then(snapshot => {
            this.chatRoom = <ChatRoom>snapshot.val();
            console.log(this.chatRoom);
            this.newChatRoomName = null;
          });
      });
  }

  joinChatRoom(chatRoom: ChatRoom): void {
    this.chatRoom = chatRoom;
    console.log('Joining chatroom ' + this.chatRoom.displayName);
  }

  isChatRoomJoined(chatRoom: ChatRoom): boolean {
    return this.chatRoom && this.chatRoom.uuid === chatRoom.uuid;
  }

  private getNewChatRoomName(): string {
    if (this.newChatRoomName) {
      return this.CHATROOM_PREFIX + this.newChatRoomName;
    }
    return null;
  }

}
