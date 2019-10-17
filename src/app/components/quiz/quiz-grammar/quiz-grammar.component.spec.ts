import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizGrammarComponent } from './quiz-grammar.component';

describe('QuizGrammarComponent', () => {
  let component: QuizGrammarComponent;
  let fixture: ComponentFixture<QuizGrammarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuizGrammarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizGrammarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
