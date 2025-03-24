import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Message } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,

    ButtonModule,
    InputTextModule,
    MessagesModule
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnInit{

  fb = inject(FormBuilder);
  hasError = signal(false);
  isPosting = signal(false);
  router = inject(Router)

  authService = inject(AuthService);

  messages!: Message[];

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    this.messages = [
      { severity: 'error', detail: 'Por favor verifique la información ingresada.' },
  ];
  }

  onSubmit(){
    if( this.loginForm.invalid ){
      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false)
      }, 2000);
      return;
    }

    const { email = '', password = ''} = this.loginForm.value;

    // console.log({email, password});

    this.authService.login(email!, password!).subscribe((isAuthenticated) => {

      if( isAuthenticated ){
        this.router.navigateByUrl('/');
        return;
      }

      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false)
      }, 2000);
    })

  }

}
