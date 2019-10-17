import { Component, OnInit } from '@angular/core';
import { Character } from '../../../models/shop';
import { ShopService } from '../../../services/shop.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss']
})
export class CharacterComponent implements OnInit {

  // Models
  chars: Character[];
  char: Character;

  // Filter
  selectedOrderChar = 'createdAt';
  selectedSortChar = 'desc';
  placeholderChar = 'Search by Date';

  // Form
  charForm: FormGroup;
  multipliers = [
    { value: 1, name: '1' },
    { value: 2, name: '2' },
    { value: 3, name: '3' },
    { value: 4, name: '4' },
    { value: 5, name: '5' },
    { value: 6, name: '6' },
    { value: 7, name: '7' },
    { value: 8, name: '8' },
    { value: 9, name: '9' },
    { value: 10, name: '10' },
  ];
  addState = false;

  // Task
  task: AngularFireUploadTask;
  percentage: Observable<number>;
  snapshot: Observable<any>;
  downloadURL: Observable<string>;

  // Image Cropper
  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImageThumb: any = '';

  constructor(
    private shopService: ShopService,
    private fb: FormBuilder,
    private af: AngularFirestore,
    private storage: AngularFireStorage
  ) {

    this.formValidators();

    this.shopService.getChar('desc').subscribe(data => {
      this.chars = data;
    });

  }

  ngOnInit() {
  }

  // Form function start

  onSubmitChar() {

    this.percentage = null;
    this.snapshot = null;
    this.downloadURL = null;

    const newId = this.af.createId();

    this.char = {
      id: newId,
      name: this.charName.value,
      japanname: this.charJapanName.value,
      price: this.charPrice.value,
      exp: this.charExp.value,
      money: this.charMoney.value,
      descriptionID: this.charDescIndo.value,
      descriptionEN: this.charDescEng.value,
      descriptionJP: this.charDescJpn.value,
      createdAt: new Date(),
    };

    const oriImg: File = this.imageChangedEvent.target.files[0];
    const imgBlob: Blob = this.dataURItoBlob(this.croppedImage, null);
    const thumbBlob: Blob = this.dataURItoBlob(this.croppedImageThumb, null);

    this.task = this.shopService.uploadCharImageTask(this.char, imgBlob, thumbBlob, oriImg);
    this.task.resume();

    // Progress monitoring
    this.percentage = this.task.percentageChanges();
    this.snapshot = this.task.snapshotChanges().pipe(
      tap(snap => {
        // console.log(snap);
        if (snap.bytesTransferred === snap.totalBytes) {
          // Update firestore on completion

          this.shopService.addChar(this.char)
            .then(() => {
              this.storage.ref(`character/${this.char.id}/thumb`).getDownloadURL()
                .subscribe(url => {
                  this.char.thumbimg = url;
                  this.shopService.updateChar(this.char);
                });
              this.storage.ref(`character/${this.char.id}/img`).getDownloadURL()
                .subscribe(url => {
                  this.char.fullimg = url;
                  this.shopService.updateChar(this.char);
                });
              this.downloadURL = this.storage.ref(`character/${this.char.id}/ori`).getDownloadURL();
              this.downloadURL.subscribe(url => {
                this.char.oriimg = url;
                this.shopService.updateChar(this.char);
              });
            });
          this.resetAllForm();
        }
      })
    );
  }

  formValidators() {
    this.charForm = this.fb.group({
      charFormName: ['', Validators.required],
      charFormJapan: ['', [Validators.required, Validators.pattern(/^([^a-zA-Z0-9]*)?$/)]],
      charFormPrice: [0, [Validators.required, Validators.pattern(/^([1-9]\d*)(\.\d+)?$/)]],
      charFormExp: [1, Validators.required],
      charFormMoney: [1, Validators.required],
      charFormDescInd: ['', Validators.required],
      charFormDescEng: ['', Validators.required],
      charFormDescJpn: ['', [Validators.required, Validators.pattern(/^([^a-zA-Z0-9]*)?$/)]],
      charFormImage: ['', Validators.required],
    });
  }

  get charName() { return this.charForm.get('charFormName'); }
  get charJapanName() { return this.charForm.get('charFormJapan'); }
  get charPrice() { return this.charForm.get('charFormPrice'); }
  get charExp() { return this.charForm.get('charFormExp'); }
  get charMoney() { return this.charForm.get('charFormMoney'); }
  get charDescIndo() { return this.charForm.get('charFormDescInd'); }
  get charDescEng() { return this.charForm.get('charFormDescEng'); }
  get charDescJpn() { return this.charForm.get('charFormDescJpn'); }
  get charOrientation() { return this.charForm.get('charFormOrientation'); }
  get charScale() { return this.charForm.get('charFormScale'); }

  editChar(char: Character) {
    this.charName.reset(char.name);
    this.charJapanName.reset(char.japanname);
    this.charDescEng.reset(char.descriptionEN);
    this.charDescIndo.reset(char.descriptionID);
    this.charDescJpn.reset(char.descriptionJP);
  }

  updateChar(event, char: Character) {
    char.name = this.charName.value;
    char.japanname = this.charJapanName.value;
    char.descriptionEN = this.charDescEng.value;
    char.descriptionID = this.charDescIndo.value;
    char.descriptionJP = this.charDescJpn.value;
    this.shopService.updateChar(char)
      .then(() => this.resetAllForm());
  }

  deleteChar(event, char: Character) {
    this.shopService.deleteCharOnStorage(char);
  }

  resetAllForm() {
    this.charForm.reset();
    this.charPrice.reset(0);
    this.charExp.reset(1);
    this.charMoney.reset(1);
    this.imageChangedEvent = '';
    this.croppedImage = '';
    this.croppedImageThumb = '';

    return false;
  }

  toggleAdding() {
    if (this.addState) {
      this.addState = false;
    } else {
      this.addState = true;
    }
  }

  // Form function end

  // Filter function start
  searchingChar(sort, order, $event) {
    this.shopService.searchChar(sort.value, order.value, $event.target.value).subscribe(data => {
      this.chars = data;
    });
  }

  orderCharBy($event, sort, order) {
    this.placeholderChar = 'Search by ' + order._mostRecentViewValue;
    this.shopService.orderByFieldChar($event.value, sort.value).subscribe(data => {
      this.chars = data;
    });
  }

  sortCharBy(order, $event) {
    this.shopService.orderByFieldChar(order.value, $event.value).subscribe(data => {
      this.chars = data;
    });
  }
  // Filter function end

  // Image cropper function start
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(image: string) {
    this.croppedImage = image;
  }
  imageCroppedThumb(image: string) {
    this.croppedImageThumb = image;
  }
  imageLoaded() {
    // show cropper
  }
  loadImageFailed() {
    // show message
  }
  // Image cropper function end

  checkLength(word: string) {
    if (word.length <= 10) {
      return word;
    } else {
      return word.substr(0, 8) + ' ...';
    }
  }

  showDate(date) {
    return date.toDate();
  }

  isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }

  dataURItoBlob(dataURI, callback) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    const byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    const bb = new Blob([ab]);
    return bb;
  }
}
