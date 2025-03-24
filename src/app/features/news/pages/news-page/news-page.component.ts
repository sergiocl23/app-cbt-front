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
  private originalImageUrl?: string;

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
        
        // Guardar la URL de la imagen original para uso posterior
        this.originalImageUrl = news.mainImage;
        
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
        
        // Procesar mainImage: buscar en todas las fuentes posibles
        let mainImage = null;
        
        // 0. Usar la imagen original guardada si existe
        if (this.originalImageUrl) {
          mainImage = this.originalImageUrl;
        }
        // Si no hay imagen original, intentar las demás opciones
        else if (newsData.mainImage && typeof newsData.mainImage === 'string' && this.isValidUrl(newsData.mainImage)) {
          mainImage = newsData.mainImage;
        } 
        else if (typeof newsData.mainImage === 'string' && newsData.mainImage.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i)) {
          mainImage = newsData.mainImage;
        }
        else if (newsData.featuredImage) {
          mainImage = newsData.featuredImage;
        }
        else if (newsData.images && newsData.images.length > 0) {
          mainImage = newsData.images[0];
        }
        else if (newsData.additionalImages && newsData.additionalImages.length > 0) {
          mainImage = newsData.additionalImages[0];
        }
        
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
    // Si no hay noticia, devolver imagen predeterminada
    if (!this.newsItem) {
      return 'assets/images/CBioceanicoTarapacafondo_blanco.png';
    }
    
    // 1. Si hay una URL de imagen directa en sourceUrl que tenga extensión de imagen
    if (this.newsItem.sourceUrl && 
        typeof this.newsItem.sourceUrl === 'string' && 
        this.newsItem.sourceUrl.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i)) {
      return this.newsItem.sourceUrl;
    }
    
    // 2. Verificar mainImage como URL directa (noticias scrapeadas)
    if (this.newsItem.mainImage && typeof this.newsItem.mainImage === 'string') {
      // Si mainImage es una URL válida
      if (this.isValidUrl(this.newsItem.mainImage)) {
        return this.newsItem.mainImage;
      }
      
      // O si tiene formato de ruta de imagen
      if (this.newsItem.mainImage.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i)) {
        return this.newsItem.mainImage;
      }
    }
    
    // 3. Verificar featuredImage (formato Strapi 5.0.5)
    if (this.newsItem.featuredImage) {
      // 3.1 Si featuredImage es un objeto con formato Strapi
      if (typeof this.newsItem.featuredImage === 'object') {
        const featuredImage = this.newsItem.featuredImage as any;
        
        // 3.1.1 Verificar si hay una URL directa
        if (featuredImage.url && typeof featuredImage.url === 'string') {
          return featuredImage.url;
        }
        
        // 3.1.2 Verificar formato data.attributes (común en Strapi 5.x)
        if (featuredImage.data && featuredImage.data.attributes) {
          const attrs = featuredImage.data.attributes;
          
          // URL directa en atributos
          if (attrs.url && typeof attrs.url === 'string') {
            return attrs.url;
          }
          
          // Formatos específicos en orden de preferencia
          if (attrs.formats) {
            if (attrs.formats.medium && attrs.formats.medium.url) {
              return attrs.formats.medium.url;
            }
            if (attrs.formats.small && attrs.formats.small.url) {
              return attrs.formats.small.url;
            }
            if (attrs.formats.thumbnail && attrs.formats.thumbnail.url) {
              return attrs.formats.thumbnail.url;
            }
            
            // Tomar el primer formato disponible si ninguno de los anteriores existe
            const formatKeys = Object.keys(attrs.formats);
            if (formatKeys.length > 0 && attrs.formats[formatKeys[0]].url) {
              return attrs.formats[formatKeys[0]].url;
            }
          }
        }
      }
      // 3.2 Si featuredImage es un string directo
      else if (typeof this.newsItem.featuredImage === 'string') {
        if (this.isValidUrl(this.newsItem.featuredImage)) {
          return this.newsItem.featuredImage;
        }
      }
    }
    
    // 4. Verificar additionalImages
    if (this.newsItem.additionalImages && Array.isArray(this.newsItem.additionalImages) && this.newsItem.additionalImages.length > 0) {
      const firstImage = this.newsItem.additionalImages[0] as any;
      
      // 4.1 Si es un string directamente (URL)
      if (typeof firstImage === 'string' && this.isValidUrl(firstImage)) {
        return firstImage;
      }
      
      // 4.2 Si es un objeto, extraer la URL
      if (typeof firstImage === 'object' && firstImage !== null) {
        // URL directa en el objeto
        if (firstImage.url && typeof firstImage.url === 'string') {
          return firstImage.url;
        }
        
        // Formatos de Strapi
        if (firstImage.formats) {
          if (firstImage.formats.medium && firstImage.formats.medium.url) {
            return firstImage.formats.medium.url;
          }
          if (firstImage.formats.small && firstImage.formats.small.url) {
            return firstImage.formats.small.url;
          }
          if (firstImage.formats.thumbnail && firstImage.formats.thumbnail.url) {
            return firstImage.formats.thumbnail.url;
          }
        }
        
        // Estructura data.attributes
        if (firstImage.data && firstImage.data.attributes) {
          const attrs = firstImage.data.attributes;
          if (attrs.url) {
            return attrs.url;
          }
          
          if (attrs.formats) {
            if (attrs.formats.medium && attrs.formats.medium.url) {
              return attrs.formats.medium.url;
            }
            if (attrs.formats.small && attrs.formats.small.url) {
              return attrs.formats.small.url;
            }
            if (attrs.formats.thumbnail && attrs.formats.thumbnail.url) {
              return attrs.formats.thumbnail.url;
            }
          }
        }
      }
    }
    
    // 5. Verificar el array 'images'
    if (this.newsItem.images && Array.isArray(this.newsItem.images) && this.newsItem.images.length > 0) {
      const firstImageFromArray = this.newsItem.images[0] as any;
      
      // Si es un string, verificar que sea una URL válida
      if (typeof firstImageFromArray === 'string' && this.isValidUrl(firstImageFromArray)) {
        return firstImageFromArray;
      }
      
      // Si es un objeto, intentar extraer la URL
      if (typeof firstImageFromArray === 'object' && firstImageFromArray !== null) {
        if (firstImageFromArray.url) {
          return firstImageFromArray.url;
        }
      }
    }
    
    // 6. Buscar en el contenido de la noticia si hay una URL de imagen
    // Esto es útil para noticias donde la imagen está dentro del HTML
    if (typeof this.newsItem.content === 'string') {
      const imgRegex = /<img.*?src=["'](.*?)["']/i;
      const matches = (this.newsItem.content as string).match(imgRegex);
      if (matches && matches.length > 1 && this.isValidUrl(matches[1])) {
        return matches[1];
      }
    }
    
    // 7. Si nada funciona, usar imagen predeterminada
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
    
    // Primero reemplazar las etiquetas de párrafo por saltos de línea
    let cleaned = text
      .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')  // Cierre de párrafo seguido de apertura
      .replace(/<\/p>/gi, '\n\n')              // Cierre de párrafo
      .replace(/<p[^>]*>/gi, '')               // Apertura de párrafo
      .replace(/<br\s*\/?>/gi, '\n')           // <br> por salto de línea
      .replace(/<img[^>]*>/gi, '')             // Eliminar etiquetas de imagen
      .replace(/&nbsp;/gi, ' ')                // &nbsp; por espacio
      .replace(/&lt;/gi, '<')                  // &lt; por <
      .replace(/&gt;/gi, '>')                  // &gt; por >
      .replace(/&amp;/gi, '&')                 // &amp; por &
      .replace(/&quot;/gi, '"')                // &quot; por "
      .replace(/&#39;/gi, "'")                 // &#39; por '
      .replace(/<[^>]+>/g, '')                 // Elimina cualquier otra etiqueta HTML
      .replace(/\n{3,}/g, '\n\n')              // Normalizar múltiples saltos a máximo 2
      .trim();
      
    return cleaned;
  }

  getContent(): string {
    // Si no hay noticia o contenido, devolver mensaje informativo
    if (!this.newsItem) return 'Noticia no disponible';
    
    // Si no hay contenido pero hay summary, usar el summary
    if (!this.newsItem.content && this.newsItem.summary) {
      return this.newsItem.summary;
    }
    
    // Si no hay contenido y no hay summary
    if (!this.newsItem.content) {
      // Si hay URL de origen, sugerir visitar la fuente original
      if (this.newsItem.sourceUrl) {
        return `Esta noticia no tiene contenido completo disponible. Por favor, visite la fuente original para más información.`;
      }
      return 'Contenido no disponible';
    }
    
    // Si el contenido es un string directo (HTML o texto plano)
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
          // Acumular el texto del párrafo
          let paragraphText = '';
          
          // Procesar bloques de párrafo con children
          for (const child of blockAny.children) {
            if (child.text) {
              paragraphText += child.text;
            }
          }
          
          // Solo añadir el párrafo si tiene contenido
          if (paragraphText.trim()) {
            fullContent += paragraphText + '\n\n'; // Doble salto de línea entre párrafos
          }
        } else if (blockAny.children && Array.isArray(blockAny.children)) {
          // Acumular el texto de los children
          let blockText = '';
          
          // Procesar bloques generales con children
          for (const child of blockAny.children) {
            if (child.text) {
              blockText += child.text;
            }
          }
          
          // Solo añadir el bloque si tiene contenido
          if (blockText.trim()) {
            fullContent += blockText + '\n\n';
          }
        } else if (blockAny.text) {
          // Bloque con texto directo
          fullContent += blockAny.text + '\n\n';
        } else if (blockAny.content) {
          // Bloque con propiedad content
          fullContent += blockAny.content + '\n\n';
        }
      }
      
      // Limpiar y normalizar el resultado final
      return this.cleanHtmlTags(fullContent.trim());
    }
    
    // Fallback final: convertir a string sea lo que sea
    return String(this.newsItem.content);
  }

  getAdditionalImageUrl(image: any): string {
    // Si es un string directo y es una URL válida
    if (typeof image === 'string' && this.isValidUrl(image)) {
      return image;
    }
    
    // Si es un objeto con URL directa
    if (typeof image === 'object' && image !== null) {
      // URL directa
      if (image.url && typeof image.url === 'string') {
        return image.url;
      }
      
      // Formatos de imagen
      if (image.formats) {
        if (image.formats.medium && image.formats.medium.url) {
          return image.formats.medium.url;
        } else if (image.formats.small && image.formats.small.url) {
          return image.formats.small.url;
        } else if (image.formats.thumbnail && image.formats.thumbnail.url) {
          return image.formats.thumbnail.url;
        }
      }
      
      // Estructura data.attributes (Strapi 5.x)
      if (image.data && image.data.attributes) {
        const attrs = image.data.attributes;
        
        // URL directa
        if (attrs.url) {
          return attrs.url;
        }
        
        // Formatos
        if (attrs.formats) {
          if (attrs.formats.medium && attrs.formats.medium.url) {
            return attrs.formats.medium.url;
          } else if (attrs.formats.small && attrs.formats.small.url) {
            return attrs.formats.small.url;
          } else if (attrs.formats.thumbnail && attrs.formats.thumbnail.url) {
            return attrs.formats.thumbnail.url;
          }
        }
      }
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

  // Método para manejar errores de carga de imágenes
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = 'assets/images/CBioceanicoTarapacafondo_blanco.png';
    }
  }
}
