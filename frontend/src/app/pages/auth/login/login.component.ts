import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">❄️</div>
          <h1>SnowPro Core</h1>
          <p>Inicia sesión para continuar</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="tu@email.com" autocomplete="email" />
          </div>
          <div class="field">
            <label>Contraseña</label>
            <input type="password" formControlName="password" placeholder="••••••" autocomplete="current-password" />
          </div>
          <div class="error" *ngIf="error">{{ error }}</div>
          <button type="submit" [disabled]="loading" class="btn-primary">
            {{ loading ? 'Cargando...' : 'Iniciar sesión' }}
          </button>
        </form>

        <p class="switch">¿No tienes cuenta? <a routerLink="/register">Regístrate</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      background: #020b18;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      font-family: 'Inter', -apple-system, sans-serif;
    }
    .auth-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 40px 32px;
      width: 100%;
      max-width: 400px;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo { font-size: 48px; margin-bottom: 8px; }
    h1 { color: #f1f5f9; font-size: 24px; font-weight: 800; margin: 0 0 6px; }
    p { color: #64748b; margin: 0; font-size: 14px; }
    .field { margin-bottom: 16px; }
    label { display: block; color: #94a3b8; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    input {
      width: 100%; padding: 12px 14px; background: #0a1628;
      border: 1px solid #1e293b; border-radius: 10px;
      color: #f1f5f9; font-size: 14px; box-sizing: border-box;
      transition: border-color 0.15s; outline: none;
    }
    input:focus { border-color: #29b5e8; }
    .error { color: #ef4444; font-size: 13px; margin-bottom: 12px; }
    .btn-primary {
      width: 100%; padding: 14px;
      background: linear-gradient(135deg, #0369a1, #29b5e8);
      color: #fff; border: none; border-radius: 10px;
      font-size: 15px; font-weight: 700; cursor: pointer;
      transition: opacity 0.15s;
    }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .switch { text-align: center; margin-top: 20px; color: #64748b; font-size: 13px; }
    .switch a { color: #29b5e8; text-decoration: none; font-weight: 600; }
  `]
})
export class LoginComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  error = '';
  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => {
        this.error = e.error?.error || 'Error de conexión';
        this.loading = false;
      }
    });
  }
}
