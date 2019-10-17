import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../../services/quiz.service';
import { Kanji, Phrase, Grammar, PhraseCategory, KanjiQuiz, PhraseQuiz, GrammarQuiz } from '../../../models/quiz';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from '@firebase/util';
import { AngularFireUploadTask, AngularFireStorage } from 'angularfire2/storage';

@Component({
  selector: 'app-quiz-grammar',
  templateUrl: './quiz-grammar.component.html',
  styleUrls: ['./quiz-grammar.component.scss']
})
export class QuizGrammarComponent implements OnInit {

  // Select var
  selectedGrammarList = 'basic';
  selectedGrammarQuestionType = '';
  selectedGrammarAnswer = 'true';

  // Form
  grammarForm: FormGroup;

  // Upload Status
  upload = false;
  uploaded = false;
  snapshot: Observable<any>;

  // Data
  dataCounted;
  grammars: Grammar[];
  grammar: Grammar;
  grammarQuizzes: GrammarQuiz[];
  grammarQuiz: GrammarQuiz;

  // State
  errorInput: string;
  errorPreview: string;
  errorPreviewState = false;
  animJson: string;
  imageChangedEvent3: any = '';
  croppedImage3: any = '';

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
    this.quizService.getItem('grammar', 'tier', 'asc').subscribe(data => {
      this.grammars = data;
    });
    this.quizService.getItem('grammar_quiz', 'type', 'desc').subscribe(data => {
      this.grammarQuizzes = data;
    });
  }

  // Form
  get grammarType() { return this.grammarForm.get('grammarType'); }
  get grammarQuestion() { return this.grammarForm.get('grammarQuestion'); }
  get grammarAnswer() { return this.grammarForm.get('grammarAnswer'); }
  get grammarOption1() { return this.grammarForm.get('grammarOption1'); }
  get grammarOption2() { return this.grammarForm.get('grammarOption2'); }
  get grammarOption3() { return this.grammarForm.get('grammarOption3'); }
  get grammarCorrection() { return this.grammarForm.get('grammarCorrection'); }

  onSubmitGrammar() {
    this.upload = true;
    this.uploaded = false;

    const newId = this.af.createId();

    if (this.selectedGrammarQuestionType === 'text') {
      this.grammarQuiz = {
        id: newId,
        type: this.selectedGrammarQuestionType,
        tier: this.selectedGrammarList,
        question: this.grammarQuestion.value,
        answer: this.grammarAnswer.value,
        option1: this.grammarOption1.value,
        option2: this.grammarOption2.value,
        option3: this.grammarOption3.value,
        correction: this.grammarCorrection.value,
      };

      this.quizService.addItem('grammar_quiz', this.grammarQuiz)
        .then(() => this.resetForm())
        .then(() => this.upload = false)
        .then(() => this.uploaded = true)
        .catch(error => console.error(error)
        );

    } else if (this.selectedGrammarQuestionType === 'image') {
      this.grammarQuiz = {
        id: newId,
        type: this.selectedGrammarQuestionType,
        tier: this.selectedGrammarList,
        question: this.grammarQuestion.value,
        answer: this.grammarAnswer.value,
        option1: this.grammarOption1.value,
        option2: this.grammarOption2.value,
        option3: this.grammarOption3.value,
        correction: this.grammarCorrection.value,
      };

      const imgBlob: Blob = this.dataURItoBlob(this.croppedImage3, null);

      const task = this.quizService.addFileToStorage(this.grammarQuiz, 'grammar_quiz', imgBlob, 'image/png', 'image');
      task
        .then(() => {
          this.quizService.addItem('grammar_quiz', this.grammarQuiz)
            .then(() => {
              this.storage.ref(`grammar_quiz/${this.grammarQuiz.id}/image`).getDownloadURL().subscribe(url => {
                this.grammarQuiz.question = url;
                this.quizService.UpdateItem('grammar_quiz', this.grammarQuiz)
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

    } else if (this.selectedGrammarQuestionType === 'boolean') {
      this.grammarQuiz = {
        id: newId,
        type: this.selectedGrammarQuestionType,
        tier: this.selectedGrammarList,
        question: this.grammarQuestion.value,
        answer: this.grammarAnswer.value,
        option1: '',
        option2: '',
        option3: '',
        correction: this.grammarCorrection.value,
      };

      this.quizService.addItem('grammar_quiz', this.grammarQuiz)
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
    this.grammarForm.reset();
    this.croppedImage3 = '';
    this.imageChangedEvent3 = '';
    this.selectedGrammarQuestionType = '';

    return false;
  }

  prepareForm() {
    this.grammarForm = this.fb.group({
      grammarType: ['', [Validators.required]],
      grammarQuestion: ['', [Validators.required]],
      grammarAnswer: ['', [Validators.required]],
      grammarOption1: ['', [Validators.required]],
      grammarOption2: ['', [Validators.required]],
      grammarOption3: ['', [Validators.required]],
      grammarCorrection: ['', [Validators.required]],
    });
  }

  setEditGrammar(item: GrammarQuiz) {
    if (item.type === 'text') {
      this.grammarQuestion.reset(item.question);
      this.grammarAnswer.reset(item.answer);
      this.grammarOption1.reset(item.option1);
      this.grammarOption2.reset(item.option2);
      this.grammarOption3.reset(item.option3);
      this.grammarCorrection.reset(item.correction);
    } else if (item.type === 'boolean') {
      this.grammarQuestion.reset(item.question);
      this.grammarAnswer.reset(item.answer);
      this.grammarCorrection.reset(item.correction);
    } else if (item.type === 'image') {
      this.croppedImage3 = item.question;
      this.grammarAnswer.reset(item.answer);
      this.grammarOption1.reset(item.option1);
      this.grammarOption2.reset(item.option2);
      this.grammarOption3.reset(item.option3);
      this.grammarCorrection.reset(item.correction);
    }
  }

  updateGrammar($event, item: GrammarQuiz) {

    if (item.type === 'text') {
      this.grammarQuiz = {
        id: item.id,
        type: item.type,
        tier: item.tier,
        question: this.grammarQuestion.value,
        answer: this.grammarAnswer.value,
        option1: this.grammarOption1.value,
        option2: this.grammarOption2.value,
        option3: this.grammarOption3.value,
        correction: this.grammarCorrection.value,
      };
      return this.quizService.UpdateItem('grammar_quiz', this.grammarQuiz)
        .then(() => this.resetForm())
        .then(() => this.upload = false)
        .then(() => this.uploaded = true)
        .catch(error => console.error(error)
        );
    } else if (item.type === 'image') {
      this.grammarQuiz = {
        id: item.id,
        type: item.type,
        tier: item.tier,
        question: this.grammarQuestion.value,
        answer: this.grammarAnswer.value,
        option1: this.grammarOption1.value,
        option2: this.grammarOption2.value,
        option3: this.grammarOption3.value,
        correction: this.grammarCorrection.value,
      };

      const imgBlob: Blob = this.dataURItoBlob(this.croppedImage3, null);

      const task = this.quizService.addFileToStorage(this.grammarQuiz, 'grammar_quiz', imgBlob, 'image/png', 'image');
      return task
        .then(() => {
          this.quizService.UpdateItem('grammar_quiz', this.grammarQuiz)
            .then(() => {
              this.storage.ref(`grammar_quiz/${this.grammarQuiz.id}/image`).getDownloadURL().subscribe(url => {
                this.grammarQuiz.question = url;
                this.quizService.UpdateItem('grammar_quiz', this.grammarQuiz)
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
      this.grammarQuiz = {
        id: item.id,
        type: item.type,
        tier: item.tier,
        question: this.grammarQuestion.value,
        answer: this.grammarAnswer.value,
        option1: '',
        option2: '',
        option3: '',
        correction: this.grammarCorrection.value,
      };
      return this.quizService.UpdateItem('grammar_quiz', this.grammarQuiz)
        .then(() => this.resetForm())
        .then(() => this.upload = false)
        .then(() => this.uploaded = true)
        .catch(error => console.error(error)
        );
    }
  }

  deleteGrammar($event, item: GrammarQuiz) {
    return this.quizService.deleteItem('grammar_quiz', item);
  }

  grammarQuestionTypeChangeListener($event) {
    this.selectedGrammarQuestionType = $event.value;

    if (this.selectedGrammarQuestionType === 'boolean') {
      this.grammarForm = this.fb.group({
        grammarType: ['boolean', [Validators.required]],
        grammarQuestion: ['', [Validators.required]],
        grammarAnswer: ['', [Validators.required]],
        grammarOption1: ['', [Validators.required]],
        grammarOption2: ['', [Validators.required]],
        grammarOption3: ['', [Validators.required]],
        grammarCorrection: ['', [Validators.required]],
      });
    } else if (this.selectedGrammarQuestionType === 'text') {
      this.grammarForm = this.fb.group({
        grammarType: ['text', [Validators.required]],
        grammarQuestion: ['', [Validators.required]],
        grammarAnswer: ['', [Validators.required]],
        grammarOption1: ['', [Validators.required]],
        grammarOption2: ['', [Validators.required]],
        grammarOption3: ['', [Validators.required]],
        grammarCorrection: ['', [Validators.required]],
      });
    } else if (this.selectedGrammarQuestionType === 'image') {
      this.grammarForm = this.fb.group({
        grammarType: ['image', [Validators.required]],
        grammarQuestion: ['', [Validators.required]],
        grammarAnswer: ['', [Validators.required]],
        grammarOption1: ['', [Validators.required]],
        grammarOption2: ['', [Validators.required]],
        grammarOption3: ['', [Validators.required]],
        grammarCorrection: ['', [Validators.required]],
      });
    }

  }

  grammarChangeListener($event) {
    this.selectedGrammarList = $event.value;
    this.quizService.getItemWithCondition('grammar_quiz', 'type', 'desc', 'tier', this.selectedGrammarList).subscribe(data => {
      this.grammarQuizzes = data;
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
    this.imageChangedEvent3 = event;

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
      this.croppedImage3 = '';
      this.imageChangedEvent3 = '';
      this.errorPreviewState = true;
      this.errorPreview = '';
    }

  }
  imageCropped3(image: string) {
    this.croppedImage3 = image;
  }
  imageLoaded() {
    // show cropper
  }
  loadImageFailed() {
    // show message
  }
  // image cropper for char end

}
