import { Injectable } from '@angular/core';
import { Character, Wallpaper, Decoration } from '../models/shop';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';

@Injectable({
  providedIn: 'root'
})
export class ShopService {

  charsCollection: AngularFirestoreCollection<Character>;
  charDoc: AngularFirestoreDocument<Character>;
  chars: Observable<Character[]>;
  wallsCollection: AngularFirestoreCollection<Wallpaper>;
  wallDoc: AngularFirestoreDocument<Wallpaper>;
  walls: Observable<Wallpaper[]>;
  decorsCollection: AngularFirestoreCollection<Decoration>;
  decorDoc: AngularFirestoreDocument<Decoration>;
  decors: Observable<Decoration[]>;

  constructor(
    private af: AngularFirestore,
    private storage: AngularFireStorage,
  ) {

  }

  searchChar(field, sort, keyword) {
    this.charsCollection = this.af.collection('character', ref => ref.orderBy(field, sort).startAt(keyword).endAt(keyword + '\uf8ff'));
    this.chars = this.charsCollection.valueChanges();
    return this.chars;
  }

  searchWall(field, sort, keyword) {
    this.charsCollection = this.af.collection('wallpaper', ref => ref.orderBy(field, sort).startAt(keyword).endAt(keyword + '\uf8ff'));
    this.chars = this.charsCollection.valueChanges();
    return this.chars;
  }

  searchDecor(field, sort, keyword) {
    this.charsCollection = this.af.collection('decoration', ref => ref.orderBy(field, sort).startAt(keyword).endAt(keyword + '\uf8ff'));
    this.chars = this.charsCollection.valueChanges();
    return this.chars;
  }

  orderByFieldChar(field, sort) {
    this.charsCollection = this.af.collection('character', ref => ref.orderBy(field, sort));
    this.chars = this.charsCollection.valueChanges();
    return this.chars;
  }

  orderByFieldWall(field, sort) {
    this.charsCollection = this.af.collection('wallpaper', ref => ref.orderBy(field, sort));
    this.chars = this.charsCollection.valueChanges();
    return this.chars;
  }

  orderByFieldDecor(field, sort) {
    this.charsCollection = this.af.collection('decoration', ref => ref.orderBy(field, sort));
    this.chars = this.charsCollection.valueChanges();
    return this.chars;
  }

  getChar(sort) {
    this.charsCollection = this.af.collection('character', ref => ref.orderBy('createdAt', sort));
    this.chars = this.charsCollection.valueChanges();
    return this.chars;
  }

  getWall(sort) {
    this.wallsCollection = this.af.collection('wallpaper', ref => ref.orderBy('createdAt', sort));
    this.walls = this.wallsCollection.valueChanges();
    return this.walls;
  }

  getDecor(sort) {
    this.decorsCollection = this.af.collection('decoration', ref => ref.orderBy('createdAt', sort));
    this.decors = this.decorsCollection.valueChanges();
    return this.decors;
  }

  addChar(char: Character) {
    this.charDoc = this.af.doc('character/' + char.id);
    return this.charDoc.set(char);
  }

  addWall(wall: Wallpaper) {
    this.wallDoc = this.af.doc('wallpaper/' + wall.id);
    return this.wallDoc.set(wall);
  }

  addDecor(decor: Decoration) {
    this.decorDoc = this.af.doc('decoration/' + decor.id);
    return this.decorDoc.set(decor);
  }

  updateChar(char: Character) {
    this.charDoc = this.af.doc('character/' + char.id);
    return this.charDoc.update(char);
  }

  updateWall(wall: Wallpaper) {
    this.wallDoc = this.af.doc('wallpaper/' + wall.id);
    return this.wallDoc.update(wall);
  }

  updateDecor(decor: Decoration) {
    this.decorDoc = this.af.doc('decoration/' + decor.id);
    return this.decorDoc.update(decor);
  }

  deleteChar(char: Character) {
    this.charDoc = this.af.doc('character/' + char.id);
    return this.charDoc.delete();
  }

  deleteWall(wall: Wallpaper) {
    this.wallDoc = this.af.doc('wallpaper/' + wall.id);
    return this.wallDoc.delete();
  }

