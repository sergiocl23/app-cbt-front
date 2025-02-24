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

    return this.http.get<StrapiResponse>(url, { 
      headers: this.headers,
      observe: 'body'
    }).pipe(
      map(response => {
        const article = response.data?.articles?.find(a => a.id.toString() === id);
        
        if (!article) {
          throw new Error('Noticia no encontrada');
        }

        return {
          id: article.id,
          title: article.title,
          content: Array.isArray(article.content) 
            ? article.content 
            : [{ type: 'paragraph', children: [{ text: article.content }] }],
          summary: article.summary,
          mainImage: article.mainImage,
          sourceUrl: article.sourceUrl,
          sourceName: article.sourceName,
          publishedAt: article.publishedAt,
          articleDate: article.articleDate,
          pais: article.pais,
          tags: article.tags?.map(tag => ({
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
          images: article.images || [],
          createdAt: article.createdAt,
          articleType: article.articleType
        };
      })
    );
  }
}