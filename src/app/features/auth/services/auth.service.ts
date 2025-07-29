import { computed, Inject, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { User } from '../interfaces/user.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environments } from '@environments/environments';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { CheckTokenResponse } from '../interfaces/check-token-response.interface';
import { isPlatformBrowser } from '@angular/common';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated'

@Injectable({providedIn: 'root'})
export class AuthService {
  private baseUrlStrapi: string = environments.baseUrlStrapi;
  private strapiToken: string = environments.strapiToken;

  private _authStatus = signal<AuthStatus>('checking')
  private _user = signal<User|null>(null);
  //
  private _token = signal<string|null>(null);

  private http = inject(HttpClient);

  authStatus = computed(() => {
    if (this._authStatus() === 'checking') return 'checking';

    if (this._user()){
      return 'authenticated';
    }
    return 'not-authenticated';
  })

  user = computed(()=> this._user());
  token = computed(()=> this._token());

  constructor(
    @Inject(PLATFORM_ID)
    private platformId: Object
  ){
    if (isPlatformBrowser(this.platformId)){
      this.checkStatus().subscribe();
    }
  }

  login( email: string, password: string):Observable<boolean>{
    return this.http.post<AuthResponse>(`${ this.baseUrlStrapi }/api/auth/local`, {
      identifier: email,
      password: password
    }).pipe(
      // map( resp => this.handleAuthSuccess(resp.user, resp.jwt)),
      // catchError((error)=> this.handleAuthError())
      switchMap(resp => {
      const token = resp.jwt;
      localStorage.setItem('token', token);

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // Hace la segunda petición para obtener el user con el rol
      return this.http.get<CheckTokenResponse>(`${this.baseUrlStrapi}/api/users/me?populate=role`, { headers })
        .pipe(
          map(userResp => this.handleAuthSuccess(userResp, token))
        );
    }),
    catchError(() => this.handleAuthError())
    );
  }

  register(name: string, lastname: string, lastname2: string, institution: string, email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${this.baseUrlStrapi}/api/auth/local/register`, {
      username: email,
      email: email,
      password: password,
    }).pipe(
      switchMap(resp => {
        const jwt = resp.jwt;
        const userId = resp.user.id;

        localStorage.setItem('token', jwt);

        const updateHeaders = new HttpHeaders({
          'Authorization': `Bearer ${this.strapiToken}`
        });

        const updateData = {
          name: name,
          lastName: lastname,
          lastName2: lastname2,
          institution: institution,
          confirmed: false
        };

      return this.http.put(`${this.baseUrlStrapi}/api/users/${userId}`, updateData, { headers: updateHeaders }).pipe(
          map(() => {
            // No autenticamos al usuario aún
            return true;
          })
        );
      }),
      catchError(() => this.handleAuthError())
    );
  }

  checkStatus(): Observable<boolean>{
    const token = localStorage.getItem('token');
    if(!token){
      this.logout();
      return of(false)
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })

    return this.http.get<CheckTokenResponse>(`${ this.baseUrlStrapi }/api/users/me?populate=role`, { headers })
      .pipe(
        map( resp => this.handleAuthSuccess(resp, token)),
        catchError((error)=> this.handleAuthError())
      );
  }

  logout(){
    this._user.set(null);
    this._token.set(null);
    this._authStatus.set('not-authenticated');
    localStorage.removeItem('token');
  }

  private handleAuthSuccess(user: User, token: string): boolean {
    if (!user.confirmed) {
     // No permitir autenticación si el usuario no ha confirmado su email
      return false;
    }
    this._user.set(user);
    this._authStatus.set('authenticated');
    this._token.set(token);
    localStorage.setItem('token', token);
    return true
  }

  private handleAuthError(): Observable<boolean> {
    this.logout()
    return of(false)
  }


}
