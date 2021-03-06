import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { EmojiPickerModule } from 'ng-emoji-picker';
import { PushNotificationsModule } from 'ng-push';
import { Ng2Webstorage } from 'ngx-webstorage';
import { FileDropModule } from 'ngx-file-drop';

import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { ChatBoxComponent } from './chat/chat-box/chat-box.component';
import { ChatRoomComponent } from './chat/chat-room/chat-room.component';
import { ChatAdminComponent } from './chat/chat-admin/chat-admin.component';
import { AuthService } from './auth/auth.service';
import { ChatService } from './chat/chat.service';
import { StoreService } from './store/store.service';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent,
    ChatComponent,
    ChatBoxComponent,
    ChatRoomComponent,
    ChatAdminComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    AngularFireAuthModule,
    EmojiPickerModule,
    PushNotificationsModule,
    Ng2Webstorage,
    FileDropModule,
    AppRoutingModule,
    SharedModule
  ],
  providers: [
    AuthService,
    ChatService,
    StoreService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
