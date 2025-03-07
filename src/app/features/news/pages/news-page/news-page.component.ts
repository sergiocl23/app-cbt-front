import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from '../../services/news.service';
import { NewsItem } from '../../interfaces/news.interface';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ThemeService } from '../../../../shared/services/theme.service';
import { Location } from '@angular/common';
import { MainLayoutPageComponent } from '../../../../core/main-layout-page/main-layout-page.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './news-page.component.html',
  styleUrls: ['./news-page.component.css']
})
export class NewsPageComponent implements OnInit, OnDestroy {
  public newsItem?: NewsItem;
  public isLoading: boolean = true;
  public isReadingMode: boolean = false;
  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService,
    private themeService: ThemeService,
    private location: Location
  ) {
    // Suscribirse al estado del modo lectura
    this.themeService.readingMode$.subscribe(
      mode => this.isReadingMode = mode
    );
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadNewsItem(id);
      }
    });
  }

  private loadNewsItem(id: string) {
    this.isLoading = true;
    this.newsService.getNewsById(id).subscribe({
      next: (news) => {
        // Asignar directamente la noticia, sin acceder a .data
        this.newsItem = news;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar la noticia:', error);
        this.isLoading = false;
      }
    });
  }

  // Método auxiliar para extraer la URL de imagen del objeto MediaItem de Strapi 5
  private extractMediaUrl(mediaItem: any): string | null {
    if (!mediaItem) return null;
    
    console.log('[DEBUG] Estructura de mediaItem en news-page:', mediaItem);
    
    // Verificar si es un objeto directo con URL
    if (typeof mediaItem === 'object' && mediaItem.url) {
      return mediaItem.url;
    }
    
    // Verificar si tiene la estructura data.attributes común en Strapi 5
    if (mediaItem.data && mediaItem.data.attributes) {
      const attrs = mediaItem.data.attributes;
      
      // Intentar obtener la URL directamente
      if (attrs.url) {
        return attrs.url;
      }
      
      // Intentar obtener formatos de imagen si están disponibles
      if (attrs.formats) {
        // Preferir formato mediano, pequeño, miniatura o cualquiera disponible en ese orden
        const format = attrs.formats.medium || attrs.formats.small || attrs.formats.thumbnail;
        if (format && format.url) {
          return format.url;
        }
      }
    }
    
    // Verificar si es un array, como suele ser con additionalImages
    if (Array.isArray(mediaItem.data)) {
      // Tomar el primer elemento si existe
      const firstItem = mediaItem.data[0];
      if (firstItem && firstItem.attributes) {
        const attrs = firstItem.attributes;
        if (attrs.url) {
          return attrs.url;
        }
        
        // Intentar obtener formatos de imagen
        if (attrs.formats) {
          const format = attrs.formats.medium || attrs.formats.small || attrs.formats.thumbnail;
          if (format && format.url) {
            return format.url;
          }
        }
      }
    }
    
    return null;
  }

  getImageUrl(): string {
    // Para noticias con imágenes en formato MEDIA
    if (this.newsItem?.featuredImage) {
      const mediaUrl = this.extractMediaUrl(this.newsItem.featuredImage);
      if (mediaUrl) {
        return mediaUrl;
      }
    }
    
    // Para noticias con mainImage o images en formato string
    return this.newsItem?.mainImage || 
           this.newsItem?.images?.[0] || 
           'assets/images/CBioceanicoTarapacafondo_blanco.png';
  }

  getFormattedDate(dateStr: string | undefined): Date {
    if (!dateStr) return new Date();
    return new Date(dateStr.replace(' ', 'T'));
  }

  getFormattedSourceUrl(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  toggleReadingMode() {
    this.themeService.toggleReadingMode();
  }

  goBack() {
    this.location.back();
  }

  // Obtener el estado del sidebar directamente del layout component
  get isSidebarExpanded() {
    return MainLayoutPageComponent.sidebarState;
  }

  ngOnDestroy(): void {
    // Reiniciar el modo lectura al salir de la página
    if (this.isReadingMode) {
      this.themeService.toggleReadingMode();
    }
    this.routeSub?.unsubscribe();
  }

  cleanHtmlTags(text: string): string {
    if (!text) return '';
    console.log('🔍 Contenido original:', text);
    const cleaned = text
      .replace(/<\/p>/gi, '\n\n')  // Reemplaza cierre </p> por doble salto de línea
      .replace(/<p[^>]*>/gi, '')    // Elimina etiqueta de apertura <p>
      .replace(/<br\s*\/?>/gi, '\n') // Reemplaza <br> por salto de línea
      .replace(/&nbsp;/gi, ' ')      // Reemplaza &nbsp; por espacio
      .replace(/<[^>]+>/g, '')       // Elimina cualquier otra etiqueta
      .trim();
    console.log('✅ Contenido limpio:', cleaned);
    return cleaned;
  }

  getContent(): string {
    if (!this.newsItem?.content) return '';
    return Array.isArray(this.newsItem.content) 
      ? this.newsItem.content[0]?.children?.[0]?.text || ''
      : this.newsItem.content as string;
  }
}
