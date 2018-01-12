import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email: string;
  password: string;

  error: string;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void { }

  login(): void {
    if (this.email && this.password) {
      this.authService.loginWithEmailAndPassword(this.email, this.password)
        .then(res => {
          this.router.navigateByUrl('/home');
        })
        .catch(err => {
          console.error(err);
          this.error = 'Unable to login!';
        });
    } else {
      this.error = 'Please provide all mandatory fields!';
    }
  }

  loginWithFacebook(): void {
    this.authService.loginWithFacebook()
      .then(res => {
        this.router.navigateByUrl('/home');
      })
      .catch(err => {
        console.error(err);
        this.error = 'Unable to login with Facebook!';
      });
  }

  loginWithTwitter(): void {
    this.authService.loginWithTwitter()
      .then(res => {
        this.router.navigateByUrl('/home');
      })
      .catch(err => {
        console.error(err);
        this.error = 'Unable to login with Twitter!';
      });
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle()
      .then(res => {
        this.router.navigateByUrl('/home');
      })
      .catch(err => {
        console.error(err);
        this.error = 'Unable to login with Google!';
      });
  }

  loginWithGithub(): void {
    this.authService.loginWithGithub()
      .then(res => {
        this.router.navigateByUrl('/home');
      })
      .catch(err => {
        console.error(err);
        this.error = 'Unable to login with Facebook!';
      });
  }

  loginAnonymously(): void {
    this.authService.loginAnonymously()
      .then(res => {
        this.router.navigateByUrl('/home');
      })
      .catch(err => {
        console.error(err);
        this.error = 'Unable to login anonymously!';
      });
  }

  cancel(): void {
    this.email = null;
    this.password = null;
  }

}
