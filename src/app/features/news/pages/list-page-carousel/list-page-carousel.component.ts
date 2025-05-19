import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, FormGroup, FormControl, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { animate, state, style, transition, trigger, query, stagger } from '@angular/animations';
import { interval, Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
import { CarouselModule } from 'primeng/carousel';
import { LatestNewsCardComponent } from '../../components/latest-news-card/latest-news-card.component';
import { PaginatorModule } from 'primeng/paginator';
import { NewsSkeletonComponent } from '../../components/news-skeleton/news-skeleton.component';
import { GoogleNewsWidgetModule } from '../../components/google-news-widget/google-news-widget.module';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { NewsService } from '../../services/news.service';
import { NewsItem, MediaItem } from '../../interfaces/news.interface';

// Registrar el locale español
registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-list-page-carousel',
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
    CarouselModule,
    GoogleNewsWidgetModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './list-page-carousel.component.html',
  styleUrls: ['./list-page-carousel.component.css'],
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
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    // Nuevo trigger para las tarjetas de "Podría interesarte"
    trigger('interestCardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms 50ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        style({ 
          position: 'absolute',
          width: 'calc(100% - 2.5rem)',
          left: '1.25rem',
          right: '1.25rem',
          zIndex: 0
        }), 
        animate('50ms ease-in', style({ 
          opacity: 0
        }))
      ])
    ])
  ]
})
export class ListPageCarouselComponent implements OnInit, OnDestroy {
  public news: NewsItem[] = [];
  public latestNews?: NewsItem;
  public secondaryNews: NewsItem[] = [];
  public previousNews: NewsItem[] = [];
  public isLoading: boolean = false;
  public isCardsLoading: boolean = false;
  public isFiltersVisible: boolean = false;
  public isBrowser: boolean;
  public sidebarOpen: boolean = false;
  public carouselNews: NewsItem[] = [];
  public minimalNews: NewsItem[] = [];
  public displayedMinimalNews: NewsItem[] = [];
  public carouselResponsiveOptions: any;
  public currentDate: Date = new Date();
  public itemsPerPage: number = 6;
  public displayedNews: NewsItem[] = [];
  public searchQuery: string = '';
  public isSearchExpanded: boolean = false;
  public isDateFilterExpanded: boolean = false;
  public isCategoryFilterExpanded: boolean = false;
  public dateStart: Date | null = null;
  public dateEnd: Date | null = null;
  public categories: any[] = [];
  public selectedCategories: any[] = [];

  public tags: any[] = [];

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
  public currentImageIndex: { [key: number]: number } = {};

  public currentPage: number = 1;
  public pageSize: number = 12;
  public totalRecords: number = 0;
  public totalPages: number = 0;

  private imageCache: { [url: string]: boolean } = {};

  private minimalNewsIntervalSubscription?: Subscription;
  private readonly MINIMAL_NEWS_COUNT = 4;
  private readonly MINIMAL_NEWS_INTERVAL_MS = 10000;

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
  
  // Nuevo Subject para manejar la búsqueda con debounce
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  
  // Para formulario de suscripción
  subscribeForm: FormGroup;
  isSubscribing: boolean = false;

