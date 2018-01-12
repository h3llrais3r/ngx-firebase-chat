import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { ChatBoxComponent } from './chat/chat-box/chat-box.component';
import { ChatRoomComponent } from './chat/chat-room/chat-room.component';
import { ChatAdminComponent } from './chat/chat-admin/chat-admin.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'chatbox',
    component: ChatBoxComponent
  },
  {
    path: 'chatroom',
    component: ChatRoomComponent
  },
  {
    path: 'chatadmin',
    component: ChatAdminComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }