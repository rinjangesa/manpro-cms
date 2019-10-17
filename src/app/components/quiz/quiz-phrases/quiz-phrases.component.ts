import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../../services/quiz.service';
import { Kanji, Phrase, Grammar, PhraseCategory, KanjiQuiz, PhraseQuiz, GrammarQuiz } from '../../../models/quiz';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from '@firebase/util';
import { AngularFireUploadTask, AngularFireStorage } from 'angularfire2/storage';

@Component({
  selector: 'app-quiz-phrases',
  templateUrl: './quiz-phrases.component.html',
  styleUrls: ['./quiz-phrases.component.scss']
})
export class QuizPhrasesComponent implements OnInit {

  // Select var
  selectedPhraseList = 'Common';
  selectedPhraseQuestionType = '';
  selectedPhraseAnswer = 'true';

  // Form
  phraseCategoryForm: FormGroup;
  phraseForm: FormGroup;

  // Upload Status
  upload = false;
  uploaded = false;
  snapshot: Observable<any>;

  // Data
  dataCounted;
  phraseCategories: PhraseCategory[];
  phraseCategory: PhraseCategory;
  phrases: Phrase[];
  phrase: Phrase;
  phraseQuizzes: PhraseQuiz[];
  phraseQuiz: PhraseQuiz;

