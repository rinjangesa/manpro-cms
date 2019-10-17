import { Injectable } from '@angular/core';
import {
    AngularFirestore,
    AngularFirestoreCollection,
    AngularFirestoreDocument
} from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    usersCollection: AngularFirestoreCollection<User>;
    userDoc: AngularFirestoreDocument<User>;
    users: Observable<User[]>;

    constructor(public afAuth: AngularFireAuth,
        public afs: AngularFirestore) {

    }

    // firestore
    getItems() {
        this.usersCollection = this.afs.collection('user', ref => ref.orderBy('joindate', 'desc'));
        this.users = this.usersCollection.valueChanges();
        return this.users;
    }

    addUser(user: User) {
        const uid = this.getCurrentUser().uid;
        user.uid = uid;
        const score = {
            id: uid,
            lastkanji: 0,
            bestkanji: 0,
            lastphrases: 0,
            bestphrases: 0,
            lastgrammar: 0,
            bestgrammar: 0
        };
        const char = {
            id: 'default',
            img: user.usechar
        };
        const wall = {
            id: 'default',
            img: user.usewall
        };
        const decor = {
            id: 'default',
            img: user.usedecor
        };
        this.afs.collection('score').doc(uid).set(score);
        this.afs.collection('user').doc(uid).collection('char').doc('default').set(char);
        this.afs.collection('user').doc(uid).collection('wall').doc('default').set(wall);
        this.afs.collection('user').doc(uid).collection('decor').doc('default').set(decor);
        return this.afs.collection('user').doc(uid).set(user);
    }

    updateUser(user: User) {
        return this.afs.collection('user').doc(user.uid).update(user);
    }

    deleteUser(user: User) {
        this.afs.collection('score').doc(user.uid).delete();
        return this.afs.collection('user').doc(user.uid).delete();
    }

    getCurrentUser() {
        return this.afAuth.auth.currentUser;
    }

    signInAuth(user) {
        const email = user.email;
        const pass = user.password;
        return this.afAuth.auth.signInWithEmailAndPassword(email, pass).catch(error => console.log(error));
    }

    signOutAuth() {
        return this.afAuth.auth.signOut();
    }

    addUserAuth(user: User) {
        const email = user.email;
        const password = user.password;
        return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
    }

    updateUserAuth(newEmail: string) {
        return this.afAuth.auth.currentUser.updateEmail(newEmail);
    }

    deleteUserAuth() {
        return this.afAuth.auth.currentUser.delete();
    }

}
