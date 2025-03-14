import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
import { PaginatorModule } from 'primeng/paginator';
import { NewsSkeletonComponent } from '../../components/news-skeleton/news-skeleton.component';
import { GoogleNewsWidgetModule } from '../../components/google-news-widget/google-news-widget.module';
import { CarouselModule } from 'primeng/carousel';

import { NewsService } from '../../services/news.service';
import { NewsItem, MediaItem, Content, Tag } from '../../interfaces/news.interface';

// Registrar el locale español
registerLocaleData(localeEs, 'es');

// Interfaz simplificada para los datos de ejemplo
interface MockNewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  mainImage: {
    url: string;
    alt: string;
  } | null;
  tags: {
    id: string;
    name: string;
    nombre?: string;
  }[];
  author: {
    username: string;
  };
  manualCreation: boolean;
  sourceUrl?: string;
  articleDate?: string;
}

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
    GoogleNewsWidgetModule,
    CarouselModule
  ],
  templateUrl: './list-page-carousel.component.html',
  styleUrls: ['./list-page-carousel.component.css'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ]),
  ],
})
export class ListPageCarouselComponent implements OnInit, OnDestroy {
  // Añadir referencia a Math para usarlo en el template
  Math = Math;
  
  // Propiedades para filtros
  categories: any[] = [
    { label: 'Tecnología', value: 'tecnologia' },
    { label: 'Economía', value: 'economia' },
    { label: 'Comercio', value: 'comercio' },
    { label: 'Innovación', value: 'innovacion' },
    { label: 'Logística', value: 'logistica' },
    { label: 'Desarrollo', value: 'desarrollo' }
  ];
  selectedCategories: string[] = [];
  searchQuery: string = '';
  isSearchExpanded: boolean = false;
  dateStart: Date | null = null;
  dateEnd: Date | null = null;
  
  // Datos de noticias
  allNews: MockNewsItem[] = [];
  carouselNews: MockNewsItem[] = []; // Las 3 primeras noticias para el carrusel
  remainingNews: MockNewsItem[] = []; // El resto de noticias
  displayedNews: MockNewsItem[] = []; // Noticias que se muestran actualmente
  isLoading: boolean = true;
  isBrowser: boolean = false;
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 9; // 3x3 grid
  totalPages: number = 2;

