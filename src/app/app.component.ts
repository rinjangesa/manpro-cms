import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';

  loginForm: FormGroup;
  auth: AuthService;

  errorMessage;
  loadingMessage;

  sessionEmail;
  sessionPass;

  admin = 'Admin';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
  ) {

    this.auth = authService;

    this.loginForm = fb.group({
      defaultFormEmail: ['', [Validators.required, Validators.email]],
      defaultFormPass: ['', [Validators.required]]
    });

  }

  get email() { return this.loginForm.get('defaultFormEmail'); }
  get pass() { return this.loginForm.get('defaultFormPass'); }

  logging() {
    this.errorMessage = '';
    this.loadingMessage = 'Please wait, signing in ...';

    this.sessionEmail = this.email.value;
    this.sessionPass = this.pass.value;

    return this.auth.signIn(this.sessionEmail, this.sessionPass)
      .then((firebaseUser) => this.auth.updating(firebaseUser))
      .then(() => this.authService.redirectHome())
      .then(() => this.loadingMessage = '')
      .catch(error => [this.errorMessage = error.message, this.loadingMessage = '']);
  }

}
