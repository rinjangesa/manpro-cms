import { Component, OnInit } from '@angular/core';
import { Wallpaper } from '../../../models/shop';
import { ShopService } from '../../../services/shop.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-wallpaper',
  templateUrl: './wallpaper.component.html',
  styleUrls: ['./wallpaper.component.scss']
})
export class WallpaperComponent implements OnInit {

  // Models
  walls: Wallpaper[];
  wall: Wallpaper;

  // Filter
  selectedOrderWall = 'createdAt';
  selectedSortWall = 'desc';
  placeholderWall = 'Search by Date';

  // Form
  wallForm: FormGroup;
  addState = false;

  // Task
  task2: AngularFireUploadTask;
  percentage2: Observable<number>;
  snapshot2: Observable<any>;
  downloadURL2: Observable<string>;

  // Image Cropper
  imageChangedEvent2: any = '';
  croppedImage2: any = '';
  croppedImageThumb2: any = '';

  constructor(
    private shopService: ShopService,
    private fb: FormBuilder,
    private af: AngularFirestore,
    private storage: AngularFireStorage
  ) {

    this.formValidators();

    this.shopService.getWall('desc').subscribe(data => {
      this.walls = data;
    });

  }

  ngOnInit() {
  }

  // Form function start

  onSubmitWall() {

    this.percentage2 = null;
    this.snapshot2 = null;
    this.downloadURL2 = null;

    const newId = this.af.createId();

    this.wall = {
      id: newId,
      name: this.wallName.value,
      japanname: this.wallJapaname.value,
      price: this.wallPrice.value,
      createdAt: new Date()
    };

    const imgBlob: Blob = this.dataURItoBlob(this.croppedImage2, null);
    const thumbBlob: Blob = this.dataURItoBlob(this.croppedImageThumb2, null);

    this.task2 = this.shopService.uploadWallImageTask(this.wall, imgBlob, thumbBlob);
    this.task2.resume();

    this.percentage2 = this.task2.percentageChanges();
    this.snapshot2 = this.task2.snapshotChanges().pipe(
      tap(snap => {
        // console.log(snap);
        if (snap.bytesTransferred === snap.totalBytes) {
          // Update firestore on completion

          this.shopService.addWall(this.wall)
            .then(() => {
              this.storage.ref(`wallpaper/${this.wall.id}/thumb`).getDownloadURL()
                .subscribe(url => {
                  this.wall.thumbimg = url;
                  this.shopService.updateWall(this.wall);
                });
              this.downloadURL2 = this.storage.ref(`wallpaper/${this.wall.id}/img`).getDownloadURL();
              this.downloadURL2.subscribe(url => {
                this.wall.fullimg = url;
                this.shopService.updateWall(this.wall);
              });

            });
          this.resetAllForm();
          // console.log(this.wall);
        }
      })
    );

  }

  formValidators() {
    this.wallForm = this.fb.group({
      wallFormName: ['', Validators.required],
      wallFormJapan: ['', [Validators.required, Validators.pattern(/^([^a-zA-Z0-9]*)?$/)]],
      wallFormPrice: [0, [Validators.required, Validators.pattern(/^([1-9]\d*)(\.\d+)?$/)]],
      wallFormImage: ['', Validators.required]
    });
  }

  get wallName() { return this.wallForm.get('wallFormName'); }
  get wallJapaname() { return this.wallForm.get('wallFormJapan'); }
  get wallPrice() { return this.wallForm.get('wallFormPrice'); }

  editWall(wall: Wallpaper) {
    this.wallName.reset(wall.name);
    this.wallJapaname.reset(wall.japanname);
  }

  updateWall(event, wall: Wallpaper) {
    wall.name = this.wallName.value;
    wall.japanname = this.wallJapaname.value;
    this.shopService.updateWall(wall)
      .then(() => this.resetAllForm());
  }

  deleteWall(event, wall: Wallpaper) {
    this.shopService.deleteWallOnStorage(wall);
  }

  resetAllForm() {
    this.wallForm.reset();
    this.wallPrice.reset(0);
    this.imageChangedEvent2 = '';
    this.croppedImage2 = '';
    this.croppedImageThumb2 = '';

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
  searchingWall(sort, order, $event) {
    // console.log($event.target.value);
    this.shopService.searchWall(sort.value, order.value, $event.target.value).subscribe(data => {
      this.walls = data;
    });
  }

  orderWallBy($event, sort, order) {
    this.placeholderWall = 'Search by ' + order._mostRecentViewValue;
    this.shopService.orderByFieldWall($event.value, sort.value).subscribe(data => {
      this.walls = data;
    });
  }

  sortWallBy(order, $event) {
    this.shopService.orderByFieldWall(order.value, $event.value).subscribe(data => {
      this.walls = data;
    });
  }
  // Filter function end

  // Image cropper function start
  fileChangeEvent2(event: any): void {
    this.imageChangedEvent2 = event;
  }
  imageCropped2(image: string) {
    this.croppedImage2 = image;
  }
  imageCroppedThumb2(image: string) {
    this.croppedImageThumb2 = image;
  }
  imageLoaded2() {
    // show cropper
  }
  loadImageFailed2() {
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
