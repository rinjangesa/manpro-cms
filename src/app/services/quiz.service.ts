import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';
import { Observable } from 'rxjs';
import { PhraseCategory, Kanji } from '../models/quiz';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  anyCol: AngularFirestoreCollection<any>;
  anyDoc: AngularFirestoreDocument<any>;
  anyObsv: Observable<any[]>;

  counted = [];

  constructor(
    private af: AngularFirestore,
    private storage: AngularFireStorage,
  ) { }

  getItem(collection, order, sort) {
    this.anyCol = this.af.collection(collection, ref => ref.orderBy(order, sort));
    this.anyObsv = this.anyCol.valueChanges();
    return this.anyObsv;
  }

  getItemWithCondition(collection, order, sort, field, where) {
    this.anyCol = this.af.collection(collection, ref => ref.orderBy(order, sort).where(field, '==', where));
    this.anyObsv = this.anyCol.valueChanges();
    return this.anyObsv;
  }

  addItem(collection, item) {
    this.anyDoc = this.af.doc(collection + '/' + item.id);
    return this.anyDoc.set(item);
  }

  UpdateItem(collection, item) {
    this.anyDoc = this.af.doc(collection + '/' + item.id);
    return this.anyDoc.update(item);
  }

  deleteItem(collection, item) {
    this.anyDoc = this.af.doc(collection + '/' + item.id);
    return this.anyDoc.delete();
  }

  addFileToStorage(item, path, file, fileType, fileName) {

    path = `${path}/${item.id}/${fileName}`;

    const propertyBag: FilePropertyBag = {
      type: fileType
    };

    file = new File([file], '', propertyBag);

    const task = this.storage.upload(path, file);

    return task;
  }

  getCountAllItems() {

    const N5 = this.af.collection('kanji', ref => ref.where('grade', '==', 'N5')).valueChanges().subscribe(data => {
      this.counted['kanjin5'] = data.length;
      const arr: Kanji[] = data;
      for (const value of arr) {
        this.af.collection('kanji_quiz', ref => ref.where('kanji', '==', value.kanji)).valueChanges().subscribe(subdata => {
          this.counted[value.kanji] = subdata.length;
        });
      }
    });
    const N4 = this.af.collection('kanji', ref => ref.where('grade', '==', 'N4')).valueChanges().subscribe(data => {
      this.counted['kanjin4'] = data.length;
      const arr: Kanji[] = data;
      for (const value of arr) {
        this.af.collection('kanji_quiz', ref => ref.where('kanji', '==', value.kanji)).valueChanges().subscribe(subdata => {
          this.counted[value.kanji] = subdata.length;
        });
      }
    });
    const N3 = this.af.collection('kanji', ref => ref.where('grade', '==', 'N3')).valueChanges().subscribe(data => {
      this.counted['kanjin3'] = data.length;
      const arr: Kanji[] = data;
      for (const value of arr) {
        this.af.collection('kanji_quiz', ref => ref.where('kanji', '==', value.kanji)).valueChanges().subscribe(subdata => {
          this.counted[value.kanji] = subdata.length;
        });
      }
    });
    const N2 = this.af.collection('kanji', ref => ref.where('grade', '==', 'N2')).valueChanges().subscribe(data => {
      this.counted['kanjin2'] = data.length;
      const arr: Kanji[] = data;
      for (const value of arr) {
        this.af.collection('kanji_quiz', ref => ref.where('kanji', '==', value.kanji)).valueChanges().subscribe(subdata => {
          this.counted[value.kanji] = subdata.length;
        });
      }
    });
    const N1 = this.af.collection('kanji', ref => ref.where('grade', '==', 'N1')).valueChanges().subscribe(data => {
      this.counted['kanjin1'] = data.length;
      const arr: Kanji[] = data;
      for (const value of arr) {
        this.af.collection('kanji_quiz', ref => ref.where('kanji', '==', value.kanji)).valueChanges().subscribe(subdata => {
          this.counted[value.kanji] = subdata.length;
        });
      }
    });

    this.af.collection('phrase_category').valueChanges().subscribe(data => {
      const arr: PhraseCategory[] = data;
      for (const value of arr) {
        this.af.collection('phrase', ref => ref.where('category', '==', value.english)).valueChanges().subscribe(subdata => {
          this.counted[value.english] = subdata.length;
        });
      }
    });

    this.af.collection('phrase_category').valueChanges().subscribe(data => {
      const arr: PhraseCategory[] = data;
      for (const value of arr) {
        this.af.collection('phrase_quiz', ref => ref.where('category', '==', value.english)).valueChanges().subscribe(subdata => {
          this.counted[value.english + 'quiz'] = subdata.length;
        });
      }
    });

    const Basic = this.af.collection('grammar', ref => ref.where('tier', '==', 'basic')).valueChanges().subscribe(data => {
      this.counted['basic'] = data.length;
    });
    // tslint:disable-next-line:max-line-length
    const Intermediate = this.af.collection('grammar', ref => ref.where('tier', '==', 'intermediate')).valueChanges().subscribe(data => {
      this.counted['intermediate'] = data.length;
    });
    const Expert = this.af.collection('grammar', ref => ref.where('tier', '==', 'expert')).valueChanges().subscribe(data => {
      this.counted['expert'] = data.length;
    });
    const Master = this.af.collection('grammar', ref => ref.where('tier', '==', 'master')).valueChanges().subscribe(data => {
      this.counted['master'] = data.length;
    });

    const Basic2 = this.af.collection('grammar_quiz', ref => ref.where('tier', '==', 'basic')).valueChanges().subscribe(data => {
      this.counted['basicquiz'] = data.length;
    });
    // tslint:disable-next-line:max-line-length
    const Intermediate2 = this.af.collection('grammar_quiz', ref => ref.where('tier', '==', 'intermediate')).valueChanges().subscribe(data => {
      this.counted['intermediatequiz'] = data.length;
    });
    const Expert2 = this.af.collection('grammar_quiz', ref => ref.where('tier', '==', 'expert')).valueChanges().subscribe(data => {
      this.counted['expertquiz'] = data.length;
    });
    const Master2 = this.af.collection('grammar_quiz', ref => ref.where('tier', '==', 'master')).valueChanges().subscribe(data => {
      this.counted['masterquiz'] = data.length;
    });

    return this.counted;
  }

}