  deleteDecor(decor: Decoration) {
    this.decorDoc = this.af.doc('decoration/' + decor.id);
    return this.decorDoc.delete();
  }

  deleteCharOnStorage(char: Character) {

    // Prepare the paths
    const OriPath = `character/${char.id}/ori`;
    const ImgPath = `character/${char.id}/img`;
    const ThumbPath = `character/${char.id}/thumb`;

    return this.storage.ref(OriPath).delete()
      .toPromise()
      .then(() => this.storage.ref(ImgPath).delete())
      .then(() => this.storage.ref(ThumbPath).delete())
      .then(() => this.deleteChar(char));
  }

  deleteWallOnStorage(wall: Wallpaper) {

    // Prepare the paths
    const ImgPath = `wallpaper/${wall.id}/img`;
    const ThumbPath = `wallpaper/${wall.id}/thumb`;

    return this.storage.ref(ImgPath).delete()
      .toPromise()
      .then(() => this.storage.ref(ThumbPath).delete())
      .then(() => this.deleteWall(wall));
  }

  deleteDecorOnStorage(decor: Decoration) {

    // Prepare the paths
    const ImgPath = `decoration/${decor.id}/img`;
    const ThumbPath = `decoration/${decor.id}/thumb`;

    return this.storage.ref(ImgPath).delete()
      .toPromise()
      .then(() => this.storage.ref(ThumbPath).delete())
      .then(() => this.deleteDecor(decor));
  }

  uploadCharImageTask(char: Character, FullImg: Blob, thumb: Blob, ori: File): AngularFireUploadTask {

    // Prepare the paths
    const OriPath = `character/${char.id}/ori`;
    const ImgPath = `character/${char.id}/img`;
    const ThumbPath = `character/${char.id}/thumb`;

    // Prepare the files
    const propertyBag: FilePropertyBag = {
      type: 'image/png'
    };
    const fileOri = new File([ori], 'ori', propertyBag);
    const fileImg = new File([FullImg], 'img', propertyBag);
    const fileThumb = new File([thumb], 'thumb', propertyBag);

    // Totally optional metadata
    const customMetadata = { app: 'Japan App Character' };

    const taskImg = this.storage.upload(ImgPath, fileImg, { customMetadata });
    const taskThumb = this.storage.upload(ThumbPath, fileThumb, { customMetadata });
    const taskOri = this.storage.upload(OriPath, fileOri, { customMetadata });

    return taskOri;
  }

  uploadWallImageTask(wall: Wallpaper, FullImg: Blob, thumb: Blob): AngularFireUploadTask {

    // Prepare the paths
    const ImgPath = `wallpaper/${wall.id}/img`;
    const ThumbPath = `wallpaper/${wall.id}/thumb`;

    // Prepare the files
    const propertyBag: FilePropertyBag = {
      type: 'image/png'
    };
    const fileImg = new File([FullImg], 'img', propertyBag);
    const fileThumb = new File([thumb], 'thumb', propertyBag);

    // Totally optional metadata
    const customMetadata = { app: 'Japan App Character' };

    const taskImg = this.storage.upload(ImgPath, fileImg, { customMetadata });
    const taskThumb = this.storage.upload(ThumbPath, fileThumb, { customMetadata });

    return taskImg;
  }

  uploadDecorImageTask(decor: Decoration, FullImg: Blob, thumb: Blob): AngularFireUploadTask {

    // Prepare the paths
    const ImgPath = `decoration/${decor.id}/img`;
    const ThumbPath = `decoration/${decor.id}/thumb`;

    // Prepare the files
    const propertyBag: FilePropertyBag = {
      type: 'image/png'
    };
    const fileImg = new File([FullImg], 'img', propertyBag);
    const fileThumb = new File([thumb], 'thumb', propertyBag);

    // Totally optional metadata
    const customMetadata = { app: 'Japan App Character' };

    const taskImg = this.storage.upload(ImgPath, fileImg, { customMetadata });
    const taskThumb = this.storage.upload(ThumbPath, fileThumb, { customMetadata });

    return taskImg;
  }

}
