import { Component, OnInit } from '@angular/core';
import { Decoration } from '../../../models/shop';
import { ShopService } from '../../../services/shop.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-decoration',
  templateUrl: './decoration.component.html',
  styleUrls: ['./decoration.component.scss']
})
export class DecorationComponent implements OnInit {

  // Models
  decors: Decoration[];
  decor: Decoration;

  // Filter
  selectedOrderDecor = 'createdAt';
  selectedSortDecor = 'desc';
  placeholderDecor = 'Search by Date';

  // Form
  decorForm: FormGroup;
  addState = false;

  // Task
  task3: AngularFireUploadTask;
  percentage3: Observable<number>;
  snapshot3: Observable<any>;
  downloadURL3: Observable<string>;

  // Image Cropper
  imageChangedEvent3: any = '';
  croppedImage3: any = '';
  croppedImageThumb3: any = '';

  constructor(
    private shopService: ShopService,
    private fb: FormBuilder,
    private af: AngularFirestore,
    private storage: AngularFireStorage
  ) {

    this.formValidators();

    this.shopService.getDecor('desc').subscribe(data => {
      this.decors = data;
    });

  }

  ngOnInit() {
  }

  // Form function start

  onSubmitDecor() {

    this.percentage3 = null;
    this.snapshot3 = null;
    this.downloadURL3 = null;

    const newId = this.af.createId();

    this.decor = {
      id: newId,
      name: this.decorName.value,
      japanname: this.decorJapaname.value,
      price: this.decorPrice.value,
      createdAt: new Date()
    };

    const imgBlob: Blob = this.dataURItoBlob(this.croppedImage3, null);
    const thumbBlob: Blob = this.dataURItoBlob(this.croppedImageThumb3, null);

    this.task3 = this.shopService.uploadDecorImageTask(this.decor, imgBlob, thumbBlob);
    this.task3.resume();

    this.percentage3 = this.task3.percentageChanges();
    this.snapshot3 = this.task3.snapshotChanges().pipe(
      tap(snap => {
        // console.log(snap);
        if (snap.bytesTransferred === snap.totalBytes) {
          // Update firestore on completion

          this.shopService.addDecor(this.decor)
            .then(() => {
              this.storage.ref(`decoration/${this.decor.id}/thumb`).getDownloadURL()
                .subscribe(url => {
                  this.decor.thumbimg = url;
                  this.shopService.updateDecor(this.decor);
                });
              this.downloadURL3 = this.storage.ref(`decoration/${this.decor.id}/img`).getDownloadURL();
              this.downloadURL3.subscribe(url => {
                this.decor.fullimg = url;
                this.shopService.updateDecor(this.decor);
              });

            });
          this.resetAllForm();
          // console.log(this.decor);
        }
      })
    );

  }

  formValidators() {
    this.decorForm = this.fb.group({
      decorFormName: ['', Validators.required],
      decorFormJapan: ['', [Validators.required, Validators.pattern(/^([^a-zA-Z0-9]*)?$/)]],
      decorFormPrice: [0, [Validators.required, Validators.pattern(/^([1-9]\d*)(\.\d+)?$/)]],
      decorFormImage: ['', Validators.required],
    });
  }

  get decorName() { return this.decorForm.get('decorFormName'); }
  get decorJapaname() { return this.decorForm.get('decorFormJapan'); }
  get decorPrice() { return this.decorForm.get('decorFormPrice'); }

  editDecor(decor: Decoration) {
    this.decorName.reset(decor.name);
    this.decorJapaname.reset(decor.japanname);
  }

  updateDecor(event, decor: Decoration) {
    decor.name = this.decorName.value;
    decor.japanname = this.decorJapaname.value;
    this.shopService.updateWall(decor)
      .then(() => this.resetAllForm());
  }

  deleteDecor(event, decor: Decoration) {
    this.shopService.deleteDecorOnStorage(decor);
  }

  resetAllForm() {
    this.decorForm.reset();
    this.decorPrice.reset(0);
    this.imageChangedEvent3 = '';
    this.croppedImage3 = '';
    this.croppedImageThumb3 = '';

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
  searchingDecor(sort, order, $event) {
    // console.log($event.target.value);
    this.shopService.searchDecor(sort.value, order.value, $event.target.value).subscribe(data => {
      this.decors = data;
    });
  }

  orderDecorBy($event, sort, order) {
    this.placeholderDecor = 'Search by ' + order._mostRecentViewValue;
    this.shopService.orderByFieldDecor($event.value, sort.value).subscribe(data => {
      this.decors = data;
    });
  }

  sortDecorBy(order, $event) {
    this.shopService.orderByFieldDecor(order.value, $event.value).subscribe(data => {
      this.decors = data;
    });
  }
  // Filter function end

  // Image cropper function start
  fileChangeEvent3(event: any): void {
    this.imageChangedEvent3 = event;
  }
  imageCropped3(image: string) {
    this.croppedImage3 = image;
  }
  imageCroppedThumb3(image: string) {
    this.croppedImageThumb3 = image;
  }
  imageLoaded3() {
    // show cropper
  }
  loadImageFailed3() {
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
