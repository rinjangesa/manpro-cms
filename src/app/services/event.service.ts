import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Event } from '../models/event';
import { AngularFireStorage } from 'angularfire2/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  eventsCollection: AngularFirestoreCollection<Event>;
  eventDoc: AngularFirestoreDocument<Event>;
  events: Observable<Event[]>;

  constructor(
    private af: AngularFirestore,
    private storage: AngularFireStorage
  ) { }

  // firestore
  getItems() {
    this.eventsCollection = this.af.collection('event', ref => ref.orderBy('startdate', 'desc'));
    this.events = this.eventsCollection.valueChanges();
    return this.events;
  }

  addEvent(event: Event) {
    return this.af.collection('event').doc(event.id).set(event);
  }

  updateEvent(event: Event) {
    return this.af.collection('event').doc(event.id).update(event);
  }

  deleteEvent(event: Event) {
    return this.af.collection('event').doc(event.id).delete();
  }

  uploadImage(event: Event, image) {

    const path = `event/${event.id}/image`;

    const propertyBag: FilePropertyBag = {
      type: 'image/png'
    };

    const file = new File([image], '', propertyBag);

    return this.storage.upload(path, file);
  }

  getDownloadURL(event: Event): string {

    let urls: string;

    this.storage.ref(`event/${event.id}/image`).getDownloadURL().subscribe(url => {
      urls = url;
    });

    return urls;
  }

  deleteImage(event: Event) {
    return this.storage.ref(`event/${event.id}/image`).delete();
  }

}