  // State
  errorInput: string;
  errorPreview: string;
  errorPreviewState = false;
  animJson: string;
  imageChangedEvent2: any = '';
  croppedImage2: any = '';

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
    this.quizService.getItem('phrase', 'english', 'asc').subscribe(data => {
      this.phrases = data;
    });
    this.quizService.getItem('phrase_category', 'english', 'asc').subscribe(data => {
      this.phraseCategories = data;
    });
    this.quizService.getItem('phrase_quiz', 'type', 'desc').subscribe(data => {
      this.phraseQuizzes = data;
    });
  }

  // Form
  get categoryEng() { return this.phraseCategoryForm.get('categoryEng'); }
  get categoryIndo() { return this.phraseCategoryForm.get('categoryIndo'); }
  get categoryJap() { return this.phraseCategoryForm.get('categoryJap'); }
  get categoryRomaji() { return this.phraseCategoryForm.get('categoryRomaji'); }
  get categoryImage() { return this.phraseCategoryForm.get('categoryImage'); }
  get phraseType() { return this.phraseForm.get('phraseType'); }
  get phraseQuestion() { return this.phraseForm.get('phraseQuestion'); }
  get phraseAnswer() { return this.phraseForm.get('phraseAnswer'); }
  get phraseOption1() { return this.phraseForm.get('phraseOption1'); }
  get phraseOption2() { return this.phraseForm.get('phraseOption2'); }
  get phraseOption3() { return this.phraseForm.get('phraseOption3'); }
  get phraseCorrection() { return this.phraseForm.get('phraseCorrection'); }

  onSubmitCategory() {
    this.upload = true;
    this.uploaded = false;

    const newId = this.af.createId();

    const imgBlob: Blob = this.dataURItoBlob(this.croppedImage2, null);

    this.phraseCategory = {
      id: newId,
      english: this.categoryEng.value,
      indonesia: this.categoryIndo.value,
      japan: this.categoryJap.value,
      romaji: this.categoryRomaji.value,
      img: ''
    };

    // tslint:disable-next-line:max-line-length
    const task: AngularFireUploadTask = this.quizService.addFileToStorage(this.phraseCategory, 'phrase_category', imgBlob, 'image/png', 'image');
    task
      .then(() => {
        this.quizService.addItem('phrase_category', this.phraseCategory)
          .then(() => {
            this.storage.ref(`phrase_category/${this.phraseCategory.id}/image`).getDownloadURL().subscribe(url => {
              this.phraseCategory.img = url;
              this.quizService.UpdateItem('phrase_category', this.phraseCategory)
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
  }

  onSubmitPhrase() {
    this.upload = true;
    this.uploaded = false;

    const newId = this.af.createId();

    if (this.selectedPhraseQuestionType === 'text') {
      this.phraseQuiz = {
        id: newId,
        type: this.selectedPhraseQuestionType,
        category: this.selectedPhraseList,
        question: this.phraseQuestion.value,
        answer: this.phraseAnswer.value,
        option1: this.phraseOption1.value,
        option2: this.phraseOption2.value,
        option3: this.phraseOption3.value,
        correction: this.phraseCorrection.value,
      };

      this.quizService.addItem('phrase_quiz', this.phraseQuiz)
        .then(() => this.resetForm())
        .then(() => this.upload = false)
        .then(() => this.uploaded = true)
        .catch(error => console.error(error)
        );

    } else if (this.selectedPhraseQuestionType === 'image') {
      this.phraseQuiz = {
        id: newId,
        type: this.selectedPhraseQuestionType,
        category: this.selectedPhraseList,
        question: this.phraseQuestion.value,
        answer: this.phraseAnswer.value,
        option1: this.phraseOption1.value,
        option2: this.phraseOption2.value,
        option3: this.phraseOption3.value,
        correction: this.phraseCorrection.value,
      };

      const imgBlob: Blob = this.dataURItoBlob(this.croppedImage2, null);

      const task = this.quizService.addFileToStorage(this.phraseQuiz, 'phrase_quiz', imgBlob, 'image/png', 'image');
      task
        .then(() => {
          this.quizService.addItem('phrase_quiz', this.phraseQuiz)
            .then(() => {
              this.storage.ref(`phrase_quiz/${this.phraseQuiz.id}/image`).getDownloadURL().subscribe(url => {
                this.phraseQuiz.question = url;
                this.quizService.UpdateItem('phrase_quiz', this.phraseQuiz)
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

    } else if (this.selectedPhraseQuestionType === 'boolean') {
      this.phraseQuiz = {
        id: newId,
        type: this.selectedPhraseQuestionType,
        category: this.selectedPhraseList,
        question: this.phraseQuestion.value,
        answer: this.phraseAnswer.value,
        option1: '',
        option2: '',
        option3: '',
        correction: this.phraseCorrection.value,
      };

      this.quizService.addItem('phrase_quiz', this.phraseQuiz)
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
    this.phraseCategoryForm.reset();
    this.phraseForm.reset();
    this.croppedImage2 = '';
    this.imageChangedEvent2 = '';
    this.selectedPhraseQuestionType = '';

    return false;
  }

  prepareForm() {
    this.phraseCategoryForm = this.fb.group({
      categoryEng: ['', [Validators.required]],
      categoryIndo: ['', [Validators.required]],
      categoryJap: ['', [Validators.required]],
      categoryRomaji: ['', [Validators.required]],
      categoryImage: ['', [Validators.required]],
    });
    this.phraseForm = this.fb.group({
      phraseType: ['', [Validators.required]],
      phraseQuestion: ['', [Validators.required]],
      phraseAnswer: ['', [Validators.required]],
      phraseOption1: ['', [Validators.required]],
      phraseOption2: ['', [Validators.required]],
      phraseOption3: ['', [Validators.required]],
      phraseCorrection: ['', [Validators.required]],
    });
  }

  setEditPhrases(item: PhraseQuiz) {
    if (item.type === 'text') {
      this.phraseQuestion.reset(item.question);
      this.phraseAnswer.reset(item.answer);
      this.phraseOption1.reset(item.option1);
      this.phraseOption2.reset(item.option2);
      this.phraseOption3.reset(item.option3);
      this.phraseCorrection.reset(item.correction);
    } else if (item.type === 'boolean') {
      this.phraseQuestion.reset(item.question);
      this.phraseAnswer.reset(item.answer);
      this.phraseCorrection.reset(item.correction);
    } else if (item.type === 'image') {
      this.croppedImage2 = item.question;
      this.phraseAnswer.reset(item.answer);
      this.phraseOption1.reset(item.option1);
      this.phraseOption2.reset(item.option2);
      this.phraseOption3.reset(item.option3);
      this.phraseCorrection.reset(item.correction);
    }
  }

  updatePhrases($event, item: PhraseQuiz) {

    if (item.type === 'text') {
      this.phraseQuiz = {
        id: item.id,
        type: item.type,
        category: item.category,
        question: this.phraseQuestion.value,
        answer: this.phraseAnswer.value,
        option1: this.phraseOption1.value,
        option2: this.phraseOption2.value,
        option3: this.phraseOption3.value,
        correction: this.phraseCorrection.value,
      };
      return this.quizService.UpdateItem('phrase_quiz', this.phraseQuiz)
        .then(() => this.resetForm())
        .then(() => this.upload = false)
        .then(() => this.uploaded = true)
        .catch(error => console.error(error)
        );
    } else if (item.type === 'image') {
      this.phraseQuiz = {
        id: item.id,
        type: item.type,
        category: item.category,
        question: this.phraseQuestion.value,
        answer: this.phraseAnswer.value,
        option1: this.phraseOption1.value,
        option2: this.phraseOption2.value,
        option3: this.phraseOption3.value,
        correction: this.phraseCorrection.value,
      };

      const imgBlob: Blob = this.dataURItoBlob(this.croppedImage2, null);

      const task = this.quizService.addFileToStorage(this.phraseQuiz, 'phrase_quiz', imgBlob, 'image/png', 'image');
      return task
        .then(() => {
          this.quizService.UpdateItem('phrase_quiz', this.phraseQuiz)
            .then(() => {
              this.storage.ref(`phrase_quiz/${this.phraseQuiz.id}/image`).getDownloadURL().subscribe(url => {
                this.phraseQuiz.question = url;
                this.quizService.UpdateItem('phrase_quiz', this.phraseQuiz)
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
      this.phraseQuiz = {
        id: item.id,
        type: item.type,
        category: item.category,
        question: this.phraseQuestion.value,
        answer: this.phraseAnswer.value,
        option1: '',
        option2: '',
        option3: '',
        correction: this.phraseCorrection.value,
      };
      return this.quizService.UpdateItem('phrase_quiz', this.phraseQuiz)
        .then(() => this.resetForm())
        .then(() => this.upload = false)
        .then(() => this.uploaded = true)
        .catch(error => console.error(error)
        );
    }
  }

  deletePhrases($event, item: PhraseQuiz) {
    return this.quizService.deleteItem('phrase_quiz', item);
  }

  phraseQuestionTypeChangeListener($event) {
    this.selectedPhraseQuestionType = $event.value;

    if (this.selectedPhraseQuestionType === 'boolean') {
      this.phraseForm = this.fb.group({
        phraseType: ['boolean', [Validators.required]],
        phraseQuestion: ['', [Validators.required]],
        phraseAnswer: ['', [Validators.required]],
        phraseOption1: ['', [Validators.required]],
        phraseOption2: ['', [Validators.required]],
        phraseOption3: ['', [Validators.required]],
        phraseCorrection: ['', [Validators.required]],
      });
    } else if (this.selectedPhraseQuestionType === 'text') {
      this.phraseForm = this.fb.group({
        phraseType: ['text', [Validators.required]],
        phraseQuestion: ['', [Validators.required]],
        phraseAnswer: ['', [Validators.required]],
        phraseOption1: ['', [Validators.required]],
        phraseOption2: ['', [Validators.required]],
        phraseOption3: ['', [Validators.required]],
        phraseCorrection: ['', [Validators.required]],
      });
    } else if (this.selectedPhraseQuestionType === 'image') {
      this.phraseForm = this.fb.group({
        phraseType: ['image', [Validators.required]],
        phraseQuestion: ['', [Validators.required]],
        phraseAnswer: ['', [Validators.required]],
        phraseOption1: ['', [Validators.required]],
        phraseOption2: ['', [Validators.required]],
        phraseOption3: ['', [Validators.required]],
        phraseCorrection: ['', [Validators.required]],
      });
    }
  }

  phraseChangeListener($event) {
    this.selectedPhraseList = $event.value;
    this.quizService.getItemWithCondition('phrase_quiz', 'type', 'desc', 'category', this.selectedPhraseList).subscribe(data => {
      this.phraseQuizzes = data;
    });
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
    this.imageChangedEvent2 = event;

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
      this.croppedImage2 = '';
      this.imageChangedEvent2 = '';
      this.errorPreviewState = true;
      this.errorPreview = '';
    }

  }
  imageCropped2(image: string) {
    this.croppedImage2 = image;
  }
  imageLoaded() {
    // show cropper
  }
  loadImageFailed() {
    // show message
  }
  // image cropper for char end

}
