import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Event } from '../../models/event';
import { EventService } from '../../services/event.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {

  // Table
  displayedColumns = ['action', 'name', 'startdate', 'enddate', 'status'];
  dataSource = new MatTableDataSource<Event>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // Data
  events: Event[];
  event: Event;
  events_length: number;

  // Form
  eventForm: FormGroup;
  errorSubmit;
  succesSubmit;
  uploading;
  errorUpdate;
  succesUpdate;
  loadingUpdate;
  errorPreview: string;
  errorPreviewState;
  addState = false;

  // Image cropper
  imageChangedEvent: any = '';
  croppedImage: any = '';

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private af: AngularFirestore,
    private storage: AngularFireStorage
  ) {
    this.prepareForm();
  }

  ngOnInit() {
    this.refreshData();
  }

  // Load Data
  refreshData() {
    this.eventService.getItems().subscribe(data => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.events = data;
      this.events_length = data.length;
      // console.log('success', users);
    });
  }

  onSubmit() {

    this.succesUpdate = '';
    this.succesSubmit = '';
    this.errorSubmit = '';
    this.errorUpdate = '';
    this.uploading = true;
    this.loadingUpdate = false;
    this.disableForm();

    this.event = {
      id: this.af.createId(),
      name: this.eventName.value,
      startdate: this.eventStart.value,
      enddate: this.eventEnd.value,
      image: '',
      status: 'ongoing'
    };

    const imgBlob: Blob = this.dataURItoBlob(this.croppedImage, null);

    this.eventService.uploadImage(this.event, imgBlob)
      .then(() => {
        this.eventService.addEvent(this.event)
          .then(() => {
            this.storage.ref(`event/${this.event.id}/image`).getDownloadURL().subscribe(url => {
              this.event.image = url;
              this.eventService.updateEvent(this.event)
                .then(() => this.succesSubmit = 'Success, event added!')
                .then(() => this.errorSubmit = '')
                .then(() => this.uploading = false)
                .then(() => this.resetForm())
                .catch(error => [this.enableForm(), this.errorSubmit = error.message, this.uploading = false]);
            });
          })
          .catch(error => [this.enableForm(), this.errorSubmit = error.message, this.uploading = false]);
      })
      .catch(error => [this.enableForm(), this.errorSubmit = error.message, this.uploading = false])
      ;
  }

  updateEvent($event, event) {
    return this.eventService.addEvent(event);
  }

  deleteEvent($event, event) {
    return this.eventService.deleteEvent(event);
  }

  resetForm() {
    this.enableForm();
    this.eventForm.reset();
    this.errorPreview = '';
    this.errorPreviewState = false;

    this.imageChangedEvent = '';
    this.croppedImage = '';

    return false;
  }

  disableForm() {
    this.eventName.disable();
    this.eventStart.disable();
    this.eventEnd.disable();
    this.eventImage.disable();
  }

  enableForm() {
    this.eventName.enable();
    this.eventStart.enable();
    this.eventEnd.enable();
    this.eventImage.enable();
  }

  prepareForm() {
    this.eventForm = this.fb.group({
      eventName: ['', [Validators.required]],
      eventStart: ['', [Validators.required]],
      eventEnd: ['', [Validators.required]],
      eventImage: ['', [Validators.required]],
    });
  }

  get eventName() { return this.eventForm.get('eventName'); }
  get eventStart() { return this.eventForm.get('eventStart'); }
  get eventEnd() { return this.eventForm.get('eventEnd'); }
  get eventImage() { return this.eventForm.get('eventImage'); }

  setEditForm($event, event: Event) {
    this.eventName.reset(event.name);
    this.eventStart.reset(event.startdate);
    this.eventEnd.reset(event.enddate);
    // this.eventImage.reset(event.gender);
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

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
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

  toggleAdding() {
    if (this.addState) {
      this.addState = false;
    } else {
      this.addState = true;
    }
  }
}
