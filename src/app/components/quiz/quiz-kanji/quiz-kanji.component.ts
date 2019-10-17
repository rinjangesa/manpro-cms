import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../../services/quiz.service';
import { Kanji, Phrase, Grammar, PhraseCategory, KanjiQuiz, PhraseQuiz, GrammarQuiz } from '../../../models/quiz';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from '@firebase/util';
import { AngularFireUploadTask, AngularFireStorage } from 'angularfire2/storage';

@Component({
  selector: 'app-quiz-kanji',
  templateUrl: './quiz-kanji.component.html',
  styleUrls: ['./quiz-kanji.component.scss']
})
export class QuizKanjiComponent implements OnInit {

  // Select var
  selectedKanjiList = 'N5';
  selectedKanji = '一';
  selectedKanjiQuestionType = '';
  selectedKanjiAnswer = 'true';

  // Form
  kanjiForm: FormGroup;

  // Upload Status
  upload = false;
  uploaded = false;
  snapshot: Observable<any>;

  // Data
  kanjis: Kanji[];
  kanji: Kanji;
  kanjiQuizzes: KanjiQuiz[];
  kanjiQuiz: KanjiQuiz;
  dataCounted;

  // State
  fileKanjiAnimation: File;
  lottieConfig: any;
  lottieConfig2: any;
  anim: any;
  animationSpeed = 1;
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

  getItems() {
    this.quizService.getItem('kanji', 'stroke', 'asc').subscribe(data => {
      this.kanjis = data;
    });
    this.quizService.getItem('kanji_quiz', 'type', 'desc').subscribe(data => {
      this.kanjiQuizzes = data;
    });
  }

  // Form
  get kanjiType() { return this.kanjiForm.get('kanjiType'); }
  get kanjiQuestion() { return this.kanjiForm.get('kanjiQuestion'); }
  get kanjiAnswer() { return this.kanjiForm.get('kanjiAnswer'); }
  get kanjiOption1() { return this.kanjiForm.get('kanjiOption1'); }
  get kanjiOption2() { return this.kanjiForm.get('kanjiOption2'); }
  get kanjiOption3() { return this.kanjiForm.get('kanjiOption3'); }
  get kanjiCorrection() { return this.kanjiForm.get('kanjiCorrection'); }

  onSubmitKanji() {
    this.upload = true;
    this.uploaded = false;

    const newId = this.selectedKanjiList + this.af.createId();

    if (this.selectedKanjiQuestionType === 'text') {
      this.kanjiQuiz = {
        id: newId,
        type: this.selectedKanjiQuestionType,
        grade: this.selectedKanjiList,
        kanji: this.selectedKanji,
        question: this.kanjiQuestion.value,
        answer: this.kanjiAnswer.value,
        option1: this.kanjiOption1.value,
        option2: this.kanjiOption2.value,
        option3: this.kanjiOption3.value,
        correction: this.kanjiCorrection.value,
      };
      this.quizService.addItem('kanji_quiz', this.kanjiQuiz)
        .then(() => this.resetForm())
        .then(() => this.upload = false)
        .then(() => this.uploaded = true)
        .catch(error => console.error(error)
        );
    } else if (this.selectedKanjiQuestionType === 'image') {
      this.kanjiQuiz = {
        id: newId,
        type: this.selectedKanjiQuestionType,
        grade: this.selectedKanjiList,
        kanji: this.selectedKanji,
        question: this.kanjiQuestion.value,
        answer: this.kanjiAnswer.value,
        option1: this.kanjiOption1.value,
        option2: this.kanjiOption2.value,
        option3: this.kanjiOption3.value,
        correction: this.kanjiCorrection.value,
      };

      const imgBlob: Blob = this.dataURItoBlob(this.croppedImage, null);

      const task = this.quizService.addFileToStorage(this.kanjiQuiz, 'kanji_quiz', imgBlob, 'image/png', 'image');
      task
        .then(() => {
          this.quizService.addItem('kanji_quiz', this.kanjiQuiz)
            .then(() => {
              this.storage.ref(`kanji_quiz/${this.kanjiQuiz.id}/image`).getDownloadURL().subscribe(url => {
                this.kanjiQuiz.question = url;
                this.quizService.UpdateItem('kanji_quiz', this.kanjiQuiz)
                  .then(() => this.resetForm())
                  .then(() => this.upload = false)
                  .then(() => this.uploaded = true)
                  .catch(error => console.log(error));
              });
            })
            .catch(error => console.log(error))
            ;
        })
        .catch(error => console.log(error))
        ;

    } else if (this.selectedKanjiQuestionType === 'boolean') {
      this.kanjiQuiz = {
        id: newId,
        type: this.selectedKanjiQuestionType,
        grade: this.selectedKanjiList,
        kanji: this.selectedKanji,
        question: this.kanjiQuestion.value,
        answer: this.kanjiAnswer.value,
        option1: '',
        option2: '',
        option3: '',
        correction: this.kanjiCorrection.value,
      };
      this.quizService.addItem('kanji_quiz', this.kanjiQuiz)
        .then(() => this.resetForm())
        .then(() => this.upload = false)
        .then(() => this.uploaded = true)
        .catch(error => console.error(error)
        );
    }
  }

