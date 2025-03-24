import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-news-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Skeleton completo de página (carga inicial) -->
    <div class="skeleton-wrapper" *ngIf="!cardsOnly">
      <h2 class="featured-label">Última actualización</h2>
      
      <div class="featured-content-wrapper">
        <!-- Noticia Principal -->
        <div class="main-featured">
          <div class="featured-image pulse"></div>
          <div class="source-url pulse"></div>
        </div>

        <!-- Noticias Secundarias -->
        <div class="secondary-featured">
          <div class="secondary-item" *ngFor="let i of [1,2]">
            <div class="card-image pulse"></div>
            <div class="date-skeleton pulse"></div>
            <div class="title-skeleton pulse"></div>
            <div class="summary-skeleton">
              <div class="text-skeleton pulse"></div>
            </div>
            <div class="tags-skeleton">
              <div class="tag-skeleton pulse"></div>
              <div class="tag-skeleton pulse"></div>
            </div>
            <div class="source-url pulse"></div>
          </div>
        </div>
      </div>

      <!-- Sección de Noticias Anteriores -->
      <div class="news-section">
        <div class="news-section-header">
          <div class="filter-button pulse"></div>
          <h3>Noticias anteriores</h3>
        </div>
        
        <div class="news-grid">
          <div class="news-card" *ngFor="let i of [1,2,3,4,5,6]">
            <div class="card-image pulse"></div>
            <div class="card-content">
              <div class="date-skeleton pulse"></div>
              <div class="title-skeleton pulse"></div>
              <div class="summary-skeleton">
                <div class="text-skeleton pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Skeleton solo para tarjetas (cardsOnly = true) -->
    <div class="cards-skeleton-grid" *ngIf="cardsOnly">
      <div class="news-card-skeleton" *ngFor="let i of cardItems">
        <div class="card-image-skeleton pulse"></div>
        <div class="card-content-skeleton">
          <div class="date-line pulse"></div>
          <div class="title-line pulse"></div>
          <div class="summary-line pulse"></div>
          <div class="summary-line pulse" style="width: 85%;"></div>
          <div class="tags-area">
            <div class="tag-pill pulse"></div>
            <div class="tag-pill pulse"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-wrapper {
      padding: 1rem;
    }

    .featured-label {
      color: #202445;
      text-transform: uppercase;
      font-weight: 800;
      font-size: 1.2rem;
      letter-spacing: 1px;
      margin: 0 0 0.75rem 0;
      padding-bottom: 0.5rem;
      width: 100%;
      border-bottom: 2px solid #36A9E1;
    }

    .featured-content-wrapper {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 1.5rem;
    }

    .pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      background: #e0e0e0;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .main-featured {
      position: relative;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      height: 500px;
    }

    .featured-image {
      width: 100%;
      height: 500px;
      border-radius: 0;
    }

    .source-url {
      position: absolute;
      top: 1rem;
      right: 1rem;
      height: 2rem;
      width: 120px;
      border-radius: 4px;
    }

    .featured-content {
      padding: 1.5rem;
    }

    .date-skeleton {
      height: 1.2rem;
      width: 120px;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .title-skeleton {
      height: 2rem;
      width: 90%;
      border-radius: 4px;
      margin-bottom: 1.5rem;
    }

    .summary-skeleton {
      margin-bottom: 1.5rem;
    }

    .text-skeleton {
      height: 1rem;
      width: 100%;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .tags-skeleton {
      display: flex;
      gap: 0.5rem;
    }

    .tag-skeleton {
      height: 1.2rem;
      width: 60px;
      border-radius: 15px;
    }

    .secondary-featured {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .secondary-item {
      height: 240px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .secondary-item .card-image {
      height: 240px;
    }

    .secondary-item .card-content {
      padding: 0.8rem;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
      color: white;
    }

    .secondary-item .title-skeleton {
      height: 1.3rem;
      margin-bottom: 0.6rem;
      width: 90%;
    }

    .secondary-item .text-skeleton {
      height: 0.9rem;
      width: 85%;
    }

    .news-section {
      margin-top: 2rem;
    }

    .news-section-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .filter-button {
      width: 38px;
      height: 38px;
      border-radius: 6px;
    }

    .news-section h3 {
      color: #202445;
      font-size: 1.2rem;
      margin: 0;
    }

    .news-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .news-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      height: 160px;
    }

    .news-card .card-image {
      width: 160px;
      height: 160px;
      flex-shrink: 0;
    }

    .news-card .card-content {
      flex: 1;
      padding: 1rem;
    }

    .news-card .title-skeleton {
      height: 1.5rem;
      width: 85%;
      margin-bottom: 0.8rem;
    }

    .news-card .text-skeleton {
      width: 95%;
      height: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .tags-skeleton {
      margin-top: 0.8rem;
    }

    /* Estilos específicos para el skeleton de tarjetas */
    .cards-skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      width: 100%;
    }

    .news-card-skeleton {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      height: 380px;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .card-image-skeleton {
      width: 100%;
      height: 180px;
      background-color: #e0e0e0;
    }

    .card-content-skeleton {
      padding: 1rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .date-line {
      height: 15px;
      width: 120px;
      border-radius: 4px;
      margin-bottom: 0.8rem;
    }

    .title-line {
      height: 20px;
      width: 90%;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .summary-line {
      height: 12px;
      width: 100%;
      border-radius: 4px;
      margin-bottom: 0.6rem;
    }

    .tags-area {
      display: flex;
      gap: 0.5rem;
      margin-top: auto;
      padding-top: 1rem;
    }

    .tag-pill {
      height: 22px;
      width: 70px;
      border-radius: 15px;
    }

    @media (max-width: 992px) {
      .cards-skeleton-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 576px) {
      .cards-skeleton-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class NewsSkeletonComponent {
  @Input() cardsOnly: boolean = false;
  @Input() rows: number = 3;
  @Input() columns: number = 4;

  get cardItems(): number[] {
    const totalItems = this.rows * this.columns;
    return Array(totalItems).fill(0).map((_, index) => index);
  }
} 