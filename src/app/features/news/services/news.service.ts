import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
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
      articleType: 'regular' | 'topicFeatured' | 'topicSmall';
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

interface StrapiArticle {
  title: string;
  content: string;
  summary: string;
  mainImage: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: string;
  articleDate: string;
  pais: string;
  tags: {
    data: {
      id: number;
      attributes: {
        name: string;
        nombre: string;
        documentId: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        locale: string | null;
        id_tag: string;
      };
    }[];
  };
  images: string[];
  createdAt: string;
  articleType: 'regular' | 'topicFeatured' | 'topicSmall';
  featuredImage?: any;
  additionalImages?: any[];
  manualCreation?: boolean;
}

interface StrapiSingleResponse {
  status: string;
  data: {
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
    articleType: 'regular' | 'topicFeatured' | 'topicSmall';
    featuredImage?: any;
    additionalImages?: any[];
    manualCreation?: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private baseUrlStrapi = environments.baseUrlStrapi;
  private token: string = environments.strapiToken;
  private headers: HttpHeaders;

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
  }

  private cleanHtmlTags(text: string): string {
    return text
      .replace(/<\/?[^>]+(>|$)/g, '') // Elimina todas las etiquetas HTML
      .replace(/&nbsp;/g, ' ')        // Reemplaza &nbsp; por espacio
      .replace(/\s+/g, ' ')           // Reduce múltiples espacios a uno
      .trim();                        // Elimina espacios al inicio y final
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

    if (params.filters?.articleDate?.$gte) {
      queryParams = queryParams.set('filters[articleDate][$gte]', params.filters.articleDate.$gte);
    }

    if (params.filters?.articleDate?.$lte) {
      queryParams = queryParams.set('filters[articleDate][$lte]', params.filters.articleDate.$lte);
    }

    if (params.filters?.pais) {
      queryParams = queryParams.set('filters[pais][$eq]', params.filters.pais);
    }

    if (params.filters?.tags?.nombre?.$in?.length > 0) {
      params.filters.tags.nombre.$in.forEach((tag: string, index: number) => {
        queryParams = queryParams.set(
          `filters[$and][${index}][tags][nombre][$eq]`, 
          tag
        );
      });
    }

    console.log('Query params:', queryParams.toString());

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
}