import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class GoogleNewsService {
  private apiUrl = 'https://news.google.com/rss/search?q=';
  private searchTerms = [
    'Corredor Bioceánico Chile Paraguay Brasil',
    'Corredor Bioceánico Vial noticias',
    'Corredor Bioceânico Brasil Chile Paraguai'
  ];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getNews(): Observable<{title: string, link: string}[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return new Observable(observer => observer.next([]));
    }

    const randomTerm = this.searchTerms[Math.floor(Math.random() * this.searchTerms.length)];
    const encodedTerm = encodeURIComponent(randomTerm + ' when:1d');
    const url = `${this.apiUrl}${encodedTerm}&hl=es-419&gl=CL&ceid=CL:es-419`;

    return this.http.get(url, { responseType: 'text' }).pipe(
      map(xml => this.parseNewsXML(xml))
    );
  }

  private parseNewsXML(xml: string): {title: string, link: string}[] {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const items = doc.getElementsByTagName('item');
      const news = [];

      for (let i = 0; i < items.length; i++) {
        const title = items[i].getElementsByTagName('title')[0]?.textContent?.trim() || '';
        const link = items[i].getElementsByTagName('link')[0]?.textContent?.trim() || '';
        if (title && link) {
          news.push({ title, link });
        }
      }
      return news.slice(0, 10);
    } catch (error) {
      console.error('Error parsing XML:', error);
      return [];
    }
  }
} 