import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { News } from '../interfaces/news.interface';
import { environments } from '../../../../environments/environments';

@Injectable({providedIn: 'root'})
export class NewsService {

  private baseUrlStrapi: string = environments.baseUrlStrapi;
  private token: string = environments.strapiToken;

  constructor(private http: HttpClient) { }

  getNews():Observable<News>{

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    })

    return this.http.get<News>(`${ this.baseUrlStrapi }/api/noticias?populate=imagen`, { headers });
  }

}
