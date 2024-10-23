import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { News, NewsItem } from '../interfaces/news.interface';
import { environments } from '../../../../environments/environments';

@Injectable({providedIn: 'root'})
export class NewsService {

  private baseUrlStrapi: string = environments.baseUrlStrapi;
  private token: string = "21bc162a629ef9597e4c42d46d7f381d96df53b15361b52ec75bcf3c254bbb6357505ae6a1a324d14387ae61be06384f18ef028565cc08129c7531ec0db3b0692b42a9ee40e06c5cc316f055e569e9fa26294ad3e885bd4557b72ff9328b515834397fe556d6c50978a917db1dab67f8893dd2d8cb5c0f67f5d6e2e9f90980db";

  constructor(private http: HttpClient) { }

  getNews():Observable<News>{

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    })

    return this.http.get<News>(`${ this.baseUrlStrapi }/api/noticias?populate=imagen`, { headers });
  }

}