  // Configuración del carrusel
  carouselResponsiveOptions = [
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

  // Intervalo para cambiar automáticamente el carrusel
  private carouselInterval: Subscription | null = null;
  currentCarouselIndex: number = 0;

  // Propiedad para controlar la actualización de la hora
  private clockInterval: any;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Cargar datos inmediatamente para SSR
    try {
      this.loadMockData();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      // Si hay error al cargar datos, asegurarse de que la UI no quede bloqueada
      this.isLoading = false;
    }
    
    // Solo ejecutar código específico del navegador si estamos en el navegador
    if (this.isBrowser) {
      // Simulamos carga de datos con delay solo en el navegador
      setTimeout(() => {
        this.isLoading = false;
        
        // Iniciar el intervalo para el carrusel solo en el navegador
        try {
          this.startCarouselInterval();
        } catch (error) {
          console.error('Error al iniciar el carrusel:', error);
        }
      }, 1500);
      
      // Iniciar reloj para mostrar horas de países
      this.startClock();
    } else {
      // En el servidor, simplemente marcar como cargado sin delay
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    // Limpiar el intervalo al destruir el componente
    if (this.carouselInterval && this.isBrowser) {
      this.carouselInterval.unsubscribe();
    }
    
    // Limpiar intervalo del reloj
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  // Método para cargar datos de ejemplo
  loadMockData(): void {
    // Si no estamos en el navegador, reducir la cantidad de datos generados para SSR
    const totalItems = this.isBrowser ? 21 : 12;
    
    // Crear noticias de ejemplo (3 para carrusel + resto para grid paginado)
    for (let i = 1; i <= totalItems; i++) {
      const mockNews: MockNewsItem = {
        id: i.toString(),
        title: `Noticia de ejemplo ${i}`,
        summary: `Este es un resumen de ejemplo para la noticia ${i}. Contiene información relevante sobre el tema tratado.`,
        content: `<p>Contenido completo de la noticia ${i}. Este es un texto de ejemplo que simula el contenido real de una noticia.</p>`,
        publishedAt: new Date(2025, 0, i).toISOString(),
        mainImage: {
          url: `https://picsum.photos/id/${20 + i}/800/400`,
          alt: `Imagen de ejemplo ${i}`
        },
        tags: [
          { id: '1', name: 'Tecnología' },
          { id: '2', name: 'Innovación' },
          { id: '3', name: 'Desarrollo' }
        ],
        author: {
          username: 'Autor de Ejemplo'
        },
        manualCreation: i % 4 === 0,
        sourceUrl: i % 5 === 0 ? 'https://ejemplo.com/noticia/' + i : undefined
      };
      this.allNews.push(mockNews);
    }

    // Separar las 3 primeras noticias para el carrusel
    this.carouselNews = this.allNews.slice(0, 3);
    // El resto de noticias
    this.remainingNews = this.allNews.slice(3);
    // Mostrar la primera página
    this.updateDisplayedNews();
  }

  // Método para iniciar el intervalo del carrusel con manejo de errores
  startCarouselInterval(): void {
    // Solo ejecutar en el navegador
    if (!this.isBrowser) return;
    
    try {
      // Usar un timeout más corto para SSR
      this.carouselInterval = interval(this.isBrowser ? 5000 : 1000).subscribe({
        next: () => {
          this.currentCarouselIndex = (this.currentCarouselIndex + 1) % this.carouselNews.length;
        },
        error: (err) => {
          console.error('Error en el intervalo del carrusel:', err);
          // Intentar limpiar el intervalo si hay error
          if (this.carouselInterval) {
            this.carouselInterval.unsubscribe();
            this.carouselInterval = null;
          }
        }
      });
    } catch (error) {
      console.error('Error al crear el intervalo del carrusel:', error);
    }
  }

  // Método para navegar a una noticia
  navigateToNews(news: MockNewsItem): void {
    this.router.navigate(['/news', news.id]);
  }

  // Método para obtener la URL de la imagen
  getImageUrl(news: MockNewsItem): string {
    if (news.mainImage && news.mainImage.url) {
      return news.mainImage.url;
    }
    // Imagen por defecto
    return 'assets/images/default-news.jpg';
  }

  // Método para formatear la fecha
  getFormattedDate(dateString: string | undefined): Date {
    if (!dateString) return new Date();
    return new Date(dateString);
  }

  // Método para limpiar tags HTML
  cleanHtmlTags(text: string | undefined): string {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '');
  }

  // Método para actualizar las noticias mostradas según la página actual
  updateDisplayedNews(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedNews = this.remainingNews.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Método para cambiar de página
  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.updateDisplayedNews();
  }

  // Método para formatear URL
  getFormattedSourceUrl(url: string | undefined): string {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return url;
    }
  }

  // Método para manejar la búsqueda
  onSearch(event: any): void {
    const query = event.target.value.toLowerCase();
    this.searchQuery = query;
    
    if (query.trim() === '') {
      // Si la búsqueda está vacía, restaurar todas las noticias
      this.remainingNews = this.allNews.slice(3);
    } else {
      // Filtrar noticias según la búsqueda
      const filtered = this.allNews.filter(news => 
        news.title.toLowerCase().includes(query) || 
        news.summary.toLowerCase().includes(query)
      );
      
      // Actualizar carrusel y grid
      if (filtered.length > 3) {
        this.remainingNews = filtered.slice(3);
      } else {
        this.remainingNews = filtered;
      }
    }
    
    // Volver a la página 1 y actualizar noticias mostradas
    this.currentPage = 1;
    this.updateDisplayedNews();
  }
  
