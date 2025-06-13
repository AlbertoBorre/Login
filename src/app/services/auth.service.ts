import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario';

interface AuthResponse {
  user: Usuario;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = '';
  private userActualBS = new BehaviorSubject<Usuario | null>(null);
  public userActual$ = this.userActualBS.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.comprobarAuthGuardado();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, { email, password })
      .pipe(
        tap(response => this.setSesion(response)),
        catchError(error => {
          console.error('Error al hacer login', error);
          return throwError(() => new Error(error.error?.message || error.statusText || 'Error al hacer login'));
        })
      );
  }

  registro(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/registro`, { email, password })
      .pipe(
        tap(response => this.setSesion(response)),
        catchError(error => {
          console.error('Error al registrarte', error);
          return throwError(() => new Error(error.error?.message || error.statusText || 'Error al registrarte'));
        })
      );
  }

  logout(): void {
    this.limpiarSesion();
    this.router.navigate(['/login']);
  }

  isLogeado(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setSesion({ user, token }: AuthResponse): void {
    localStorage.setItem('token', token);
    const userSinPass = { ...user };
    delete userSinPass.password;
    localStorage.setItem('user', JSON.stringify(userSinPass));
    this.userActualBS.next(userSinPass);
  }

  private limpiarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userActualBS.next(null);
  }

  private comprobarAuthGuardado(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user: Usuario = JSON.parse(userStr);
        this.userActualBS.next(user);
      } catch {
        this.limpiarSesion();
      }
    }
  }
}