  resetForm() {
    this.upload = false;
    this.uploaded = false;
    this.errorInput = null;
    this.errorPreview = null;
    this.errorPreviewState = false;
    this.kanjiForm.reset();
    this.croppedImage = '';
    this.imageChangedEvent = '';
    this.selectedKanjiQuestionType = '';

    return false;
  }

  prepareForm() {
    this.kanjiForm = this.fb.group({
      kanjiType: ['', [Validators.required]],
      kanjiQuestion: ['', [Validators.required]],
      kanjiAnswer: ['', [Validators.required]],
      kanjiOption1: ['', [Validators.required]],
      kanjiOption2: ['', [Validators.required]],
      kanjiOption3: ['', [Validators.required]],
      kanjiCorrection: ['', [Validators.required]],
    });
  }

  setEditKanji(item: KanjiQuiz) {
    if (item.type === 'text') {
      this.kanjiQuestion.reset(item.question);
      this.kanjiAnswer.reset(item.answer);
      this.kanjiOption1.reset(item.option1);
      this.kanjiOption2.reset(item.option2);
      this.kanjiOption3.reset(item.option3);
      this.kanjiCorrection.reset(item.correction);
    } else if (item.type === 'boolean') {
      this.kanjiQuestion.reset(item.question);
      this.kanjiAnswer.reset(item.answer);
      this.kanjiCorrection.reset(item.correction);
    } else if (item.type === 'image') {
      this.croppedImage = item.question;
      this.kanjiAnswer.reset(item.answer);
      this.kanjiOption1.reset(item.option1);
      this.kanjiOption2.reset(item.option2);
      this.kanjiOption3.reset(item.option3);
      this.kanjiCorrection.reset(item.correction);
    }
  }

  updateKanji($event, item: KanjiQuiz) {

    if (item.type === 'text') {
      this.kanjiQuiz = {
        id: item.id,
        type: item.type,
        grade: item.grade,
        kanji: item.kanji,
        question: this.kanjiQuestion.value,
        answer: this.kanjiAnswer.value,
        option1: this.kanjiOption1.value,
        option2: this.kanjiOption2.value,
        option3: this.kanjiOption3.value,
        correction: this.kanjiCorrection.value,
      };
      return this.quizService.UpdateItem('kanji_quiz', this.kanjiQuiz)
        .then(() => this.resetForm())
        .then(() => this.upload = false)
        .then(() => this.uploaded = true)
        .catch(error => console.error(error)
        );
    } else if (item.type === 'image') {
      this.kanjiQuiz = {
        id: item.id,
        type: item.type,
        grade: item.grade,
        kanji: item.kanji,
        question: this.kanjiQuestion.value,
        answer: this.kanjiAnswer.value,
        option1: this.kanjiOption1.value,
        option2: this.kanjiOption2.value,
        option3: this.kanjiOption3.value,
        correction: this.kanjiCorrection.value,
      };

      const imgBlob: Blob = this.dataURItoBlob(this.croppedImage, null);

      const task = this.quizService.addFileToStorage(this.kanjiQuiz, 'kanji_quiz', imgBlob, 'image/png', 'image');
      return task
        .then(() => {
          this.quizService.UpdateItem('kanji_quiz', this.kanjiQuiz)
            .then(() => {
              this.storage.ref(`kanji_quiz/${this.kanjiQuiz.id}/image`).getDownloadURL().subscribe(url => {
                this.kanjiQuiz.question = url;
                this.quizService.UpdateItem('kanji_quiz', this.kanjiQuiz)
                  .then(() => this.resetForm())
                  .then(() => this.upload = false)
                  .then(() => this.uploaded = true)
                  .catch(error => console.log(error));
              });
            })
            .catch(error => console.log(error))
            ;
        })
        .catch(error => console.log(error))
        ;

    } else if (item.type === 'boolean') {
      this.kanjiQuiz = {
        id: item.id,
        type: item.type,
        grade: item.grade,
        kanji: item.kanji,
        question: this.kanjiQuestion.value,
        answer: this.kanjiAnswer.value,
        option1: '',
        option2: '',
        option3: '',
        correction: this.kanjiCorrection.value,
      };
      return this.quizService.UpdateItem('kanji_quiz', this.kanjiQuiz)
        .then(() => this.resetForm())
        .then(() => this.upload = false)
        .then(() => this.uploaded = true)
        .catch(error => console.error(error)
        );
    }
  }

