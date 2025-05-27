import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError, from, switchMap } from 'rxjs';
import { News, NewsItem } from '../interfaces/news.interface';
import { environments } from '@environments/environments';

interface StrapiResponse {
  status: string;
  data: {
    articles: Array<{
      id: number;
      title: string;
      content: string;
      summary: string;
      mainImage: string;
      sourceUrl: string;
      sourceName: string;
      publishedAt: string;
      articleDate: string;
      pais: string;
      tags: Array<{
        id: number;
        nombre: string;
        documentId: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        locale: string | null;
        id_tag: string;
      }>;
      images: string[];
      createdAt: string;

      articleType: 'regular';
      featuredImage?: any;
      additionalImages?: any[];
      manualCreation?: boolean;
    }>;
    count: number;
    timestamp: string;
  };
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

declare const grecaptcha: any;

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private baseUrlStrapi = environments.baseUrlStrapi;
  private token: string = environments.strapiToken;
  private headers: HttpHeaders;
  private postHeaders: HttpHeaders;

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
    this.postHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }


  getNews(params: {
    page: number;
    pageSize: number;
    filters?: any;
    sort?: string;
  }): Observable<StrapiResponse> {
    let queryParams = new HttpParams()
      .set('pagination[page]', params.page.toString())
      .set('pagination[pageSize]', params.pageSize.toString())
      .set('populate', '*')
      .set('sort', params.sort || 'articleDate:desc');

    // Filtros de fecha
    if (params.filters?.articleDate) {
      // Fecha mayor o igual que (desde)
      if (params.filters.articleDate.$gte) {
        const fromDate = params.filters.articleDate.$gte;
        console.log('[DEBUG SERVICE] Aplicando filtro desde fecha:', fromDate);
        queryParams = queryParams.set('filters[articleDate][$gte]', fromDate);
      }

      // Fecha menor o igual que (hasta)
      if (params.filters.articleDate.$lte) {
        const toDate = params.filters.articleDate.$lte;
        console.log('[DEBUG SERVICE] Aplicando filtro hasta fecha:', toDate);
        queryParams = queryParams.set('filters[articleDate][$lte]', toDate);
      }
    }

    // Filtro de país
    if (params.filters?.pais) {
      queryParams = queryParams.set('filters[pais][$eq]', params.filters.pais);
      console.log('[DEBUG SERVICE] Aplicando filtro por país:', params.filters.pais);
    }

    // Filtro de tags MODIFICADO
    if (params.filters?.tags?.nombre?.$in && Array.isArray(params.filters.tags.nombre.$in) && params.filters.tags.nombre.$in.length > 0) {
      const tagsToFilter = params.filters.tags.nombre.$in;
      
      if (tagsToFilter.length === 1) {
        // Si hay un solo tag, usar $eq
        queryParams = queryParams.set('filters[tags][nombre][$eq]', tagsToFilter[0]);
        console.log('[DEBUG SERVICE] Aplicando filtro por un solo tag (nombre):', tagsToFilter[0]);
      } else {
        // Si hay múltiples tags, usar $in y construir los parámetros indexados
        tagsToFilter.forEach((tag: string, index: number) => {
          queryParams = queryParams.set(`filters[tags][nombre][$in][${index}]`, tag);
        });
        console.log('[DEBUG SERVICE] Aplicando filtros por múltiples tags (nombre):', tagsToFilter);
      }
    }

    // Filtro de búsqueda de texto
    if (params.filters?.$or?.length > 0) {
      // El servicio construye un filtro OR para buscar en varios campos 
      const searchFields = ['title']; // Solo buscar en el título
      // Campos adicionales comentados por si se quieren habilitar en el futuro
      // const searchFields = ['title', 'summary', 'content'];
      
      params.filters.$or.forEach((condition: any, index: number) => {
        const field = Object.keys(condition)[0];
        const value = condition[field].$containsi;
        
        if (searchFields.includes(field)) {
          queryParams = queryParams.set(
            `filters[$or][${index}][${field}][$containsi]`, 
            value
          );
        }
      });
      console.log('[DEBUG SERVICE] Aplicando filtro de búsqueda por título');
    }

    // Agregar filtro para relevanceScore null
    if (params.filters?.relevanceScore?.$null === true) {
      queryParams = queryParams.set('filters[relevanceScore][$null]', 'true');
      console.log('[DEBUG SERVICE] Agregando filtro para relevanceScore NULL');
    }
    
    // Agregar filtro para relevanceScore no null
    if (params.filters?.relevanceScore?.$ne !== undefined) {
      queryParams = queryParams.set('filters[relevanceScore][$notNull]', 'true');
      console.log('[DEBUG SERVICE] Agregando filtro para relevanceScore NOT NULL');
    }

    // Agregar filtro para manualCreation
    if (params.filters?.manualCreation?.$eq === true) {
      queryParams = queryParams.set('filters[manualCreation][$eq]', 'true');
      console.log('[DEBUG SERVICE] Agregando filtro para manualCreation=true');
    }
    
    // Agregar filtro para IDs específicos
    if (params.filters?.id?.$in && Array.isArray(params.filters.id.$in)) {
      // En Strapi v4, necesitamos usar una estructura específica para $in
      const idList = params.filters.id.$in.join(',');
      queryParams = queryParams.set('filters[id][$in]', idList);
      console.log('[DEBUG SERVICE] Agregando filtro para IDs específicos:', idList);
    }

    // Agregar filtro para relevanceScore mayor que cierto valor
    if (params.filters?.relevanceScore?.$gt !== undefined) {
      queryParams = queryParams.set('filters[relevanceScore][$gt]', params.filters.relevanceScore.$gt.toString());
      console.log('[DEBUG SERVICE] Agregando filtro para relevanceScore > ' + params.filters.relevanceScore.$gt);
    }

    // Agregar filtro para articleType
    if (params.filters?.articleType) {
      queryParams = queryParams.set('filters[articleType][$eq]', params.filters.articleType);
      console.log('[DEBUG SERVICE] Agregando filtro para articleType:', params.filters.articleType);
    }

    console.log('[DEBUG SERVICE] Query params completos:', queryParams.toString());

    return this.http.get<StrapiResponse>(`${this.baseUrlStrapi}/api/noticias`, {
      headers: this.headers,
      params: queryParams,
      observe: 'body'
    });
  }

  getNewsById(id: string): Observable<NewsItem> {
    const url = `${this.baseUrlStrapi}/api/noticias?filters[id][$eq]=${id}&populate=*`;
    console.log("[DEBUG SERVICE] Solicitando noticia:", url);
    
    return this.http.get<any>(url, { 
      headers: this.headers,
      observe: 'body'
    }).pipe(
      map(response => {
        console.log("[DEBUG SERVICE] Respuesta del backend (getNewsById):", response);
        
        // Verificar la estructura de la respuesta para adaptarnos a diferentes formatos
        let article;
        
        // Adaptamos a diferentes estructuras posibles del backend
        if (response.data && Array.isArray(response.data)) {
          // Caso 1: La respuesta tiene un array en data (estructura actual)
          article = response.data[0];
        } else if (response.data?.articles && Array.isArray(response.data.articles)) {
          // Caso 2: La respuesta tiene un array en data.articles (estructura anterior)
          article = response.data.articles.find((a: any) => a.id.toString() === id);
        } else if (response.status === 'success' && response.data) {
          // Caso 3: Formato especial con status success
          article = Array.isArray(response.data) ? response.data[0] : response.data;
        }
        
        if (!article) {
          console.error("[ERROR SERVICE] No se encontró la noticia en la respuesta:", response);
          throw new Error('Noticia no encontrada');
        }
 
        console.log("[DEBUG SERVICE] Artículo encontrado:", article);
        console.log("[DEBUG SERVICE] mainImage del artículo:", article.mainImage);
        console.log("[DEBUG SERVICE] Valores originales:", {
          mainImage: article.mainImage,
          featuredImage: article.featuredImage,
          additionalImages: article.additionalImages,
          manualCreation: article.manualCreation
        });

        // Convertir el contenido a formato adecuado si es necesario
        let formattedContent;
        if (typeof article.content === 'string') {
          // Si el contenido es una cadena de HTML
          formattedContent = [{ type: 'paragraph', children: [{ text: article.content }] }];
        } else {
          // Si ya es un array o tiene otro formato
          formattedContent = article.content;
        }

        return {
          id: article.id,
          title: article.title,
          content: formattedContent,
          summary: article.summary,
          mainImage: article.mainImage,
          sourceUrl: article.sourceUrl,
          sourceName: article.sourceName,
          publishedAt: article.publishedAt,
          articleDate: article.articleDate,
          pais: article.pais,
          tags: article.tags?.map((tag: any) => ({
            id: tag.id,
            name: tag.nombre || 'Sin nombre',
            nombre: tag.nombre,
            documentId: tag.documentId,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt,
            publishedAt: tag.publishedAt,
            locale: null,
            id_tag: tag.id_tag
          })) || [],
          images: Array.isArray(article.images) ? article.images : 
                 (article.mainImage ? [article.mainImage] : []),
          createdAt: article.createdAt,
          articleType: article.articleType || 'regular',
          featuredImage: article.featuredImage || null,
          additionalImages: Array.isArray(article.additionalImages) ? article.additionalImages : [],
          manualCreation: article.manualCreation || false
        };
      }),
      catchError(error => {
        console.error('[ERROR SERVICE] Error al obtener noticia:', error);
        throw error;
      })
    );
  }

  getNewsComplete(id: string): Observable<any> {
    const url = `${this.baseUrlStrapi}/api/noticias/ver/${id}?format=json`;
    console.log("[DEBUG SERVICE] Solicitando datos completos:", url);
    
    return this.http.get<any>(url, { 
      headers: this.headers,
      observe: 'body'
    }).pipe(
      map(response => {
        console.log("[DEBUG SERVICE] Respuesta completa del backend:", response);
        console.log("[DEBUG SERVICE] mainImage en la respuesta completa:", response.mainImage);
        
        // Asegurarnos de que featuredImage y additionalImages estén correctamente estructurados
        // incluso si vienen como null o undefined desde el backend
        const processedResponse = {
          ...response,
          featuredImage: response.featuredImage || null,
          additionalImages: response.additionalImages || [],
          // Si no tiene imagen principal pero tiene images array, usar la primera como mainImage
          mainImage: response.mainImage || (response.images && response.images.length > 0 ? response.images[0] : null)
        };
        
        console.log("[DEBUG SERVICE] Respuesta procesada:", {
          mainImage: processedResponse.mainImage,
          featuredImage: processedResponse.featuredImage,
          additionalImages: processedResponse.additionalImages,
          manualCreation: processedResponse.manualCreation
        });
        
        return processedResponse;
      }),
      catchError(error => {
        console.error('[ERROR SERVICE] Error al obtener noticia completa:', error);
        throw error;
      })
    );
  }

  /**
   * Obtiene todos los tags disponibles en la base de datos
   * @returns Observable con un array de tags
   */
  getTags(): Observable<any[]> {
    // En lugar de intentar obtener los tags directamente de la API,
    // obtendremos los tags únicos de las noticias existentes
    console.log("[DEBUG SERVICE] Obteniendo tags de las noticias existentes");
    
    return this.getNews({
      page: 1,
      pageSize: 100, // Solicitar un número grande para obtener la mayoría de las noticias
      sort: 'id:desc'
    }).pipe(
      map(response => {
        console.log("[DEBUG SERVICE] Extrayendo tags de la respuesta:", response);
        
        // Verificar la estructura de la respuesta
        if (!response?.data || !Array.isArray(response.data)) {
          console.error("[ERROR SERVICE] Formato de respuesta inválido para extraer tags");
          return [];
        }
        
        // Extraer todos los tags de todas las noticias
        const allTags: any[] = [];
        response.data.forEach((item: any) => {
          // El artículo puede tener diferentes estructuras
          const article = item.attributes || item;
          
          if (article.tags) {
            // Si el artículo tiene tags en formato Strapi v4 (data/attributes)
            if (article.tags.data && Array.isArray(article.tags.data)) {
              article.tags.data.forEach((tagData: any) => {
                const tag = tagData.attributes || tagData;
                allTags.push({
                  id: tagData.id,
                  nombre: tag.nombre || tag.name || 'Sin nombre',
                  slug: tag.slug || '',
                  documentId: tag.documentId || tag.document_id || ''
                });
              });
            } 
            // Si el artículo tiene tags en formato array simple
            else if (Array.isArray(article.tags)) {
              article.tags.forEach((tag: any) => {
                allTags.push({
                  id: tag.id || 0,
                  nombre: tag.nombre || tag.name || 'Sin nombre',
                  slug: tag.slug || '',
                  documentId: tag.documentId || tag.document_id || ''
                });
              });
            }
          }
        });
        
        // Eliminar duplicados basados en el nombre
        const uniqueTags = allTags.filter((tag, index, self) =>
          index === self.findIndex(t => t.nombre === tag.nombre)
        );
        
        console.log("[DEBUG SERVICE] Tags únicos extraídos:", uniqueTags);
        return uniqueTags;
      }),
      catchError(error => {
        console.error('[ERROR SERVICE] Error al obtener tags de noticias:', error);
        // Devolver un array vacío en caso de error
        return [];
      })
    );
  }

  /**
   * Añade un nuevo suscriptor al newsletter con solo correo electrónico
   * @param email El correo electrónico del suscriptor
   * @returns Observable con la respuesta del backend
   */
  addSubscriber(email: string, frequency: string): Observable<any> {
    return from(
      new Promise<string>((resolve, reject) => {
        if (typeof grecaptcha === 'undefined' || !grecaptcha.ready || !grecaptcha.execute) {
          console.error('[SERVICE] reCAPTCHA no está listo o no está definido.');
          reject(new Error('reCAPTCHA not ready'));
          return;
        }
        grecaptcha.ready(() => {
          grecaptcha.execute('6LdNX0orAAAAAP9MEpwH0cPifQrEHv-a__mqKRJY', { action: 'submit_newsletter_subscription' })
            .then((recaptchaToken: string) => {
              if (!recaptchaToken) {
                console.error('[SERVICE] Token reCAPTCHA vacío recibido.');
                reject(new Error('Empty reCAPTCHA token'));
                return;
              }
              console.log('[SERVICE] Token reCAPTCHA obtenido:', recaptchaToken);
              resolve(recaptchaToken);
            })
            .catch((error: any) => {
              console.error('[SERVICE] Error al obtener token reCAPTCHA:', error);
              reject(error);
            });
        });
      })
    ).pipe(
      switchMap((recaptchaToken: string) => {
        const body = { email, recaptchaToken, frequency };
        console.log('[SERVICE] Enviando a backend para suscribir:', body);
        return this.http.post(`${this.baseUrlStrapi}/api/subscribers/subscribe`, body, {
          headers: this.postHeaders
        });
      }),
      map(response => {
        console.log('[SERVICE] Suscripción exitosa:', response);
        return response;
      }),
      catchError(error => {
        console.error('[SERVICE] Error en la suscripción con reCAPTCHA:', error);
        return throwError(() => error);
      })
    );
  }
}