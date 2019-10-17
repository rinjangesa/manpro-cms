import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizPhrasesComponent } from './quiz-phrases.component';

describe('QuizPhrasesComponent', () => {
  let component: QuizPhrasesComponent;
  let fixture: ComponentFixture<QuizPhrasesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuizPhrasesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizPhrasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
