import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { PhraseCategory } from '../../models/quiz';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  navbarJumper = false;

  constructor(
    private af: AngularFirestore
  ) { }

  ngOnInit() {

  }

}
