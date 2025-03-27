import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { interval, Subscription } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter } from '@angular/material/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { environments } from '@environments/environments';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LatestNewsCardComponent } from '../../components/latest-news-card/latest-news-card.component';
import { PaginatorModule } from 'primeng/paginator';
import { NewsSkeletonComponent } from '../../components/news-skeleton/news-skeleton.component';
import { GoogleNewsWidgetModule } from '../../components/google-news-widget/google-news-widget.module';

import { NewsService } from '../../services/news.service';
import { NewsItem, MediaItem } from '../../interfaces/news.interface';

// Registrar el locale español
registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NewsSkeletonComponent,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    
    ButtonModule,
    InputTextModule,
    DropdownModule,
    MultiSelectModule,
    CalendarModule,
    CardModule,
    ProgressSpinnerModule,
    PaginatorModule,
    GoogleNewsWidgetModule
  ],
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.css'],
  animations: [
    trigger('slideInOut', [
      state('true', style({
        maxHeight: '800px',
        opacity: 1,
        visibility: 'visible'
      })),
      state('false', style({
        maxHeight: '0',
        opacity: 0,
        visibility: 'hidden'
      })),
      transition('true <=> false', animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class ListPageComponent implements OnInit, OnDestroy {
  public news: NewsItem[] = [];
  public latestNews?: NewsItem;
  public secondaryNews: NewsItem[] = [];
  public previousNews: NewsItem[] = [];
  public isLoading: boolean = false;
  public isFiltersVisible: boolean = false;

  public tags = [
    { name: 'Infraestructura' },
    { name: 'Comercio' },
    { name: 'Integración' },
    { name: 'Gobierno' },
  ];

  public countries = [
    { name: 'Argentina' },
    { name: 'Brasil' },
    { name: 'Chile' },
    { name: 'Paraguay' },
    { name: 'Mundo' }
  ];

  public selectedTopic: any = null;
  public selectedTags: any[] = [];
  public selectedCountry: any = null;

  private imageSliderSubscription?: Subscription;
  public currentImageIndex: { [key: number]: number } = {};  // Para trackear el índice de imagen por noticia

  public currentPage: number = 1;
  public pageSize: number = 6; // Cambiamos a 6 items por página
  public totalRecords: number = 0;
  public totalPages: number = 0;

  private imageCache: { [url: string]: boolean } = {};
  // Limitar que "Desde" no pueda ser anterior a 1 de enero de 2023
  public desdeMinDate: Date = new Date(2023, 0, 1);
  // Limitar que "Hasta" sea igual o menor a la fecha actual
  public hastaMaxDate: Date = new Date();

  // Configuración del calendario en español
  esCalendar = {
    firstDayOfWeek: 1,
    dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
    monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    today: 'Hoy',
    clear: 'Limpiar',
    dateFormat: 'dd/mm/yy',
    weekHeader: 'Sem',
    locale: 'es',
    firstDay: 1,
    isRTL: false,
    showMonthAfterYear: false,
    yearSuffix: ''
  };

  minDate = new Date(2023, 0, 1);  // 1 de enero de 2023
  maxDate = new Date();  // Fecha actual

  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });


  // Caché para las imágenes de noticias
  private newsImagesCache: { [id: number]: { featuredImage: any, additionalImages: any[] } } = {};

  // Marca si una imagen está siendo cargada actualmente
  private loadingImages: Set<number> = new Set();
  
  constructor(
    private newsService: NewsService,
    private router: Router,
    private _adapter: DateAdapter<any>,
    private _intl: MatDatepickerIntl
  ) {
    this._adapter.setLocale('es');
    this._intl.nextMonthLabel = 'Mes siguiente';
    this._intl.prevMonthLabel = 'Mes anterior';

    // Suscribirse a los cambios del rango de fechas
    this.dateRange.valueChanges.subscribe(range => {
      if (range.start || range.end) {
        this.applyFilters();
      }
    });
  }

  ngOnInit(): void {
    this.loadNews();

    this.checkSpecificNews();
  }

  ngOnDestroy(): void {
    if (this.imageSliderSubscription) {
      this.imageSliderSubscription.unsubscribe();
    }
  }

  loadNews() {
    this.isLoading = true;
    
    // Cargar las últimas noticias solo una vez al inicio
    if (!this.latestNews) {
      this.newsService.getNews({
        page: 1,
        pageSize: 3,
        sort: 'publishedAt:desc'
      }).subscribe({
        next: (response) => {
          console.log('[DEBUG] Respuesta completa del servidor:', response);
          
          if (response?.status === 'success' && Array.isArray(response?.data)) {
            const articles = this.mapArticles(response.data);
            this.latestNews = articles[0] || null;
            this.secondaryNews = articles.slice(1, 3);
            const featuredIds = articles.map(article => article.id);
            
            // Cargar noticias anteriores excluyendo las destacadas
            this.loadPreviousNews(featuredIds);
          } else {
            console.error('[ERROR] Formato de respuesta inválido:', response);
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('[ERROR] Error cargando noticias:', error);
          this.isLoading = false;
        }
      });
    } else {
      // Si ya tenemos las últimas noticias, solo cargar las anteriores
      const featuredIds = [
        this.latestNews?.id,
        ...this.secondaryNews.map(news => news.id)
      ].filter((id): id is number => typeof id === 'number');
      this.loadPreviousNews(featuredIds);
    }
  }

  private loadPreviousNews(excludeIds: number[]) {
    const params = this.buildQueryParams(excludeIds);
    
    this.newsService.getNews(params).subscribe({
      next: (response) => {
        console.log('[DEBUG] Respuesta para noticias anteriores:', response);
        if (response?.status === 'success' && Array.isArray(response?.data)) {
          const articles = this.mapArticles(response.data);
          console.log('[DEBUG] Artículos mapeados:', articles);
          
          this.previousNews = articles
            .filter(article => !excludeIds.includes(article.id))
            .slice(0, this.pageSize);
            
          this.totalRecords = response.meta?.pagination?.total || 0;
          if (excludeIds.length > 0) {
            this.totalRecords = Math.max(0, this.totalRecords - excludeIds.length);
          }
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        } else {
          console.error('[ERROR] Formato de respuesta inválido para noticias anteriores:', response);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[ERROR] Error cargando noticias anteriores:', error);
        if (error.error) {
          console.error('[ERROR] Detalles del error:', error.error);
        }
        this.isLoading = false;
      }
    });
  }

  private buildQueryParams(excludeIds: number[]) {
    const filters: any = {};
    
    // Filtro por país
    if (this.selectedCountry?.name) {
      filters.pais = this.selectedCountry.name.toLowerCase();
      console.log('[FILTROS] País seleccionado:', filters.pais);
    }

    // Filtro por tags
    if (this.selectedTags?.length > 0) {
      filters.tags = {
        nombre: {
          $in: this.selectedTags.map(tag => tag.name)
        }
      };
      console.log('[FILTROS] Tags seleccionados:', filters.tags.nombre.$in);
    }

    // Filtro por fechas
    if (this.dateRange.value.start || this.dateRange.value.end) {
      filters.articleDate = {};
      
      if (this.dateRange.value.start) {
        const startDate = new Date(this.dateRange.value.start);
        startDate.setUTCHours(0, 0, 0, 0);
        filters.articleDate.$gte = startDate.toISOString();
        console.log('[FILTROS] Fecha inicio procesada:', filters.articleDate.$gte);
      }
      
      if (this.dateRange.value.end) {
        const endDate = new Date(this.dateRange.value.end);
        endDate.setUTCHours(23, 59, 59, 999);
        filters.articleDate.$lte = endDate.toISOString();
        console.log('[FILTROS] Fecha fin procesada:', filters.articleDate.$lte);
      }
    }

    const queryParams = {
      page: this.currentPage,
      pageSize: this.pageSize + (this.currentPage === 1 ? excludeIds.length : 0),
      sort: 'articleDate:desc',
      filters: filters
    };

    console.log('[FILTROS] Parámetros finales:', JSON.stringify(queryParams, null, 2));
    return queryParams;
  }

  private formatDateForQuery(date: Date): string {
    if (!date) return '';
    
    // Ajustar a UTC manteniendo la fecha local
    const adjustedDate = new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,  // Hora UTC
        0,  // Minutos UTC
        0   // Segundos UTC
      )
    );
    
    return adjustedDate.toISOString();
  }

  applyFilters() {
    this.currentPage = 1;
    this.isLoading = true;
    
    const featuredIds = [
      this.latestNews?.id,
      ...this.secondaryNews.map(news => news.id)
    ].filter((id): id is number => typeof id === 'number');
    
    const params = this.buildQueryParams(featuredIds);
    
    this.newsService.getNews(params).subscribe({
      next: (response) => {
        console.log('[RESPUESTA] Respuesta del backend:', response);
        if (response?.status === 'success' && Array.isArray(response?.data)) {
          const articles = this.mapArticles(response.data);
          this.previousNews = articles
            .filter(article => !featuredIds.includes(article.id))
            .slice(0, this.pageSize);
          
          this.totalRecords = response.meta?.pagination?.total || 0;
          this.totalPages = Math.ceil((this.totalRecords - featuredIds.length) / this.pageSize);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[ERROR] Error en la solicitud:', error);
        if (error.error) {
          console.error('[ERROR] Detalles del error:', error.error);
        }
        this.isLoading = false;
      }
    });
  }

  // Método auxiliar para extraer la URL de imagen del objeto MediaItem de Strapi 5
  private extractMediaUrl(mediaItem: any): string | null {
    if (!mediaItem) return null;
    
    console.log('[DEBUG] Estructura de mediaItem:', mediaItem);
    
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
    
    console.warn('[ADVERTENCIA] No se pudo extraer URL de imagen:', mediaItem);
    return null;
  }

  getImageUrl(newsItem: NewsItem): string {
    // Para noticias creadas manualmente
    if (newsItem?.manualCreation === true) {
      console.log('[DEBUG] Noticia creada manualmente, ID:', newsItem.id);
      
      // Verificar si ya tenemos esta noticia en caché
      if (this.newsImagesCache[newsItem.id]?.featuredImage) {
        const featuredImage = this.newsImagesCache[newsItem.id].featuredImage;
        console.log('[DEBUG] Usando imagen en caché para noticia ID:', newsItem.id);
        // Preferir versión medium o small si existe
        if (featuredImage.formats?.medium?.url) {
          return featuredImage.formats.medium.url;
        } else if (featuredImage.formats?.small?.url) {
          return featuredImage.formats.small.url;
        }
        return featuredImage.url;
      }
      
      // Si no está en caché, cargar los datos completos de la noticia
      if (!this.isLoadingImage(newsItem.id)) {
        this.loadNewsImages(newsItem.id);
      }
      
      // Si tiene featuredImage, intentar extraer la URL
      if (newsItem.featuredImage) {
        const mediaUrl = this.extractMediaUrl(newsItem.featuredImage);
        if (mediaUrl) {
          console.log('[DEBUG] URL de imagen obtenida para noticia manual:', mediaUrl);
          return mediaUrl;
        }
      }
      
      // Mientras se carga, mostrar una imagen predeterminada
      return 'assets/images/CBioceanicoTarapacafondo_blanco.png';
    }
    
    // Para noticias con imágenes en formato MEDIA
    if (newsItem?.featuredImage) {
      const mediaUrl = this.extractMediaUrl(newsItem.featuredImage);
      if (mediaUrl) {
        return mediaUrl;
      }
    }
    
    // Si no hay featuredImage, continuar con la lógica actual
    const url = newsItem?.mainImage || newsItem?.images?.[0];
    
    if (url && this.isValidUrl(url) && !url.includes('default')) {
      // En SSR o entornos sin window, regresar directamente la URL
      if (typeof window === 'undefined' || typeof Image === 'undefined') {
        return url;
      }

      // Si ya verificamos esta URL antes, usar el resultado cacheado
      if (this.imageCache.hasOwnProperty(url)) {
        return this.imageCache[url] ? url : 'assets/images/CBioceanicoTarapacafondo_blanco.png';
      }
      
      // Si es una nueva URL, verificar y cachear el resultado
      const img = new Image();
      img.onload = () => {
        this.imageCache[url] = true;
      };
      img.onerror = () => {
        this.imageCache[url] = false;
      };
      img.src = url;
      
      // Mientras se verifica, mostrar la imagen predeterminada
      return 'assets/images/CBioceanicoTarapacafondo_blanco.png';
    }
    
    return 'assets/images/CBioceanicoTarapacafondo_blanco.png';
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      // Verificar que la URL no sea una ruta relativa
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }

  formatDate(date: string | null): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  toggleFilters() {
    this.isFiltersVisible = !this.isFiltersVisible;
  }

  navigateToNews(news: NewsItem) {
    this.router.navigate(['/news', news.id]);
  }

  // Método para iniciar el slider de imágenes
  startImageSlider(newsId: number, images: string[] = []): void {
    if (!images?.length || images.length <= 1) return;

    if (!(newsId in this.currentImageIndex)) {
      this.currentImageIndex[newsId] = 0;
    }

    this.imageSliderSubscription = interval(2000).subscribe(() => {
      this.currentImageIndex[newsId] = (this.currentImageIndex[newsId] + 1) % images.length;
    });
  }

  // Se obtiene la URL de la imagen actual
  getCurrentImageUrl(newsItem: NewsItem): string {

    // Para noticias creadas manualmente con imágenes en caché
    if (newsItem?.manualCreation && this.newsImagesCache[newsItem.id]?.featuredImage) {
      const featuredImage = this.newsImagesCache[newsItem.id].featuredImage;
      // Preferir versión medium o small si existe
      if (featuredImage.formats?.medium?.url) {
        return featuredImage.formats.medium.url;
      } else if (featuredImage.formats?.small?.url) {
        return featuredImage.formats.small.url;
      }
      return featuredImage.url;
    }
    
    // Para noticias con imágenes en formato MEDIA
    if (newsItem?.featuredImage) {
      const mediaUrl = this.extractMediaUrl(newsItem.featuredImage);
      if (mediaUrl) {
        return mediaUrl;
      }
    }
    
    // Para noticias con mainImage o images en formato string
    return newsItem?.images?.[0] || newsItem?.mainImage || 'assets/images/default-news.jpg';
  }

  // Método para detener el slider
  stopImageSlider(newsId: number) {
    if (this.imageSliderSubscription) {
      this.imageSliderSubscription.unsubscribe();
    }
    // Resetear el índice
    this.currentImageIndex[newsId] = 0;
  }

  getAllImages(newsItem: NewsItem): string[] {

    // Para noticias creadas manualmente con imágenes en caché
    if (newsItem?.manualCreation && this.newsImagesCache[newsItem.id]?.additionalImages) {
      const cachedImages = this.newsImagesCache[newsItem.id].additionalImages;
      if (cachedImages.length > 0) {
        // Extraer URLs de las imágenes adicionales en caché
        return cachedImages.map(img => {
          // Preferir versión medium o small si existe
          if (img.formats?.medium?.url) {
            return img.formats.medium.url;
          } else if (img.formats?.small?.url) {
            return img.formats.small.url;
          }
          return img.url;
        });
      }
    }
    
    // Para noticias con imágenes en formato MEDIA
    if (newsItem?.additionalImages && newsItem.additionalImages.length > 0) {
      // Extraer URLs de cada imagen adicional
      const mediaUrls = newsItem.additionalImages
        .map(img => this.extractMediaUrl(img))
        .filter((url): url is string => !!url); // Filtrar valores nulos
      
      if (mediaUrls.length > 0) {
        return mediaUrls;
      }
    }
    
    // Para noticias con imágenes en formato de array de strings
    return newsItem?.images || [];
  }

  // Cambio de páginas
  onPageChange(event: any) {
    this.currentPage = event.page + 1;
    this.loadNews();
  }

  // Método que convierte la fecha recibida en un objeto Date válido
  getFormattedDate(dateStr: string | undefined): Date {
    if (!dateStr) return new Date();
    const date = new Date(dateStr.replace(' ', 'T'));
    return date;
  }

  getFormattedSourceUrl(url: string): string {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url;
    }
  }

  cleanHtmlTags(text: string): string {
    if (!text) return '';
    return text.replace(/<\/p>/gi, '\n\n')  // Reemplaza cierre </p> por doble salto de línea
               .replace(/<p[^>]*>/gi, '')    // Elimina etiqueta de apertura <p>
               .replace(/<br\s*\/?>/gi, '\n') // Reemplaza <br> por salto de línea
               .replace(/&nbsp;/gi, ' ')      // Reemplaza &nbsp; por espacio
               .replace(/<[^>]+>/g, '')       // Elimina cualquier otra etiqueta
               .trim();
  }

  // Método auxiliar para mapear artículos
  private mapArticles(articles: any[]): NewsItem[] {
    if (!articles) return [];
    
    return articles.map(article => {
      // Determinar si estamos recibiendo datos en formato Strapi 5 (data/attributes)
      let processedArticle = article;
      
      // Si tiene estructura data/attributes (formato Strapi v5)
      if (article.attributes) {
        processedArticle = article.attributes;
        processedArticle.id = article.id;
      }
      
      // Añadir log para depuración
      console.log('[DEBUG] Mapeando artículo ID:', processedArticle.id, processedArticle);
      
      // Detectar si es una noticia creada manualmente
      // Podría estar indicado por el campo manualCreation o por la ausencia de sourceUrl
      const isManualCreation = processedArticle.manualCreation === true || 
                             (!processedArticle.sourceUrl && !processedArticle.mainImage);
      
      if (isManualCreation) {
        console.log('[DEBUG] Noticia creada manualmente detectada, ID:', processedArticle.id);
      }
      
      // Verificar específicamente el ID 27
      if (processedArticle.id === 27) {
        console.log('[DEBUG] Artículo ID 27 encontrado:', processedArticle);
        console.log('[DEBUG] featuredImage:', processedArticle.featuredImage);
        console.log('[DEBUG] additionalImages:', processedArticle.additionalImages);
        console.log('[DEBUG] Es creación manual:', isManualCreation);
      }
      
      // Procesar etiquetas que pueden venir en diferentes formatos
      let tags = [];
      if (Array.isArray(processedArticle.tags)) {
        tags = processedArticle.tags.map((tag: any) => ({
          id: tag.id || 0,
          name: tag.nombre || tag.name || 'Sin nombre',
          nombre: tag.nombre || tag.name || 'Sin nombre',
          documentId: tag.documentId || '',
          createdAt: tag.createdAt || null,
          updatedAt: tag.updatedAt || null,
          publishedAt: tag.publishedAt || null,
          locale: tag.locale || null,
          id_tag: tag.id_tag || ''
        }));
      } else if (processedArticle.tags?.data) {
        // Formato Strapi v5
        tags = processedArticle.tags.data.map((tagData: any) => {
          const tag = tagData.attributes || tagData;
          return {
            id: tagData.id || 0,
            name: tag.nombre || tag.name || 'Sin nombre',
            nombre: tag.nombre || tag.name || 'Sin nombre',
            documentId: tag.documentId || '',
            createdAt: tag.createdAt || null,
            updatedAt: tag.updatedAt || null,
            publishedAt: tag.publishedAt || null,
            locale: tag.locale || null,
            id_tag: tag.id_tag || ''
          };
        });
      }
      
      return {
        id: processedArticle.id,
        title: processedArticle.title || '',
        content: processedArticle.content || '',
        summary: processedArticle.summary || '',
        mainImage: processedArticle.mainImage || '',
        sourceUrl: processedArticle.sourceUrl || '',
        sourceName: processedArticle.sourceName || '',
        publishedAt: processedArticle.publishedAt || null,
        articleDate: processedArticle.articleDate || null,
        articleType: processedArticle.articleType || 'regular',
        tags: tags,
        images: processedArticle.images || [],
        createdAt: processedArticle.createdAt || null,
        // Mapeando propiedades de imágenes en formato MEDIA de Strapi
        featuredImage: processedArticle.featuredImage || null,
        additionalImages: processedArticle.additionalImages || [],
        manualCreation: isManualCreation
      };
    });
  }

  // Método auxiliar para depurar
  private checkSpecificNews() {
    // Buscar la noticia con ID 27 para depuración
    this.newsService.getNewsById('27').subscribe({
      next: (news) => {
        console.log('Noticia con ID 27 cargada directamente:', news);
        console.log('featuredImage:', news.featuredImage);
        console.log('additionalImages:', news.additionalImages);
      },
      error: (error) => {
        console.error('Error al cargar noticia con ID 27:', error);
      }
    });
  }

  // Marca si una imagen está siendo cargada actualmente
  private isLoadingImage(newsId: number): boolean {
    return this.loadingImages.has(newsId);
  }

  // Carga las imágenes de una noticia y las guarda en caché
  private loadNewsImages(newsId: number): void {
    if (this.isLoadingImage(newsId)) {
      return; // Evitar cargar la misma noticia múltiples veces
    }
    
    this.loadingImages.add(newsId);
    console.log('[DEBUG] Cargando imágenes para noticia ID:', newsId);
    
    this.newsService.getNewsComplete(newsId.toString()).subscribe({
      next: (newsData) => {
        console.log('[DEBUG] Noticia completa cargada:', newsData);
        
        // Guardar en caché
        this.newsImagesCache[newsId] = {
          featuredImage: newsData.featuredImage,
          additionalImages: newsData.additionalImages || []
        };
        
        this.loadingImages.delete(newsId);
      },
      error: (error) => {
        console.error('[ERROR] Error al cargar imágenes para noticia ID:', newsId, error);
        this.loadingImages.delete(newsId);
      }
    });
  }
}
