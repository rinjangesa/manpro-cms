import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes, Router } from '@angular/router';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {
  ButtonsModule,
  CarouselModule,
  ChartsModule,
  CollapseModule,
  DropdownModule,
  InputsModule,
  ModalModule,
  NavbarModule,
  PopoverModule,
  TooltipModule,
  WavesModule,
  MDBBootstrapModule
} from 'angular-bootstrap-md';

import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { ImageCropperModule } from 'ngx-image-cropper';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { LottieAnimationViewModule } from 'ng-lottie';
import { EditorModule } from '@tinymce/tinymce-angular';

import {
  MatCheckboxModule,
  MatFormFieldModule,
  MatInputModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatRadioModule,
  MatSelectModule,
  MatSortModule,
  MatTableModule
} from '@angular/material';

import { environment } from '../environments/environment';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireStorageModule } from 'angularfire2/storage';

import { FileSizePipe } from './pipes/file-size.pipe';
import { AuthGuard } from './core/auth.guard';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { UserComponent } from './components/user/user.component';
import { CharacterComponent } from './components/shop/character/character.component';
import { DecorationComponent } from './components/shop/decoration/decoration.component';
import { WallpaperComponent } from './components/shop/wallpaper/wallpaper.component';
import { EventComponent } from './components/event/event.component';
import { KanjiComponent } from './components/basic/kanji/kanji.component';
import { PhrasesComponent } from './components/basic/phrases/phrases.component';
import { GrammarComponent } from './components/basic/grammar/grammar.component';
import { QuizPhrasesComponent } from './components/quiz/quiz-phrases/quiz-phrases.component';
import { QuizGrammarComponent } from './components/quiz/quiz-grammar/quiz-grammar.component';
import { QuizKanjiComponent } from './components/quiz/quiz-kanji/quiz-kanji.component';

const appRoutes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'event', component: EventComponent, canActivate: [AuthGuard] },
  { path: 'shop/character', component: CharacterComponent, canActivate: [AuthGuard] },
  { path: 'shop/wallpaper', component: WallpaperComponent, canActivate: [AuthGuard] },
  { path: 'shop/decoration', component: DecorationComponent, canActivate: [AuthGuard] },
  { path: 'material/kanji', component: KanjiComponent, canActivate: [AuthGuard] },
  { path: 'material/phrases', component: PhrasesComponent, canActivate: [AuthGuard] },
  { path: 'material/grammar', component: GrammarComponent, canActivate: [AuthGuard] },
  { path: 'quiz/kanji', component: QuizKanjiComponent, canActivate: [AuthGuard] },
  { path: 'quiz/phrases', component: QuizPhrasesComponent, canActivate: [AuthGuard] },
  { path: 'quiz/grammar', component: QuizGrammarComponent, canActivate: [AuthGuard] },
  { path: 'user', component: UserComponent, canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    UserComponent,
    FileSizePipe,
    CharacterComponent,
    DecorationComponent,
    WallpaperComponent,
    EventComponent,
    KanjiComponent,
    PhrasesComponent,
    GrammarComponent,
    QuizPhrasesComponent,
    QuizGrammarComponent,
    QuizKanjiComponent
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      appRoutes, { onSameUrlNavigation: 'reload' }
      // { enableTracing: true } // <-- debugging purposes only
    ),
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonsModule,
    CarouselModule.forRoot(),
    ChartsModule,
    CollapseModule.forRoot(),
    DropdownModule.forRoot(),
    InputsModule.forRoot(),
    ModalModule.forRoot(),
    NavbarModule,
    PopoverModule.forRoot(),
    TooltipModule.forRoot(),
    WavesModule.forRoot(),
    MDBBootstrapModule.forRoot(),
    ScrollToModule.forRoot(),
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatRadioModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    ImageCropperModule,
    LazyLoadImageModule,
    LottieAnimationViewModule.forRoot(),
    EditorModule
  ],
  exports: [RouterModule],
  schemas: [NO_ERRORS_SCHEMA],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
