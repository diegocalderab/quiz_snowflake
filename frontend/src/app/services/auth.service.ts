import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;
  user = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('sf_user');
    if (stored && this.token) this.user.set(JSON.parse(stored));
  }

  get token(): string | null {
    return localStorage.getItem('sf_token');
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: User }>(`${this.api}/login`, { email, password }).pipe(
      tap(({ token, user }) => {
        localStorage.setItem('sf_token', token);
        localStorage.setItem('sf_user', JSON.stringify(user));
        this.user.set(user);
      })
    );
  }

  register(name: string, email: string, password: string) {
    return this.http.post<{ token: string; user: User }>(`${this.api}/register`, { name, email, password }).pipe(
      tap(({ token, user }) => {
        localStorage.setItem('sf_token', token);
        localStorage.setItem('sf_user', JSON.stringify(user));
        this.user.set(user);
      })
    );
  }

  logout() {
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_user');
    this.user.set(null);
    this.router.navigate(['/login']);
  }
}
