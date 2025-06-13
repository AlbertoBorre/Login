import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isLoginFormulario = true;
  loginFormulario: FormGroup;
  registroFormulario: FormGroup;
  cargando = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.isLogeado()) {
      this.router.navigate(['/inicio']);
    }

    this.loginFormulario = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.registroFormulario = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', Validators.required]
    }, {
      validator: this.coincidePassword('password', 'password2')
    });
  }

  coincidePassword(pass1: string, pass2: string) {
    return (formGroup: FormGroup) => {
      const pass = formGroup.controls[pass1];
      const coincidePass = formGroup.controls[pass2];

      if (coincidePass.errors && !coincidePass.errors['coincidePassword']) {
        return;
      }
      
      if (pass.value !== coincidePass.value) {
        coincidePass.setErrors({ coincidePassword: true });
      } else {
        coincidePass.setErrors(null);
      }
    };
  }

  cambiarFormulario(): void {
    this.isLoginFormulario = !this.isLoginFormulario;
    this.error = '';
  }

  get login() { return this.loginFormulario.controls; }
  get registro() { return this.registroFormulario.controls; }

  loginSubmit(): void {
    if (this.loginFormulario.invalid) {
      return;
    }
    this.cargando = true;
    this.error = '';

    this.authService.login(this.login['email'].value, this.login['password'].value)
      .subscribe({
        next: () => {
          this.router.navigate(['/inicio']);
        },
        error: error => {
          this.error = error.message || 'Ha ocurrido un error';
          this.cargando = false;
        }
      });
  }

  registroSubmit(): void {
    if (this.registroFormulario.invalid) {
      return;
    }
    this.cargando = true;
    this.error = '';

    this.authService.registro(this.registro['email'].value, this.registro['password'].value)
      .subscribe({
        next: () => {
          this.router.navigate(['/inicio']);
        },
        error: error => {
          this.error = error.message || 'Ha ocurrido un error';
          this.cargando = false;
        }
      });
  }
}
