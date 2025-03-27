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

              <p class="snippet" *ngIf="item.snippet">{{item.snippet}}</p>
              <div class="news-meta">
                <span class="source">
                  <i class="pi pi-link"></i>
                  {{item.source}}
                </span>

                <span class="date" [title]="item.date | date:'full':'GMT-3':'es'">
                  <i class="pi pi-calendar"></i>
                  {{item.date | date:'dd MMM, yyyy HH:mm':'GMT-3':'es'}}
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
      align-items: start;
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
    .snippet {
      margin: 0 0 0.5rem 0;
      font-size: 0.85rem;
      line-height: 1.4;
      color: #666;
    }
    .news-link:hover .snippet {
      color: rgba(255, 255, 255, 0.9);
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

      align-self: flex-start;
      margin-top: 0.2rem;
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
        console.log('Respuesta completa de Google News API:', response);
        
        this.newsItems = response.items.map((item: any) => {
          console.log('==== DATOS DISPONIBLES PARA GUARDAR EN BD ====');
          console.log('ID/Link único:', item.link);
          console.log('Título:', item.title);
          console.log('URL origen:', item.link);
          console.log('Fuente:', item.displayLink);
          console.log('Snippet:', item.snippet);
          
          // Revisar y mostrar todos los metadatos disponibles
          if (item.pagemap?.metatags?.[0]) {
            console.log('--- METADATOS DISPONIBLES ---');
            const metadatos = item.pagemap.metatags[0];
            Object.keys(metadatos).forEach(key => {
              console.log(`${key}: ${metadatos[key]}`);
            });
          }
          
          // Revisar imágenes disponibles
          console.log('--- IMÁGENES DISPONIBLES ---');
          if (item.pagemap?.cse_thumbnail?.[0]?.src) {
            console.log('Thumbnail:', item.pagemap.cse_thumbnail[0].src);
          }
          if (item.pagemap?.cse_image?.[0]?.src) {
            console.log('Imagen principal:', item.pagemap.cse_image[0].src);
          }
          if (item.pagemap?.metatags?.[0]?.['og:image']) {
            console.log('Imagen OG:', item.pagemap.metatags[0]['og:image']);
          }
          
          // Revisar información de artículo si existe
          if (item.pagemap?.newsarticle) {
            console.log('--- DATOS DE ARTÍCULO ---');
            const article = item.pagemap.newsarticle[0];
            Object.keys(article).forEach(key => {
              console.log(`${key}: ${article[key]}`);
            });
          }
          
          // Intentar obtener la fecha de múltiples fuentes posibles
          let publishedDate: Date | null = null;
          
          // Intento 1: De los metadatos OpenGraph article:published_time
          if (item.pagemap?.metatags?.[0]?.['article:published_time']) {
            const dateStr = item.pagemap.metatags[0]['article:published_time'];
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              publishedDate = parsedDate;
              console.log(`Fecha obtenida de article:published_time: ${dateStr}`);
            }
          }
          
          // Intento 2: De los metadatos date
          if (!publishedDate && item.pagemap?.metatags?.[0]?.['date']) {
            const dateStr = item.pagemap.metatags[0]['date'];
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              publishedDate = parsedDate;
              console.log(`Fecha obtenida de metatags.date: ${dateStr}`);
            }
          }
          
          // Intento 3: De newsarticle.datepublished
          if (!publishedDate && item.pagemap?.newsarticle?.[0]?.datepublished) {
            const dateStr = item.pagemap.newsarticle[0].datepublished;
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              publishedDate = parsedDate;
              console.log(`Fecha obtenida de newsarticle.datepublished: ${dateStr}`);
            }
          }
          
          // Intento 4: Buscar una fecha en el snippet 
          if (!publishedDate && item.snippet) {
            // Patrón común de fechas en formato "DD Month YYYY" o "Month DD, YYYY"
            const datePattern = /\b(\d{1,2})\s+(de\s+)?([A-Za-zá-úÁ-Ú]+)(\s+de)?\s+(\d{4})\b|\b([A-Za-zá-úÁ-Ú]+)\s+(\d{1,2})(,|\s+de)?\s+(\d{4})\b/;
            const match = item.snippet.match(datePattern);
            
            if (match) {
              // Intentar parsear la fecha encontrada en el snippet
              try {
                const dateStr = match[0];
                // Convertir mes en español a número si es necesario
                let processedDate = dateStr;
                const monthsES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
                monthsES.forEach((month, index) => {
                  if (dateStr.toLowerCase().includes(month)) {
                    processedDate = dateStr.toLowerCase().replace(month, (index + 1).toString());
                  }
                });
                
                const parsedDate = new Date(processedDate);
                if (!isNaN(parsedDate.getTime())) {
                  publishedDate = parsedDate;
                  console.log(`Fecha extraída del snippet: ${dateStr}`);
                }
              } catch (e) {
                console.log('Error al parsear fecha del snippet:', e);
              }
            }
          }
          
          // Si ninguna de las fuentes anteriores funcionó, usar la fecha actual
          if (!publishedDate) {
            publishedDate = new Date();
            console.log('Usando fecha actual como fallback');
          }
          
          // Preparar y mostrar el objeto final que se podría guardar en BD
          const newsItemToSave = {
            title: item.title,
            link: item.link,
            source: item.displayLink,
            snippet: item.snippet || item.pagemap?.metatags?.[0]?.['og:description'] || '',
            publishedDate: publishedDate,
            imageUrl: item.pagemap?.cse_thumbnail?.[0]?.src ||
                    item.pagemap?.cse_image?.[0]?.src ||
                    item.pagemap?.metatags?.[0]?.['og:image'] ||
                    'assets/images/news-placeholder.jpg',
            // Campos adicionales que se podrían guardar
            description: item.pagemap?.metatags?.[0]?.['og:description'] || '',
            author: item.pagemap?.metatags?.[0]?.['author'] || item.pagemap?.newsarticle?.[0]?.author || '',
            category: item.pagemap?.metatags?.[0]?.['article:section'] || '',
            language: item.pagemap?.metatags?.[0]?.['og:locale'] || 'es',
            contentType: 'external',  // Marcar como contenido externo
            createdAt: new Date(),    // Fecha de guardado en la BD
            updatedAt: new Date()     // Fecha de actualización en la BD
          };
          
          console.log('OBJETO FINAL PARA GUARDAR EN BD:', newsItemToSave);
          console.log('===========================================');
          
          // Devolver solo lo necesario para mostrar en la UI
          return {
            title: item.title,
            link: item.link,
            source: item.displayLink,
            snippet: item.snippet || item.pagemap?.metatags?.[0]?.['og:description'] || '',
            date: publishedDate,
            image: item.pagemap?.cse_thumbnail?.[0]?.src ||
                  item.pagemap?.cse_image?.[0]?.src ||
                  item.pagemap?.metatags?.[0]?.['og:image'] ||
                  'assets/images/news-placeholder.jpg'
          };
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching news:', error);
        this.loading = false;
      }
    });
  }
} 