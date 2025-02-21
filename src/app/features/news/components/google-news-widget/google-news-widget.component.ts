import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environments } from '@environments/environments';

@Component({
  selector: 'app-google-news-widget',
  template: `
    <div class="news-widget">
      <div class="widget-header">
        <h3>
          <i class="pi pi-globe"></i>
          Últimas noticias relacionadas
        </h3>
        <button class="refresh-btn" (click)="searchNews()" [disabled]="loading">
          <i class="pi pi-refresh" [class.spinning]="loading"></i>
        </button>
      </div>
      <div class="news-list">
        <div *ngFor="let item of newsItems" class="news-item">
          <a [href]="item.link" target="_blank" class="news-link">
            <div class="news-image" *ngIf="item.image">
              <img [src]="item.image" [alt]="item.title">
            </div>
            <div class="news-content">
              <h4>{{item.title}}</h4>
              <div class="news-meta">
                <span class="source">
                  <i class="pi pi-link"></i>
                  {{item.source}}
                </span>
                <span class="date">
                  <i class="pi pi-calendar"></i>
                  {{item.date | date:'dd MMM, yyyy'}}
                </span>
              </div>
            </div>
            <i class="pi pi-external-link link-icon"></i>
          </a>
        </div>
        <div *ngIf="loading" class="loading">
          <i class="pi pi-spin pi-spinner"></i>
          Cargando noticias...
        </div>
        <div *ngIf="!loading && newsItems.length === 0" class="no-results">
          No se encontraron noticias relacionadas
        </div>
      </div>
    </div>
  `,
  styles: [`
    .news-widget {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      height: calc(100vh - 2rem);
      width: 100%;
    }
    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }
    h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #202445;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .refresh-btn {
      background: none;
      border: none;
      color: #36A9E1;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.2s;
    }
    .refresh-btn:hover {
      background: rgba(54, 169, 225, 0.1);
    }
    .refresh-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .spinning {
      animation: spin 1s linear infinite;
    }
    .news-list {
      max-height: calc(100vh - 4rem);
      overflow-y: auto;
      padding: 0.5rem;
    }
    .news-item {
      transition: transform 0.2s;
    }
    .news-item:hover {
      transform: translateX(5px);
    }
    .news-link {
      display: grid;
      grid-template-columns: 150px 1fr auto;
      gap: 1rem;
      padding: 1rem;
      margin: 0.5rem 0;
      background: #f8f9fa;
      border-radius: 8px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;
      align-items: center;
    }
    .news-link:hover {
      background: #36A9E1;
      color: white;
    }
    .news-image {
      width: 150px;
      height: 100px;
      border-radius: 6px;
      overflow: hidden;
      background: #eee;
    }
    .news-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }
    .news-link:hover .news-image img {
      transform: scale(1.05);
    }
    .news-content {
      flex: 1;
    }
    h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.95rem;
      line-height: 1.4;
    }
    .news-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: inherit;
      opacity: 0.8;
    }
    .source, .date {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    .link-icon {
      font-size: 1rem;
      opacity: 0.7;
    }
    .loading, .no-results {
      padding: 2rem;
      text-align: center;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @media (max-width: 600px) {
      .news-link {
        grid-template-columns: 1fr auto;
      }
      .news-image {
        display: none;
      }
    }
  `]
})
export class GoogleNewsWidgetComponent implements OnInit {
  newsItems: any[] = [];
  loading = true;
  
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.searchNews();
  }

  searchNews() {
    const query = encodeURIComponent('Corredor Bioceánico');
    const url = `https://www.googleapis.com/customsearch/v1?key=${environments.googleNewsApiKey}&cx=${environments.googleNewsSearchEngineId}&q=${query}&dateRestrict=m1&num=10`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        this.newsItems = response.items.map((item: any) => ({
          title: item.title,
          link: item.link,
          source: item.displayLink,
          date: new Date(item.pagemap?.metatags?.[0]?.['article:published_time'] || new Date()),
          image: item.pagemap?.cse_thumbnail?.[0]?.src ||
                item.pagemap?.cse_image?.[0]?.src ||
                item.pagemap?.metatags?.[0]?.['og:image'] ||
                'assets/images/news-placeholder.jpg'
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching news:', error);
        this.loading = false;
      }
    });
  }
} 