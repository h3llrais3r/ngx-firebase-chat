import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthService {

  constructor(private afAuth: AngularFireAuth) { }

  getAuthState(): Observable<firebase.User> {
    return this.afAuth.authState;
  }

  register(email: string, password: string): Promise<any> {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  updateProfile(name: string): Promise<any> {
    return this.afAuth.auth.currentUser.updateProfile({
      displayName: name,
      photoURL: null
    });
  }

  loginWithEmailAndPassword(email: string, password: string): Promise<any> {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  loginWithFacebook(): Promise<any> {
    return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
  }

  loginWithTwitter(): Promise<any> {
    return this.afAuth.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider());
  }

  loginWithGithub(): Promise<any> {
    return this.afAuth.auth.signInWithPopup(new firebase.auth.GithubAuthProvider());
  }

  loginWithGoogle(): Promise<any> {
    return this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  loginAnonymously(): Promise<any> {
    return this.afAuth.auth.signInAnonymously();
  }

  logOut(): Promise<any> {
    return this.afAuth.auth.signOut();
  }

}