  // Método para manejar filtros de fecha
  onDateChange(): void {
    if (!this.dateStart && !this.dateEnd) {
      // Si no hay fechas seleccionadas, restaurar todas las noticias
      this.remainingNews = this.allNews.slice(3);
    } else {
      // Filtrar noticias según fechas
      const filtered = this.allNews.filter(news => {
        const newsDate = new Date(news.publishedAt || news.articleDate || new Date());
        
        if (this.dateStart && this.dateEnd) {
          return newsDate >= this.dateStart && newsDate <= this.dateEnd;
        } else if (this.dateStart) {
          return newsDate >= this.dateStart;
        } else if (this.dateEnd) {
          return newsDate <= this.dateEnd;
        }
        
        return true;
      });
      
      // Actualizar carrusel y grid
      if (filtered.length > 3) {
        this.remainingNews = filtered.slice(3);
      } else {
        this.remainingNews = filtered;
      }
    }
    
    // Volver a la página 1 y actualizar noticias mostradas
    this.currentPage = 1;
    this.updateDisplayedNews();
  }
  
  // Método para manejar filtros de categoría
  onCategoryChange(): void {
    if (this.selectedCategories.length === 0) {
      // Si no hay categorías seleccionadas, restaurar todas las noticias
      this.remainingNews = this.allNews.slice(3);
    } else {
      // Filtrar noticias según categorías seleccionadas
      const filtered = this.allNews.filter(news => {
        return news.tags.some(tag => 
          this.selectedCategories.includes(
            this.getCategoryValue(tag.name || tag.nombre || '')
          )
        );
      });
      
      // Actualizar carrusel y grid
      if (filtered.length > 3) {
        this.remainingNews = filtered.slice(3);
      } else {
        this.remainingNews = filtered;
      }
    }
    
    // Volver a la página 1 y actualizar noticias mostradas
    this.currentPage = 1;
    this.updateDisplayedNews();
  }
  
  // Método para obtener el valor de categoría a partir del nombre
  private getCategoryValue(name: string): string {
    name = name.toLowerCase();
    
    // Mapear nombres de categorías a sus valores
    if (name.includes('tecnolog')) return 'tecnologia';
    if (name.includes('econom')) return 'economia';
    if (name.includes('comerci')) return 'comercio';
    if (name.includes('innovac')) return 'innovacion';
    if (name.includes('logíst') || name.includes('logist')) return 'logistica';
    if (name.includes('desarroll')) return 'desarrollo';
    
    return '';
  }
  
  // Método para restablecer todos los filtros
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategories = [];
    this.dateStart = null;
    this.dateEnd = null;
    
    // Restaurar todas las noticias
    this.remainingNews = this.allNews.slice(3);
    this.currentPage = 1;
    this.updateDisplayedNews();
  }

  // Método para iniciar reloj con actualizaciones cada minuto
  startClock(): void {
    // Actualizar inmediatamente
    this.updateCountryTimes();
    
    // Actualizar cada minuto
    this.clockInterval = setInterval(() => {
      this.updateCountryTimes();
    }, 60000);
  }
  
  // Método para forzar actualización de detección de cambios en los relojes
  updateCountryTimes(): void {
    // Este método se usa para forzar la detección de cambios al actualizarse los relojes
    // Usando Object.assign con un objeto vacío para crear una nueva referencia
    this.dateEnd = Object.assign({}, this.dateEnd);
  }
  
  // Método para obtener la hora según el huso horario del país
  getCountryTime(timezone: string): string {
    try {
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: timezone
      };
      
      return new Date().toLocaleTimeString('es-ES', options);
    } catch (error) {
      console.error(`Error obteniendo hora para ${timezone}:`, error);
      return '--:--';
    }
  }
} 