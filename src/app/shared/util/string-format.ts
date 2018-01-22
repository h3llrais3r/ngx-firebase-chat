import { Injectable } from '@angular/core';

@Injectable()
export class StringFormat {

  public static format(value: string, ...args: string[]): string {
    return value.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  }
}
