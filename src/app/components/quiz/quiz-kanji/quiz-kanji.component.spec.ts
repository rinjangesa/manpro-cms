import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizKanjiComponent } from './quiz-kanji.component';

describe('QuizKanjiComponent', () => {
  let component: QuizKanjiComponent;
  let fixture: ComponentFixture<QuizKanjiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuizKanjiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizKanjiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
