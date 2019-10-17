import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../../services/quiz.service';
import { Kanji, Phrase, Grammar, PhraseCategory } from '../../../models/quiz';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from '@firebase/util';
import { AngularFireUploadTask, AngularFireStorage } from 'angularfire2/storage';

@Component({
  selector: 'app-kanji',
  templateUrl: './kanji.component.html',
  styleUrls: ['./kanji.component.scss']
})
export class KanjiComponent implements OnInit {

  // Form
  selectedKanjiList = 'N5';
  kanjiForm: FormGroup;

  // Upload Status
  upload = false;
  uploaded = false;
  snapshot: Observable<any>;

  // Data
  kanjis: Kanji[];
  kanji: Kanji;
  dataCounted;

  // State
  fileKanjiAnimation: File;
  lottieConfig: any;
  anim: any;
  errorInput: string;
  errorPreview: string;
  errorPreviewState = false;
  animJson: string;
  imageChangedEvent: any = '';
  croppedImage: any = '';

  constructor(
    private fb: FormBuilder,
    private quizService: QuizService,
    private af: AngularFirestore,
    private storage: AngularFireStorage
  ) {
    this.prepareForm();
    this.getItems();
    this.dataCounted = this.quizService.getCountAllItems();
  }

  ngOnInit() {
  }

  get kanjiName() { return this.kanjiForm.get('kanjiName'); }
  get kanjiOnyomi() { return this.kanjiForm.get('kanjiOnyomi'); }
  get kanjiKunyomi() { return this.kanjiForm.get('kanjiKunyomi'); }
  get kanjiAnimation() { return this.kanjiForm.get('kanjiAnimation'); }
  get kanjiStroke() { return this.kanjiForm.get('kanjiStroke'); }
  get kanjiIndo() { return this.kanjiForm.get('kanjiIndo'); }
  get kanjiEng() { return this.kanjiForm.get('kanjiEng'); }
  get kanjiExample() { return this.kanjiForm.get('kanjiExample'); }

  // Form function
  onSubmitKanji() {
    this.upload = true;
    this.uploaded = false;

    const newId = this.selectedKanjiList + this.af.createId();

    this.kanji = {
      id: newId,
      grade: this.selectedKanjiList,
      kanji: this.kanjiName.value,
      onyomi: this.kanjiOnyomi.value,
      kunyomi: this.kanjiKunyomi.value,
      stroke: this.kanjiStroke.value,
      indonesia: this.kanjiIndo.value.toLowerCase(),
      english: this.kanjiEng.value.toLowerCase(),
      example: this.kanjiExample.value,
      zJson: this.animJson,
    };

    // tslint:disable-next-line:max-line-length
    const task: AngularFireUploadTask = this.quizService.addFileToStorage(this.kanji, 'kanji', this.fileKanjiAnimation, this.fileKanjiAnimation.type, 'animation.json');
    task
      .then(() => {
        this.quizService.addItem('kanji', this.kanji)
          .then(() => {
            this.storage.ref(`kanji/${this.kanji.id}/animation.json`).getDownloadURL().subscribe(url => {
              this.kanji.animation = url;
              this.quizService.UpdateItem('kanji', this.kanji)
                .then(() => this.resetForm())
                .then(() => this.upload = false)
                .then(() => this.uploaded = true)
                .catch(error => console.log(error));
            });
          }).catch(error => console.log(error))
          ;
      }).catch(error => console.log(error))
      ;
  }

  prepareForm() {
    this.kanjiForm = this.fb.group({
      kanjiName: ['', [Validators.required]],
      kanjiOnyomi: ['', [Validators.required]],
      kanjiKunyomi: ['', [Validators.required]],
      kanjiAnimation: ['', [Validators.required]],
      kanjiStroke: ['', [Validators.required]],
      kanjiIndo: ['', [Validators.required]],
      kanjiEng: ['', [Validators.required]],
      kanjiExample: ['', [Validators.required]],
    });
  }

  resetForm() {
    this.upload = false;
    this.uploaded = false;
    this.errorInput = null;
    this.errorPreview = null;
    this.errorPreviewState = false;
    this.lottieConfig = '';
    this.fileKanjiAnimation = null;
    this.anim = '';
    this.animJson = '';
    this.kanjiForm.reset();

    return false;
  }