  deleteKanji($event, item: KanjiQuiz) {
    return this.quizService.deleteItem('kanji_quiz', item);
  }

  kanjiListChangeListener($event) {
    this.selectedKanjiList = $event.value;
    this.quizService.getItemWithCondition('kanji', 'stroke', 'asc', 'grade', this.selectedKanjiList).subscribe(data => {
      this.kanjis = data;
    });
  }

  kanjiChangeListener($event) {
    this.selectedKanji = $event.value;
    this.quizService.getItemWithCondition('kanji_quiz', 'type', 'desc', 'kanji', this.selectedKanji).subscribe(data => {
      this.kanjiQuizzes = data;
    });
  }

  kanjiQuestionTypeChangeListener($event) {
    this.selectedKanjiQuestionType = $event.value;

    if (this.selectedKanjiQuestionType === 'boolean') {
      this.kanjiForm = this.fb.group({
        kanjiType: ['boolean', [Validators.required]],
        kanjiQuestion: ['', [Validators.required]],
        kanjiAnswer: ['', [Validators.required]],
        kanjiOption1: ['', [Validators]],
        kanjiOption2: ['', [Validators]],
        kanjiOption3: ['', [Validators]],
        kanjiCorrection: ['', [Validators.required]],
      });
    } else if (this.selectedKanjiQuestionType === 'text') {
      this.kanjiForm = this.fb.group({
        kanjiType: ['text', [Validators.required]],
        kanjiQuestion: ['', [Validators.required]],
        kanjiAnswer: ['', [Validators.required]],
        kanjiOption1: ['', [Validators.required]],
        kanjiOption2: ['', [Validators.required]],
        kanjiOption3: ['', [Validators.required]],
        kanjiCorrection: ['', [Validators.required]],
      });
    } else if (this.selectedKanjiQuestionType === 'image') {
      this.kanjiForm = this.fb.group({
        kanjiType: ['image', [Validators.required]],
        kanjiQuestion: ['', [Validators.required]],
        kanjiAnswer: ['', [Validators.required]],
        kanjiOption1: ['', [Validators.required]],
        kanjiOption2: ['', [Validators.required]],
        kanjiOption3: ['', [Validators.required]],
        kanjiCorrection: ['', [Validators.required]],
      });
    }
  }

  dataURItoBlob(dataURI, callback) {
    const byteString = atob(dataURI.split(',')[1]);

    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const bb = new Blob([ab]);
    return bb;
  }

  // image cropper for char start
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;

    if (event.target.files[0]) {

      if (event.target.files[0].type === 'image/png') {
        this.errorPreviewState = true;
        this.errorPreview = 'Good Image!';
      } else if (event.target.files[0].type === 'image/jpg') {
        this.errorPreviewState = true;
        this.errorPreview = 'Good Image!';
      } else if (event.target.files[0].type === 'image/jpeg') {
        this.errorPreviewState = true;
        this.errorPreview = 'Good Image!';
      } else {
        this.errorPreviewState = false;
        this.errorPreview = 'This is not an image!';
      }

    } else {
      this.croppedImage = '';
      this.imageChangedEvent = '';
      this.errorPreviewState = true;
      this.errorPreview = '';
    }

  }
  imageCropped(image: string) {
    this.croppedImage = image;
  }
  imageLoaded() {
    // show cropper
  }
  loadImageFailed() {
    // show message
  }
  // image cropper for char end

}
