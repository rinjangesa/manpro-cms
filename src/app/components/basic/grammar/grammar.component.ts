import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../../services/quiz.service';
import { Kanji, Phrase, Grammar, PhraseCategory } from '../../../models/quiz';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from '@firebase/util';
import { AngularFireUploadTask, AngularFireStorage } from 'angularfire2/storage';

@Component({
  selector: 'app-grammar',
  templateUrl: './grammar.component.html',
  styleUrls: ['./grammar.component.scss']
})
export class GrammarComponent implements OnInit {

  // Form
  selectedGrammarList = 'basic';
  grammarForm: FormGroup;

  // Upload Status
  upload = false;
  uploaded = false;
  snapshot: Observable<any>;

  // Data
  dataCounted;
  grammars: Grammar[];
  grammar: Grammar;

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
    this.quizService.getItemWithCondition('grammar', 'title', 'asc', 'tier', this.selectedGrammarList).subscribe(data => {
      this.grammars = data;
    });
  }

  // Form function
  get grammarTitle() { return this.grammarForm.get('grammarTitle'); }
  get grammarDesc() { return this.grammarForm.get('grammarDesc'); }

  onSubmitGrammar() {
    this.upload = true;
    this.uploaded = false;

    const newId = this.af.createId();

    this.grammar = {
      id: newId,
      title: this.grammarTitle.value.charAt(0).toUpperCase() + this.grammarTitle.value.slice(1),
      description: this.grammarDesc.value,
      tier: this.selectedGrammarList,
    };

    this.quizService.addItem('grammar', this.grammar)
      .then(() => this.resetForm())
      .then(() => this.upload = false)
      .then(() => this.uploaded = true)
      .catch(error => console.log(error))
      ;
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
    this.grammarForm.reset();

    return false;
  }

  prepareForm() {
    this.grammarForm = this.fb.group({
      grammarTitle: ['', [Validators.required]],
      grammarDesc: ['', [Validators.required]],
    });
  }

  editGrammar($event, item: Grammar) {
    this.grammarTitle.reset(item.title);
    this.grammarDesc.reset(item.description);
  }

  updateGrammar($event, item: Grammar) {
    this.upload = true;
    this.uploaded = false;

    item.title = this.grammarTitle.value.charAt(0).toUpperCase() + this.grammarTitle.value.slice(1);
    item.description = this.grammarDesc.value;
    item.tier = this.selectedGrammarList;

    this.quizService.addItem('grammar', this.grammar)
      .then(() => this.resetForm())
      .then(() => this.upload = false)
      .then(() => this.uploaded = true)
      .catch(error => console.log(error))
      ;
  }

  deleteGrammar($event, item) {
    return this.quizService.deleteItem('grammar', item);
  }

  grammarChangeListener($event) {
    // console.log($event);
    this.selectedGrammarList = $event.value;
    // console.log(this.selectedGrammarList);
    this.quizService.getItemWithCondition('grammar', 'title', 'asc', 'tier', this.selectedGrammarList).subscribe(data => {
      this.grammars = data;
    });
  }

  checkPhraseLength(word: string) {
    if (word.length >= 30) {
      return word.substr(0, 50) + '...';
    } else {
      return word;
    }
  }

}
