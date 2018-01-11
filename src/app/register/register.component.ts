import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  name: string;
  email: string;
  password: string;

  error: string;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void { }

  register(): void {
    if (this.name && this.email && this.password) {
      this.authService.register(this.email, this.password)
        .then(res => {
          console.log('updating profile');
          this.authService.updateProfile(this.name)
            .then(res => {
              console.log('profile updated');
              this.router.navigateByUrl('/chat');
            })
            .catch(err => {
              console.error(err);
              this.error = 'Unable to update profile!';
            });
        })
        .catch(err => {
          console.error(err);
          this.error = 'Unable to register!';
        });
    } else {
      this.error = 'Please provide all mandatory fields!'
    }
  }

  cancel(): void {
    this.name = null;
    this.email = null;
    this.password = null;
  }

}
