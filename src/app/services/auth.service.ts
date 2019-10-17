import { Injectable } from '@angular/core';
import { auth } from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: Observable<User>;
  currentUser: User;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {

    //// Get auth data, then get firestore user document || null
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`user/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      }));

  }

  signOut() {
    return this.afAuth.auth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

  signIn(email, password) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
    // .then((firebaseUser) => this.consolelogging(firebaseUser))
    // .then(() => this.router.navigate(['/home']))
    // .catch(error => [console.log(error), console.log(error.message)]);
  }

  updating(user) {
    // console.log(user.user.uid);
    // console.log(user.user.displayName);
    // console.log(user.user.email);
    // console.log(user.additionalUserInfo.providerId);

    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`user/${user.user.uid}`);

    const data: User = {
      uid: user.user.uid,
      email: user.user.email,
      lastseen: new Date()
    };

    userRef.update(data);

  }

  redirectHome() {
    this.router.navigateByUrl('/home');
  }

}
