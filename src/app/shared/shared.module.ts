import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';

import { DateFormatPipe } from './pipe/date-format.pipe';
import { DateTimeFormatPipe } from './pipe/date-time-format.pipe';
import { StringFormat } from './util/string-format';

import localeNlBe from '@angular/common/locales/nl-BE';
registerLocaleData(localeNlBe);

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DateFormatPipe,
    DateTimeFormatPipe
  ],
  providers: [
    StringFormat
  ]
})
export class SharedModule { }
