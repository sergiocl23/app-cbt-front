import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company } from '../interfaces/company.interface';
import { environments } from '../../../../environments/environments';

@Injectable({providedIn: 'root'})
export class CompaniesService {

  private baseUrlStrapi: string = environments.baseUrlStrapi;
  private token: string = environments.strapiToken;

  constructor(private http: HttpClient) { }

  getPoints():Observable<Company[]>{

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    })
    return this.http.get<Company[]>(`${ this.baseUrlStrapi }/api/companies?populate=*`, { headers });
  }

}
