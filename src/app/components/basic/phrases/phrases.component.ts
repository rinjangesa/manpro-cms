import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../../services/quiz.service';
import { Kanji, Phrase, Grammar, PhraseCategory } from '../../../models/quiz';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from '@firebase/util';
import { AngularFireUploadTask, AngularFireStorage } from 'angularfire2/storage';

@Component({
  selector: 'app-phrases',
  templateUrl: './phrases.component.html',
  styleUrls: ['./phrases.component.scss']
})
export class PhrasesComponent implements OnInit {

  // Form
  selectedPhraseList = 'Common';
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

  getItems() {
    this.quizService.getItemWithCondition('phrase', 'english', 'asc', 'category', this.selectedPhraseList).subscribe(data => {
      this.phrases = data;
    });
    this.quizService.getItem('phrase_category', 'english', 'asc').subscribe(data => {
      this.phraseCategories = data;
    });
  }

  // Form
  get categoryEng() { return this.phraseCategoryForm.get('categoryEng'); }
  get categoryIndo() { return this.phraseCategoryForm.get('categoryIndo'); }
  get categoryJap() { return this.phraseCategoryForm.get('categoryJap'); }
  get categoryRomaji() { return this.phraseCategoryForm.get('categoryRomaji'); }
  get categoryImage() { return this.phraseCategoryForm.get('categoryImage'); }
  get phraseEng() { return this.phraseForm.get('phraseEng'); }
  get phraseIndo() { return this.phraseForm.get('phraseIndo'); }
  get phraseJap() { return this.phraseForm.get('phraseJap'); }
  get phraseRomaji() { return this.phraseForm.get('phraseRomaji'); }
  get phraseDesc() { return this.phraseForm.get('phraseDesc'); }

  onSubmitCategory() {
    this.upload = true;
    this.uploaded = false;

    const newId = this.af.createId();

    const imgBlob: Blob = this.dataURItoBlob(this.croppedImage, null);

    this.phraseCategory = {
      id: newId,
      english: this.categoryEng.value.charAt(0).toUpperCase() + this.categoryEng.value.slice(1),
      indonesia: this.categoryIndo.value.charAt(0).toUpperCase() + this.categoryIndo.value.slice(1),
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

    this.phrase = {
      id: newId,
      english: this.phraseEng.value.charAt(0).toUpperCase() + this.phraseEng.value.slice(1),
      indonesia: this.phraseIndo.value.charAt(0).toUpperCase() + this.phraseIndo.value.slice(1),
      japan: this.phraseJap.value,
      romaji: this.phraseRomaji.value,
      description: this.phraseDesc.value,
      category: this.selectedPhraseList,
    };

    this.quizService.addItem('phrase', this.phrase)
      .then(() => this.resetForm())
      .then(() => this.upload = false)
      .then(() => this.uploaded = true)
      .catch(error => console.log(error))
      ;
  }

  editPhrases($event, item: Phrase) {
    this.phraseEng.reset(item.english);
    this.phraseIndo.reset(item.indonesia);
    this.phraseJap.reset(item.japan);
    this.phraseRomaji.reset(item.romaji);
    this.phraseDesc.reset(item.description);
  }

  updatePhrases($event, item: Phrase) {

    this.upload = true;
    this.uploaded = false;

    item.english = this.phraseEng.value.charAt(0).toUpperCase() + this.phraseEng.value.slice(1);
    item.indonesia = this.phraseIndo.value.charAt(0).toUpperCase() + this.phraseIndo.value.slice(1);
    item.japan = this.phraseJap.value;
    item.romaji = this.phraseRomaji.value;
    item.description = this.phraseDesc.value;
    item.category = this.selectedPhraseList;

    this.quizService.UpdateItem('phrase', item)
      .then(() => this.resetForm())
      .then(() => this.upload = false)
      .then(() => this.uploaded = true)
      .catch(error => console.log(error))
      ;
  }

  deletePhrase($event, item) {
    return this.quizService.deleteItem('phrase', item);
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
    this.phraseCategoryForm.reset();
    this.phraseForm.reset();

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
      phraseEng: ['', [Validators.required]],
      phraseIndo: ['', [Validators.required]],
      phraseJap: ['', [Validators.required]],
      phraseRomaji: ['', [Validators.required]],
      phraseDesc: ['', [Validators.required]],
    });
  }

  phraseChangeListener($event) {
    // console.log($event);
    this.selectedPhraseList = $event.value;
    // console.log(this.selectedPhraseList);
    this.quizService.getItemWithCondition('phrase', 'english', 'asc', 'category', this.selectedPhraseList).subscribe(data => {
      this.phrases = data;
    });
  }

  checkPhraseLength(word: string) {
    if (word.length >= 30) {
      return word.substr(0, 50) + '...';
    } else {
      return word;
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

    if (event.target.files[0].type === 'image/png') {
      this.errorPreviewState = true;
      this.errorPreview = 'Good Image!';
    } else if (event.target.files[0].type === 'image/jpg') {
      this.errorPreviewState = true;
      this.errorPreview = 'Good Image!';
    } else {
      this.errorPreviewState = false;
      this.errorPreview = 'This is not an image!';
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
