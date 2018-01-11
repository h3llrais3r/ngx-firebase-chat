import { Component, OnInit } from '@angular/core';

import { ChatService } from '../chat/chat.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  chatRooms: any[];

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.chatService.getChatRooms().valueChanges()
      .subscribe(chatRooms => {
        this.chatRooms = chatRooms;
        console.log(this.chatRooms);
      });
  }

}
