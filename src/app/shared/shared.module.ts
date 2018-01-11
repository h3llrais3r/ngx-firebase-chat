import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';

import { DateFormatPipe } from './pipe/date-format.pipe';
import { DateTimeFormatPipe } from './pipe/date-time-format.pipe';

import localeNlBe from '@angular/common/locales/nl-BE';
registerLocaleData(localeNlBe);

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DateFormatPipe,
    DateTimeFormatPipe
  ]
})
export class SharedModule { }
