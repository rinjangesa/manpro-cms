import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { AppComponent } from '../../app.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  // Table
  displayedColumns = ['action', 'joindate', 'username', 'email', 'phonenumber', 'role'];
  dataSource = new MatTableDataSource<User>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  currentID;

  addState = false;
  navbarJumper = false;
  userForm: FormGroup;
  users: User[];
  user: User;
  users_length: number;
  errorSubmit;
  succesSubmit;
  uploading = false;
  errorUpdate;
  succesUpdate;
  loadingUpdate;

  privatList = [
    {
      id: 1,
      name: 'Bahasa Jepang'
    },
    {
      id: 2,
      name: 'Bahasa Inggris'
    }
  ];
  checkedList = [];
  navigationSubscription;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private mainComponent: AppComponent) {
    this.formValidators();
  }

  ngOnInit() {
    this.refreshData();
  }

  // Load Data
  refreshData() {
    this.userService.getItems().subscribe(users => {
      this.dataSource.data = users;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.users = users;
      this.users_length = users.length;
      // console.log('success', users);
    });
  }

  // Using getters will make your code look pretty
  get inputName() { return this.userForm.get('userFormName'); }
  get inputEmail() { return this.userForm.get('userFormEmail'); }
  get inputNumber() { return this.userForm.get('userFormNumber'); }
  get inputGender() { return this.userForm.get('userFormGender'); }
  get inputInstitute() { return this.userForm.get('userFormInstitute'); }
  get inputRole() { return this.userForm.get('userFormRole'); }

  formValidators() {
    this.userForm = this.fb.group({
      userFormName: ['', Validators.required],
      userFormEmail: ['', [Validators.required, Validators.email]],
      userFormNumber: ['', Validators.required],
      userFormGender: ['M', Validators.required],
      userFormInstitute: ['Politeknik Negeri Malang', Validators.required],
      userFormRole: ['Student', Validators.required]
    });
  }

  setEditForm(user: User) {
    this.inputName.reset(user.username);
    this.inputEmail.reset(user.email);
    this.inputNumber.reset(user.phonenumber);
    this.inputGender.reset(user.gender);
    this.inputInstitute.reset(user.institute);
    this.inputRole.reset(user.role);
  }

  enableForm() {
    this.inputName.enable();
    this.inputEmail.enable();
    this.inputNumber.enable();
    this.inputGender.enable();
    this.inputInstitute.enable();
    this.inputRole.enable();
  }

  disableForm() {
    this.inputName.disable();
    this.inputEmail.disable();
    this.inputNumber.disable();
    this.inputGender.disable();
    this.inputInstitute.disable();
    this.inputRole.disable();
  }

  resetForm() {
    this.enableForm();
    this.userForm.reset();
    this.inputGender.reset('M');
    this.inputInstitute.reset('Politeknik Negeri Malang');
    this.inputRole.reset('Student');

    return false;
  }

  onSubmit() {

    this.succesUpdate = '';
    this.succesSubmit = '';
    this.errorSubmit = '';
    this.errorUpdate = '';
    this.uploading = true;
    this.loadingUpdate = false;
    this.disableForm();

    const nick: string = this.inputName.value;
    let inputNick = nick.substr(0, nick.indexOf(' '));

    if (!inputNick) {
      inputNick = nick;
    }

    this.user = {
      username: this.inputName.value.charAt(0).toUpperCase() + this.inputName.value.slice(1),
      nickname: inputNick,
      email: this.inputEmail.value.toLowerCase(),
      password: 'password',
      avatar: 'default',
      institute: this.inputInstitute.value,
      role: this.inputRole.value,
      gender: this.inputGender.value,
      status: inputNick + ' です、よろしく！',
      level: 1,
      exp: 0,
      money: 0,
      joindate: new Date(),
      phonenumber: this.inputNumber.value,
      title: 'Newbie',
      // tslint:disable-next-line:max-line-length
      usechar: 'https://firebasestorage.googleapis.com/v0/b/allnewjcclass.appspot.com/o/default%2Fplaceholder_char.png?alt=media&token=a08cbf10-841c-47e3-bcad-2b8d4c3942a1',
      // tslint:disable-next-line:max-line-length
      usedecor: 'https://firebasestorage.googleapis.com/v0/b/allnewjcclass.appspot.com/o/default%2Fplaceholder_decor.png?alt=media&token=f1c1ea28-7818-4b4c-9b42-e2fd66d04d29',
      // tslint:disable-next-line:max-line-length
      usewall: 'https://firebasestorage.googleapis.com/v0/b/allnewjcclass.appspot.com/o/default%2Fplaceholder_wall.jpg?alt=media&token=2fae1738-91ed-4fab-a129-dc8a99a1717f',
      idchar: 'Z9yIZYGHS0dZs5TtVob9'
    };

    this.userService.addUserAuth(this.user)
      .then(() => this.userService.addUser(this.user))
      .then(() => { this.user = { email: 'fadhlishobirin@gmail.com', password: 'password' }; })
      .then(() => this.userService.signInAuth(this.user)
        .then(() => this.succesSubmit = 'Success, new user registered!')
        .then(() => this.errorSubmit = '')
        .then(() => this.uploading = false)
        .then(() => this.resetForm())
        .catch(error => [this.enableForm(), this.errorSubmit = error.message, this.uploading = false])
      )
      .catch(error => [this.enableForm(), this.errorSubmit = error.message, this.uploading = false])
      ;

    // console.log(this.user);
  }

  updateUser(event, user: User) {

    this.succesSubmit = '';
    this.errorSubmit = '';
    this.uploading = false;
    this.succesUpdate = '';
    this.errorUpdate = '';
    this.loadingUpdate = 'Please wait, updating ...';

    return this.userService.signInAuth(user)
      .then(() => user.username = this.inputName.value)
      .then(() => user.email = this.inputEmail.value)
      .then(() => user.phonenumber = this.inputNumber.value)
      .then(() => user.institute = this.inputInstitute.value)
      .then(() => user.gender = this.inputGender.value)
      .then(() => user.role = this.inputRole.value)
      .then(() => this.userService.updateUser(user)
        .then(() => this.userService.updateUserAuth(user.email)
          .then(() => { this.user = { email: 'fadhlishobirin@gmail.com', password: 'password' }; })
          // .then(() => this.user.email = this.mainComponent.email.value)
          // .then(() => this.user.password = this.mainComponent.pass.value)
          .then(() => this.userService.signInAuth(this.user)
            .then(() => this.succesUpdate = 'Success, user updated!')
            .then(() => this.errorUpdate = '')
            .then(() => this.loadingUpdate = '')
            .then(() => this.resetForm())
            .catch(error => [this.succesUpdate = '', this.loadingUpdate = '', this.errorUpdate = error.message])
          )
          // .catch(error => [this.succesUpdate = '', this.loadingUpdate = '', this.errorUpdate = error.message])
        )
        // .catch(error => [this.succesUpdate = '', this.loadingUpdate = '', this.errorUpdate = error.message])
      )
      // .catch(error => [this.succesUpdate = '', this.loadingUpdate = '', this.errorUpdate = error.message])
      ;

  }

  deleteUser(event, user: User) {

    this.succesSubmit = '';
    this.errorSubmit = '';
    this.uploading = false;
    this.succesUpdate = '';
    this.errorUpdate = '';
    this.loadingUpdate = 'Please wait, deleting ...';

    return this.userService.signInAuth(user)
      .then(() => this.userService.deleteUser(user)
        .then(() => this.userService.deleteUserAuth())
        .then(() => this.mainComponent.loadingMessage = 'Delete succes, redirecting ...')
        .then(() => { this.user = { email: 'fadhlishobirin@gmail.com', password: 'password' }; })
        .then(() => this.userService.signInAuth(this.user)
          .then(() => this.succesUpdate = 'Success, user deleted!')
          .then(() => this.errorUpdate = '')
          .then(() => this.loadingUpdate = '')
          .catch(error => [this.succesUpdate = '', this.loadingUpdate = '', this.errorUpdate = error.message])
        )
        .catch(error => [this.succesUpdate = '', this.loadingUpdate = '', this.errorUpdate = error.message])
      )
      .catch(error => [this.succesUpdate = '', this.loadingUpdate = '', this.errorUpdate = error.message])
      ;
  }

  cekID() {
    this.currentID = this.userService.getCurrentUser().uid;
    // this.component.setSession();
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  toggleAdding() {
    if (this.addState) {
      this.addState = false;
    } else {
      this.addState = true;
    }
  }
}

