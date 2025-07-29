import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Message } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';

import { AuthService } from '../../services/auth.service';
import { passwordsMatchValidator } from '../../validators/passwords-match.validator';



@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,

    ButtonModule,
    InputTextModule,
    MessagesModule,
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent implements OnInit{

  fb = inject(FormBuilder);
  showMessage = signal(false);
  isPosting = signal(false);
  router = inject(Router)

  authService = inject(AuthService);

  messages!: Message[];

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    lastname: ['', [Validators.required]],
    lastname2: ['', [Validators.required]],
    institution: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password2: ['', [Validators.required, Validators.minLength(6)]],
  },
  { validators: passwordsMatchValidator() }
  );
  ngOnInit(): void {
    this.messages = [
      { severity: 'error', detail: 'Por favor verifique la información ingresada.' },
    ];
  }

  onSubmit(){
    if( this.registerForm.invalid ){
      this.showMessage.set(true);
      setTimeout(() => {
        this.showMessage.set(false)
      }, 2000);
      return;
    }

    const { name='', lastname='', lastname2='', institution='', email = '', password = ''} = this.registerForm.value;

    this.authService.register(name!, lastname!, lastname2!, institution!, email!, password!).subscribe((isRegistered) => {

      if( isRegistered ){
        this.messages = [
          { severity: 'success', detail: 'Registro exitoso. Revisa tu correo para activar tu cuenta.' },
        ];
        this.registerForm.reset();
      }

      this.showMessage.set(true);
      setTimeout(() => {
        this.showMessage.set(false)
      }, 5000);
    })

  }

}
