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
    // Desplazar al inicio de la página cuando se carga el componente
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }

    this.routeSub = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadNewsItem(id);
      }
    });
  }

  private loadNewsItem(id: string) {
    this.isLoading = true;
    
    // Primero intentamos cargar con el método normal
    this.newsService.getNewsById(id).subscribe({
      next: (news) => {
        console.log("==================== DATOS DE NOTICIA ====================");
        console.log("[DEBUG] ID de la noticia:", id);
        console.log("[DEBUG] Noticia cargada con getNewsById:", news);
        console.log("[DEBUG] mainImage:", news.mainImage);
        console.log("[DEBUG] featuredImage:", news.featuredImage);
        console.log("[DEBUG] additionalImages:", news.additionalImages);
        console.log("[DEBUG] manualCreation:", news.manualCreation);
        console.log("[DEBUG] sourceUrl:", news.sourceUrl);
        console.log("[DEBUG] content:", news.content);
        console.log("==========================================================");
        
        // Si es una noticia manual, no tiene imágenes, o no tiene contenido, cargamos los datos completos
        if (news.manualCreation === true || !news.mainImage || !news.content) {
          console.log("[DEBUG] Cargando datos completos para noticia:", id);
          this.loadCompleteNewsItem(id);
        } else {
          // Es una noticia normal con datos completos
          this.newsItem = news;
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('[ERROR] Error al cargar la noticia:', error);
        // Si falla, intentamos con el método completo
        this.loadCompleteNewsItem(id);
      }
    });
  }

  private loadCompleteNewsItem(id: string) {
    this.newsService.getNewsComplete(id).subscribe({
      next: (newsData) => {
        console.log("================ DATOS COMPLETOS DE NOTICIA ================");
        console.log("[DEBUG] Noticia completa cargada:", newsData);
        console.log("[DEBUG] mainImage:", newsData.mainImage);
        console.log("[DEBUG] featuredImage:", newsData.featuredImage);
        console.log("[DEBUG] additionalImages:", newsData.additionalImages);
        console.log("[DEBUG] manualCreation:", newsData.manualCreation);
        console.log("[DEBUG] images array:", newsData.images);
        console.log("[DEBUG] content:", newsData.content);
        console.log("============================================================");
        
        // Asegurar que el contenido esté en el formato esperado
        let formattedContent;
        
        // Si no hay contenido, intentar usar el resumen como contenido
        if (!newsData.content && newsData.summary) {
          console.log("[DEBUG] Usando summary como contenido ya que content está vacío");
          formattedContent = [{ type: 'paragraph', children: [{ text: newsData.summary }] }];
        } else if (typeof newsData.content === 'string') {
          // Si es HTML o texto plano
          formattedContent = [{ type: 'paragraph', children: [{ text: newsData.content }] }];
        } else if (Array.isArray(newsData.content)) {
          // Si ya es un array
          formattedContent = newsData.content;
        } else {
          // Caso de fallback
          formattedContent = [{ type: 'paragraph', children: [{ text: 'Sin contenido disponible. Por favor visite la fuente original para más información.' }] }];
        }
        
        // Procesar mainImage: usar la primera de images array si existe y mainImage no está disponible
        const mainImage = newsData.mainImage || 
                         (newsData.images && newsData.images.length > 0 ? newsData.images[0] : null);
        
        this.newsItem = {
          ...newsData,
          // Aseguramos que las propiedades estén definidas correctamente
          content: formattedContent,
          mainImage: mainImage,
          featuredImage: newsData.featuredImage || null,
          additionalImages: newsData.additionalImages || [],
          images: newsData.images || [],
          tags: newsData.tags || []
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[ERROR] Error al cargar datos completos:', error);
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
    console.log("[DEBUG getImageUrl] Datos de imagen disponibles:");
    console.log("[DEBUG getImageUrl] newsItem?.mainImage:", this.newsItem?.mainImage);
    console.log("[DEBUG getImageUrl] newsItem?.featuredImage:", this.newsItem?.featuredImage);
    console.log("[DEBUG getImageUrl] newsItem?.additionalImages:", this.newsItem?.additionalImages);
    console.log("[DEBUG getImageUrl] newsItem?.images:", this.newsItem?.images);
    
    // Primero verificamos si hay una URL directa en mainImage para noticias scrapeadas
    if (this.newsItem?.mainImage && this.isValidUrl(this.newsItem.mainImage)) {
      console.log("[DEBUG getImageUrl] Usando mainImage directamente:", this.newsItem.mainImage);
      return this.newsItem.mainImage;
    }
    
    // Para noticias con imágenes en formato MEDIA
    if (this.newsItem?.featuredImage) {
      console.log("[DEBUG getImageUrl] Usando featuredImage:", this.newsItem.featuredImage);
      
      // Si es un objeto con URL directa
      if (typeof this.newsItem.featuredImage === 'object' && this.newsItem.featuredImage.url) {
        console.log("[DEBUG getImageUrl] Usando URL directa:", this.newsItem.featuredImage.url);
        return this.newsItem.featuredImage.url;
      }
      
      // Si tiene formatos, preferir medium o small
      if (this.newsItem.featuredImage.formats) {
        if (this.newsItem.featuredImage.formats.medium?.url) {
          return this.newsItem.featuredImage.formats.medium.url;
        } else if (this.newsItem.featuredImage.formats.small?.url) {
          return this.newsItem.featuredImage.formats.small.url;
        }
      }
      
      // Intentar extraer la URL con el método auxiliar
      const mediaUrl = this.extractMediaUrl(this.newsItem.featuredImage);
      if (mediaUrl) {
        console.log("[DEBUG getImageUrl] URL extraída:", mediaUrl);
        return mediaUrl;
      }
    }
    
    // Si hay additionalImages, usar la primera
    if (this.newsItem?.additionalImages && this.newsItem.additionalImages.length > 0) {
      const firstImage = this.newsItem.additionalImages[0];
      console.log("[DEBUG getImageUrl] Intentando usar additionalImages[0]:", firstImage);
      
      // Si es un objeto con URL directa
      if (typeof firstImage === 'object' && firstImage.url) {
        return firstImage.url;
      }
      
      // Si tiene formatos, preferir medium o small
      if (firstImage.formats) {
        if (firstImage.formats.medium?.url) {
          return firstImage.formats.medium.url;
        } else if (firstImage.formats.small?.url) {
          return firstImage.formats.small.url;
        }
      }
      
      // Intentar extraer la URL con el método auxiliar
      const mediaUrl = this.extractMediaUrl(firstImage);
      if (mediaUrl) {
        return mediaUrl;
      }
    }
    
    // Verificar si hay imágenes en formato de array de strings (campo 'images')
    if (this.newsItem?.images && Array.isArray(this.newsItem.images) && this.newsItem.images.length > 0) {
      console.log("[DEBUG getImageUrl] Usando primera imagen del array:", this.newsItem.images[0]);
      
      // Verificar si la imagen es una URL válida
      const imageUrl = this.newsItem.images[0];
      if (this.isValidUrl(imageUrl)) {
        return imageUrl;
      }
    }
    
    console.log("[DEBUG getImageUrl] No se encontró ninguna imagen, usando imagen predeterminada");
    return 'assets/images/CBioceanicoTarapacafondo_blanco.png';
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
      .replace(/\n\s*\n/g, '\n\n')   // Normaliza múltiples saltos de línea
      .replace(/\s+/g, ' ')          // Normaliza espacios múltiples
      .trim();
    console.log('✅ Contenido limpio:', cleaned);
    return cleaned;
  }

  getContent(): string {
    // Si no hay noticia o contenido, devolver mensaje informativo
    if (!this.newsItem) return 'Noticia no disponible';
    if (!this.newsItem.content) {
      // Si hay URL de origen, sugerir visitar la fuente original
      if (this.newsItem.sourceUrl) {
        return `Esta noticia no tiene contenido completo disponible. Por favor, visite la fuente original para más información.`;
      }
      return 'Contenido no disponible';
    }
    
    // Si el contenido es un string directo
    if (typeof this.newsItem.content === 'string') {
      return this.cleanHtmlTags(this.newsItem.content);
    }
    
    // Si es un array (formato estructurado)
    if (Array.isArray(this.newsItem.content)) {
      let fullContent = '';
      
      // Recorrer todos los bloques de contenido
      for (const block of this.newsItem.content) {
        // Usar acceso seguro con any para evitar errores de tipo
        const blockAny = block as any;
        
        // Manejar diferentes formatos de bloque
        if (blockAny.type === 'paragraph' && blockAny.children) {
          // Procesar bloques de párrafo con children
          for (const child of blockAny.children) {
            if (child.text) {
              fullContent += child.text;
            }
          }
          fullContent += '\n\n'; // Doble salto de línea entre párrafos
        } else if (blockAny.children && Array.isArray(blockAny.children)) {
          // Procesar bloques generales con children
          for (const child of blockAny.children) {
            if (child.text) {
              fullContent += child.text;
            }
          }
          fullContent += '\n\n';
        } else if (blockAny.text) {
          // Bloque con texto directo
          fullContent += blockAny.text + '\n\n';
        } else if (blockAny.content) {
          // Bloque con propiedad content
          fullContent += blockAny.content + '\n\n';
        }
      }
      
      // Si hay contenido, devolverlo, si no, buscar alternativas
      if (fullContent.trim()) {
        return fullContent;
      }
      
      // Intentar extraer cualquier texto posible como último recurso
      try {
        return JSON.stringify(this.newsItem.content, null, 2);
      } catch (e) {
        // Si todo falla, mensaje genérico
        return this.newsItem.sourceUrl 
          ? 'Contenido no disponible. Por favor, visite la fuente original para más información.' 
          : 'Contenido no disponible.';
      }
    }
    
    // Fallback final: convertir a string sea lo que sea
    return String(this.newsItem.content);
  }

  getAdditionalImageUrl(image: any): string {
    // Si es un objeto con URL directa
    if (typeof image === 'object' && image.url) {
      return image.url;
    }
    
    // Si tiene formatos, preferir medium o small
    if (image.formats) {
      if (image.formats.medium?.url) {
        return image.formats.medium.url;
      } else if (image.formats.small?.url) {
        return image.formats.small.url;
      } else if (image.formats.thumbnail?.url) {
        return image.formats.thumbnail.url;
      }
    }
    
    // Intentar extraer la URL con el método auxiliar
    const mediaUrl = this.extractMediaUrl(image);
    if (mediaUrl) {
      return mediaUrl;
    }
    
    return 'assets/images/CBioceanicoTarapacafondo_blanco.png';
  }

  // Método para verificar si una string es una URL válida
  private isValidUrl(url: string): boolean {
    if (!url) return false;
    
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }
}