  constructor(
    private newsService: NewsService,
    private router: Router,
    private _adapter: DateAdapter<any>,
    private _intl: MatDatepickerIntl,
    @Inject(PLATFORM_ID) platformId: Object,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this._adapter.setLocale('es');
    this._intl.nextMonthLabel = 'Mes siguiente';
    this._intl.prevMonthLabel = 'Mes anterior';
    this.isBrowser = isPlatformBrowser(platformId);

    // Configuración del carrusel
    this.carouselResponsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '768px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
      }
    ];

    // Suscribirse a los cambios del rango de fechas
    this.dateRange.valueChanges.subscribe(range => {
      if (range.start || range.end) {
        this.applyFilters();
      }
    });

    // Inicializar currentImageIndex para noticias cargadas
    this.news.forEach(newsItem => {
      if (newsItem.id) {
        this.currentImageIndex[newsItem.id] = 0;
      }
    });

    // Inicializar el formulario de suscripción solo con email
    this.subscribeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.sidebarOpen = window.innerWidth > 1200; // Ajustar según sea necesario
      // Configuraciones que dependen del navegador
    }
    this.loadNews();
    this.loadMinimalNews();
    this.loadTags();
    
    // Configurar el observable de búsqueda con debounce
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500), // Espera 500ms después del último input
      distinctUntilChanged() // Solo emite si el valor cambia
    ).subscribe(query => {
      this.searchQuery = query;
      this.applyFilters();
    });

    // Iniciar intervalo para rotar noticias mínimas si estamos en el navegador
    if (this.isBrowser) {
      this.minimalNewsIntervalSubscription = interval(this.MINIMAL_NEWS_INTERVAL_MS).subscribe(() => {
        this.updateDisplayedMinimalNews();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.imageSliderSubscription) {
      this.imageSliderSubscription.unsubscribe();
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.minimalNewsIntervalSubscription) {
      this.minimalNewsIntervalSubscription.unsubscribe();
    }
    // Detener todos los sliders de imágenes activos
    Object.keys(this.currentImageIndex).forEach(newsIdStr => {
      const newsId = parseInt(newsIdStr, 10);
      this.stopImageSlider(newsId);
    });
  }

  // Método para asegurar ordenamiento consistente en cualquier solicitud
  private getSortCriteria(): string {
    // Modificado: articleDate ahora es el criterio principal
    return [
      'articleDate:desc',   // Fecha del artículo (más reciente primero)
      'publishedAt:desc',   // Fecha de publicación (si la anterior es igual)
      'createdAt:desc',     // Fecha de creación (si las anteriores son iguales)
      'id:desc'             // ID (como último desempate)
    ].join(',');
  }

  loadNews() {
    this.isLoading = true;
    this.newsService.getNews({
      page: 1,
      pageSize: 3, 
      sort: this.getSortCriteria(),
      filters: { relevanceScore: { $null: true } }
    }).subscribe({
      next: (response) => {
        if (response?.status === 'success' && Array.isArray(response?.data)) {
          const articles = this.mapArticles(response.data);
          this.latestNews = articles[0] || null;
          this.secondaryNews = articles.slice(1, 3);
          this.carouselNews = articles; 
          
          const featuredIds = articles.map(article => article.id);
          
          this.currentPage = 1; // Asegurar que empezamos en pág 1
          // Llamar a loadPreviousNews pasando los IDs a excluir para la carga inicial de Pág 1
          this.loadPreviousNews(featuredIds); 
        } else {
          console.error('[ERROR] Formato de respuesta inválido para noticias destacadas:', response);
          this.isLoading = false; 
          this.loadPreviousNews(); // Intentar cargar pág 1 sin exclusión si fallan las destacadas
        }
      },
      error: (error) => {
        console.error('[ERROR] Error cargando noticias destacadas:', error);
        this.isLoading = false;
        this.loadPreviousNews(); // Intentar cargar pág 1 sin exclusión si fallan las destacadas
      }
    });
  }

  private loadPreviousNews(excludeIdsFromPage1: number[] = []) {
    // Determinar cuántas noticias pedir a la API
    const fetchSize = (this.currentPage === 1 && excludeIdsFromPage1.length > 0) 
                      ? this.pageSize + excludeIdsFromPage1.length 
                      : this.pageSize;
                      
    const params = this.buildQueryParams(fetchSize); // Pedir el tamaño calculado
    this.isCardsLoading = true;
    this.displayedNews = []; 

    console.log(`Cargando Pág ${this.currentPage}. Pidiendo ${fetchSize} noticias.`);

    this.newsService.getNews(params).subscribe({
      next: (response) => {
        if (response?.status === 'success' && Array.isArray(response?.data)) {
          let articles = this.mapArticles(response.data);
          console.log(`Recibidas ${articles.length} noticias para Pág ${this.currentPage}.`);

          // Filtrar SIEMPRE si estamos en la página 1 y se pasaron IDs
          if (this.currentPage === 1 && excludeIdsFromPage1.length > 0) {
              const originalCount = articles.length;
              articles = articles.filter(article => !excludeIdsFromPage1.includes(article.id));
              console.log(`Filtrados ${excludeIdsFromPage1.length} IDs de ${originalCount}. Quedan ${articles.length}.`);
              // Tomar solo hasta pageSize (12) después de filtrar
              articles = articles.slice(0, this.pageSize); 
              console.log(`Tomando las primeras ${this.pageSize}. Final: ${articles.length}.`);
          }

          this.previousNews = [...articles]; 
          
          setTimeout(() => {
            this.displayedNews = [...this.previousNews]; 
            console.log(`UI actualizada con ${this.displayedNews.length} noticias en página ${this.currentPage}`);
          }, 0);
            
          this.totalRecords = response.meta?.pagination?.total || 0;
          this.totalPages = response.meta?.pagination?.pageCount || Math.ceil(this.totalRecords / this.pageSize);
          console.log(`Paginación: Total Records: ${this.totalRecords}, Total Pages: ${this.totalPages}`);
          
        } else {
          console.error(`[ERROR] Respuesta inválida para página ${this.currentPage}:`, response);
          this.previousNews = []; 
          this.displayedNews = [];
          this.totalRecords = 0;
          this.totalPages = 0;
        }
        this.isCardsLoading = false;
        if(this.isLoading) this.isLoading = false; 
      },
      error: (error) => {
        console.error(`[ERROR] Error cargando página ${this.currentPage}:`, error);
        this.previousNews = []; 
        this.displayedNews = [];
        this.totalRecords = 0;
        this.totalPages = 0;
        this.isCardsLoading = false;
        if(this.isLoading) this.isLoading = false; 
      }
    });
  }

  private buildQueryParams(fetchSize: number = this.pageSize) { 
    const filters: any = { relevanceScore: { $null: true } };
    if (this.selectedCountry?.name) { filters.pais = this.selectedCountry.name.toLowerCase(); }
    if (this.selectedTags?.length > 0) { filters.tags = { nombre: { $in: this.selectedTags.map(tag => tag.name) } }; }
    if (this.dateStart || this.dateEnd) {
      filters.articleDate = {};
      
      if (this.dateStart) {
        const startDate = new Date(this.dateStart);
        const startUTC = new Date(Date.UTC(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
          0, 0, 0
        ));
        filters.articleDate.$gte = startUTC.toISOString();
        console.log('[DEBUG] Filtro fecha inicio (local):', startDate.toString());
        console.log('[DEBUG] Filtro fecha inicio (UTC):', startUTC.toISOString());
      }
      
      if (this.dateEnd) {
        const endDate = new Date(this.dateEnd);
        const endUTC = new Date(Date.UTC(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate(),
          23, 59, 59, 999
        ));
        filters.articleDate.$lte = endUTC.toISOString();
        console.log('[DEBUG] Filtro fecha fin (local):', endDate.toString());
        console.log('[DEBUG] Filtro fecha fin (UTC):', endUTC.toISOString());
      }
    }

    if (this.searchQuery?.trim()) {
      filters.$or = [
        { title: { $containsi: this.searchQuery.trim() } },
      ];
      console.log('[DEBUG] Filtro búsqueda por título:', this.searchQuery.trim());
    }

    const queryParams = {
      page: this.currentPage,
      pageSize: fetchSize, // Usar el tamaño calculado
      sort: this.getSortCriteria(),
      filters: filters
    };
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
    this.currentPage = 1; // Resetear a página 1
    const featuredIds = [
      this.latestNews?.id,
      ...this.secondaryNews.map(news => news.id)
    ].filter((id): id is number => typeof id === 'number');
    
    // Llamar a loadPreviousNews pasando los IDs a excluir explícitamente para Pág 1
    console.log("Aplicando filtros, cargando Pág 1 excluyendo IDs:", featuredIds);
    this.loadPreviousNews(featuredIds); 
  }

  // Método auxiliar para extraer la URL de imagen del objeto MediaItem de Strapi 5
  private extractMediaUrl(mediaItem: any): string | null {
    if (!mediaItem) return null;
    
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

  getImageUrl(newsItem: NewsItem): string {
    // Para noticias creadas manualmente
    if (newsItem?.manualCreation === true) {
      // Verificar si ya tenemos esta noticia en caché
      if (this.newsImagesCache[newsItem.id]?.featuredImage) {
        const featuredImage = this.newsImagesCache[newsItem.id].featuredImage;
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
          return mediaUrl;
        }
      }
      
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
      if (typeof window === 'undefined' || typeof Image === 'undefined') {
        return url;
      }

      if (this.imageCache.hasOwnProperty(url)) {
        return this.imageCache[url] ? url : 'assets/images/CBioceanicoTarapacafondo_blanco.png';
      }
      
      const img = new Image();
      img.onload = () => {
        this.imageCache[url] = true;
      };
      img.onerror = () => {
        this.imageCache[url] = false;
      };
      img.src = url;
      
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
    const requestedPage = event.page + 1;
    if (this.currentPage === requestedPage) {
      console.log(`Paginador intentó recargar la página actual (${this.currentPage}). Ignorando.`);
      return; 
    }
    this.currentPage = requestedPage;
    console.log(`Cambiando a página ${this.currentPage} desde paginador.`);
    // Al cambiar de página, NO pasamos IDs a excluir.
    this.loadPreviousNews(); 
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
    
    const mappedArticles = articles.map(article => {
      // Determinar si estamos recibiendo datos en formato Strapi 5 (data/attributes)
      let processedArticle = article;
      
      // Si tiene estructura data/attributes (formato Strapi v5)
      if (article.attributes) {
        processedArticle = article.attributes;
        processedArticle.id = article.id;
      }
      
      // Detectar si es una noticia creada manualmente
      // Podría estar indicado por el campo manualCreation o por la ausencia de sourceUrl
      const isManualCreation = processedArticle.manualCreation === true || 
                             (!processedArticle.sourceUrl && !processedArticle.mainImage);
      
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
        manualCreation: isManualCreation,
        relevanceScore: processedArticle.relevanceScore !== undefined ? 
                       Number(processedArticle.relevanceScore) : null
      };
    });

    // Simplemente devolver los artículos mapeados en el orden recibido
    return mappedArticles; 
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
    
    this.newsService.getNewsComplete(newsId.toString()).subscribe({
      next: (newsData) => {
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

  // Métodos para manejar los filtros
  toggleSearchExpand() {
    this.isSearchExpanded = !this.isSearchExpanded;
    
    // Si tenemos consulta y estamos cerrando, limpiar la búsqueda
    if (!this.isSearchExpanded && this.searchQuery) {
      this.searchQuery = '';
      this.applyFilters();
    }
  }

  toggleDateFilter() {
    this.isDateFilterExpanded = !this.isDateFilterExpanded;
  }

  toggleCategoryFilter() {
    this.isCategoryFilterExpanded = !this.isCategoryFilterExpanded;
  }

  // Actualizar el método onSearch para recibir un parámetro de evento
  onSearch(event?: Event): void {
    console.log('[DEBUG] Ejecutando búsqueda con:', this.searchQuery);
    
    // Obtener el valor del input si se proporciona un evento
    if (event && event.target) {
      const target = event.target as HTMLInputElement;
      this.searchQuery = target.value;
    }
    
    // Ejecutar búsqueda inmediatamente
    this.applyFilters();
    
    // Si la barra está expandida y no hay texto, colapsar
    if (this.isSearchExpanded && !this.searchQuery) {
      this.isSearchExpanded = false;
    }
  }

  // Método para manejar cambios en el input de búsqueda (búsqueda automática)
  onSearchInput(): void {
    // Pasar el valor actual al subject para procesarlo con debounce
    this.searchSubject.next(this.searchQuery);
  }

  onDateChange() {
    // Sincronizar los valores de dateStart/dateEnd con dateRange
    if (this.dateStart || this.dateEnd) {
      // Actualizar el FormGroup con los valores seleccionados en la UI
      this.dateRange.setValue({
        start: this.dateStart,
        end: this.dateEnd
      });
      
      console.log('[DEBUG] Fecha inicio seleccionada:', this.dateStart);
      console.log('[DEBUG] Fecha fin seleccionada:', this.dateEnd);
    }
    
    // Aplicar filtros
    this.applyFilters();
  }

  onCategoryChange() {
    this.applyFilters();
  }

  // Renombrar resetFilters a clearFilters para ser consistente con el HTML
  clearFilters() {
    this.searchQuery = '';
    this.dateStart = null;
    this.dateEnd = null;
    this.selectedCategories = [];
    this.selectedTags = [];
    this.selectedCountry = null;
    this.dateRange.setValue({
      start: null,
      end: null
    });
    
    // Recargar noticias con filtros eliminados
    this.isCardsLoading = true; // Solo activar carga para las tarjetas
    this.loadNews();
  }

  getCountryTime(timezone: string): string {
    if (!this.isBrowser) return '';
    return new Date().toLocaleTimeString('es-ES', { timeZone: timezone });
  }

  // Método para abrir la URL de origen de una noticia, o navegar a la página de detalle si no tiene URL
  openSourceUrl(news: NewsItem): void {
    if (news.sourceUrl) {
      // Abrir URL en nueva pestaña
      if (this.isBrowser) {
        window.open(news.sourceUrl, '_blank');
      }
    } else {
      // Si no tiene URL de origen, navegar a la página de detalle
      this.navigateToNews(news);
    }
  }
  
  // Método para cargar noticias con relevanceScore usando los IDs que sabemos que tienen valor
  loadMinimalNews() {
    // Enfoque más simple: buscar por tipo de artículo 'minimal'
    this.newsService.getNews({
      page: 1,
      pageSize: 20, // Cargar más noticias para tener variedad al rotar
      sort: this.getSortCriteria(),
      filters: {
        articleType: 'minimal'  // Filtrar por tipo de artículo
      }
    }).subscribe({
      next: (response) => {
        if (response?.status === 'success' && Array.isArray(response?.data)) {
          const articles = this.mapArticles(response.data);

          // Eliminar duplicados basados en el título
          const uniqueArticles = articles.filter((article, index, self) =>
            index === self.findIndex(a => a.title === article.title)
          );

          this.minimalNews = uniqueArticles; // Guardar todas las noticias mínimas únicas
          this.updateDisplayedMinimalNews(); // Actualizar las 4 noticias a mostrar por primera vez
          console.log('Noticias para Podría interesarte (total únicas):', this.minimalNews.length);
        }
      },
      error: (error) => {
        console.error('[ERROR] Error cargando noticias minimales:', error);
      }
    });
  }

  // Nuevo: Función para barajar un array (Fisher-Yates shuffle)
  private shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;
    // Mientras queden elementos por barajar...
    while (currentIndex !== 0) {
      // Escoger un elemento restante...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // E intercambiarlo con el elemento actual.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  // Nuevo: Función para actualizar las 4 noticias aleatorias a mostrar
  private updateDisplayedMinimalNews(): void {
    if (this.minimalNews.length > 0) {
      // Crear una copia barajada del array original
      const shuffled = this.shuffleArray([...this.minimalNews]);
      // Tomar los primeros MINIMAL_NEWS_COUNT elementos (o menos si no hay suficientes)
      this.displayedMinimalNews = shuffled.slice(0, this.MINIMAL_NEWS_COUNT);
    } else {
      this.displayedMinimalNews = []; // Asegurarse que esté vacío si no hay noticias mínimas
    }
  }

  // Añadir este nuevo método para cargar los tags desde la API
  loadTags(): void {
    console.log('[DEBUG] Iniciando carga de tags...');
    this.newsService.getTags().subscribe({
      next: (tagsData: any[]) => {
        console.log('[DEBUG] Tags cargados:', tagsData?.length || 0);
        if (tagsData && Array.isArray(tagsData) && tagsData.length > 0) {
          // Guardar tags en el formato original
          this.tags = tagsData.map(tag => {
            return {
              id: tag.id,
              name: tag.nombre,
              nombre: tag.nombre
            };
          });
          
          // También asignar los tags a categories con el formato label/value para el multiselect
          this.categories = tagsData.map(tag => {
            return {
              label: tag.nombre,
              value: tag.nombre
            };
          });
          
          console.log('[DEBUG] Tags procesados:', this.tags.length);
          console.log('[DEBUG] Categorías para selector:', this.categories);
        } else {
          console.warn('[ADVERTENCIA] No se encontraron tags o el formato es inválido');
          this.setDefaultTags();
        }
      },
      error: (error: any) => {
        console.error('[ERROR] Error cargando tags:', error);
        console.warn('[ADVERTENCIA] Usando valores predeterminados para tags');
        this.setDefaultTags();
      }
    });
  }
  
  // Método auxiliar para establecer tags predeterminados
  private setDefaultTags(): void {
    this.tags = [
      { id: 1, name: 'Infraestructura', nombre: 'infraestructura' },
      { id: 2, name: 'Comercio', nombre: 'comercio' },
      { id: 3, name: 'Integración', nombre: 'integracion' },
      { id: 4, name: 'Gobierno', nombre: 'gobierno' },
    ];
    
    // También establecer categorías para el selector
    this.categories = [
      { label: 'Infraestructura', value: 'infraestructura' },
      { label: 'Comercio', value: 'comercio' },
      { label: 'Integración', value: 'integracion' },
      { label: 'Gobierno', value: 'gobierno' },
    ];
    
    console.log('[DEBUG] Tags predeterminados establecidos:', this.tags.length);
    console.log('[DEBUG] Categorías predeterminadas:', this.categories);
  }

  // Método para limpiar sólo las fechas sin resetear otros filtros
  clearDates(): void {
    this.dateStart = null;
    this.dateEnd = null;
    
    // Resetear también el FormGroup de fechas
    this.dateRange.setValue({
      start: null,
      end: null
    });
    
    console.log('[DEBUG] Fechas limpiadas');
    this.applyFilters();
  }

  // Nuevo: Función trackBy para *ngFor
  trackByNewsId(index: number, newsItem: NewsItem): number {
    return newsItem.id; // Asume que cada NewsItem tiene un id único
  }

  // Getter para acceder fácilmente a los controles del formulario
  get emailControl() {
    return this.subscribeForm.get('email');
  }

  /**
   * Maneja el envío del formulario de suscripción
   */
  onSubscribe() {
    if (this.subscribeForm.invalid) {
      // Marcar campos como tocados para mostrar errores
      Object.keys(this.subscribeForm.controls).forEach(key => {
        const control = this.subscribeForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubscribing = true;
    const email = this.subscribeForm.get('email')?.value;

    this.newsService.addSubscriber(email)
      .subscribe({
        next: (response) => {
          this.isSubscribing = false;
          this.subscribeForm.reset();
          
          // Mostrar mensaje de éxito
          this.messageService.add({
            severity: 'success',
            summary: 'Suscripción exitosa',
            detail: '¡Gracias por suscribirte al newsletter del Corredor Bioceánico!'
          });
        },
        error: (error) => {
          this.isSubscribing = false;
          
          // Manejar mensajes de error específicos
          let errorMsg = 'Error al procesar la suscripción. Intente nuevamente.';
          
          if (error.error?.message === 'Email ya registrado y activo') {
            errorMsg = 'Este correo ya está suscrito al newsletter.';
          } else if (error.error?.message?.includes('email')) {
            errorMsg = 'Por favor ingrese un correo electrónico válido.';
          }
          
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMsg
          });
        }
      });
  }
}
