import { Injectable } from '@angular/core';
import { SessionStorageService } from 'ngx-webstorage';
import { ChatRoom } from '../chat/chat';

@Injectable()
export class StoreService {

  private CHATROOM_UUID = 'CHATROOM_UUID';

  constructor(private sessionStorageService: SessionStorageService) { }

  get chatRoomUuid(): string {
    return this.sessionStorageService.retrieve(this.CHATROOM_UUID);
  }

  set chatRoomUuid(chatRoomUuid: string) {
    this.sessionStorageService.store(this.CHATROOM_UUID, chatRoomUuid);
  }

}
