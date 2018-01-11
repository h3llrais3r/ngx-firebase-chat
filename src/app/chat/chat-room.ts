import { Guid } from '../shared/util/guid';

export class ChatRoom {
  guid: Guid;

  constructor(guid: Guid) {
    this.guid = guid;
  }
}