  getItems() {
    this.quizService.getItemWithCondition('kanji', 'stroke', 'asc', 'grade', this.selectedKanjiList).subscribe(data => {
      this.kanjis = data;
    });
  }

  editKanji($event, item: Kanji) {

    this.kanjiForm = this.fb.group({
      kanjiName: ['', [Validators.required]],
      kanjiOnyomi: ['', [Validators.required]],
      kanjiKunyomi: ['', [Validators.required]],
      kanjiStroke: ['', [Validators.required, Validators.pattern(/^([1-9]\d*)(\.\d+)?$/)]],
      kanjiIndo: ['', [Validators.required]],
      kanjiEng: ['', [Validators.required]],
      kanjiExample: ['', [Validators.required]],
    });

    this.kanjiName.reset(item.kanji);
    this.kanjiOnyomi.reset(item.onyomi);
    this.kanjiKunyomi.reset(item.kunyomi);
    this.kanjiStroke.reset(item.stroke);
    this.kanjiIndo.reset(item.indonesia);
    this.kanjiEng.reset(item.english);
    this.kanjiExample.reset(item.example);
  }

  updateKanji($event, item: Kanji) {

    this.upload = true;
    this.uploaded = false;

    item.kanji = this.kanjiName.value;
    item.onyomi = this.kanjiOnyomi.value;
    item.kunyomi = this.kanjiKunyomi.value;
    item.stroke = this.kanjiStroke.value;
    item.indonesia = this.kanjiIndo.value.toLowerCase();
    item.english = this.kanjiEng.value.toLowerCase();
    item.example = this.kanjiExample.value;
    item.zJson = this.animJson;

    if (this.fileKanjiAnimation !== null) {
      // tslint:disable-next-line:max-line-length
      const task: AngularFireUploadTask = this.quizService.addFileToStorage(item, 'kanji', this.fileKanjiAnimation, this.fileKanjiAnimation.type, 'animation.json');
      return task
        .then(() => {
          this.quizService.addItem('kanji', item)
            .then(() => {
              this.storage.ref(`kanji/${item.id}/animation.json`).getDownloadURL().subscribe(url => {
                item.animation = url;
                this.quizService.UpdateItem('kanji', item)
                  .then(() => this.resetForm())
                  .then(() => this.upload = false)
                  .then(() => this.uploaded = true)
                  .then(() => this.prepareForm())
                  .catch(error => console.log(error));
              });
            }).catch(error => console.log(error))
            ;
        }).catch(error => console.log(error))
        ;
    } else {
      this.quizService.addItem('kanji', item)
        .then(() => {
          this.storage.ref(`kanji/${item.id}/animation.json`).getDownloadURL().subscribe(url => {
            item.animation = url;
            this.quizService.UpdateItem('kanji', item)
              .then(() => this.resetForm())
              .then(() => this.upload = false)
              .then(() => this.uploaded = true)
              .then(() => this.prepareForm())
              .catch(error => console.log(error));
          });
        }).catch(error => console.log(error))
        ;
    }
  }

  deleteKanji($event, item) {
    return this.quizService.deleteItem('kanji', item);
  }

  changeKanjiAnimation($event) {
    this.lottieConfig = null;

    this.fileKanjiAnimation = $event.target.files[0];

    this.checkFile(this.fileKanjiAnimation);

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const obj = JSON.parse(fileReader.result);

      if (obj.v) {
        this.animJson = fileReader.result;
        this.errorPreview = 'Good animation!';
        this.errorPreviewState = true;
      } else {
        this.errorPreview = 'This JSON file is not an animation!';
        this.errorPreviewState = false;
      }

      this.lottieConfig = {
        animationData: obj,
        autoplay: true,
        loop: true
      };

    };
    fileReader.readAsText(this.fileKanjiAnimation);
  }

  kanjiChangeListener($event) {
    this.selectedKanjiList = $event.value;
    this.quizService.getItemWithCondition('kanji', 'stroke', 'asc', 'grade', this.selectedKanjiList).subscribe(data => {
      this.kanjis = data;
    });
  }

  checkFile(file) {
    if (file.type === 'application/json') {
      this.errorInput = '';
    } else {
      this.errorInput = 'Sorry, file type does not match';
    }
  }

  handleKanjiAnimation(anim: any) {
    this.anim = anim;
  }

  getFirstWord(word: string) {
    if (word.match(',')) {
      return word.substr(0, word.indexOf(','));
    } else {
      return word;
    }
  }

}
