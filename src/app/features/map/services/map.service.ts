import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Point } from '../interfaces/point.interface';
import { environments } from '../../../../environments/environments';

@Injectable({providedIn: 'root'})
export class MapService {

  private baseUrlStrapi: string = environments.baseUrlStrapi;
  private token: string = environments.strapiToken;

  constructor(private http: HttpClient) { }

  getPoints():Observable<Point>{

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    })

    return this.http.get<Point>(`${ this.baseUrlStrapi }/api/points`, { headers });
  }

}
