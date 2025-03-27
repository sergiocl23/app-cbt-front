import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { StrapiResponse, Subcategory, Topic, Post, Category, Media } from '../interfaces/forum.interface';
import { environments } from '../../../../environments/environments';
import { normalizeResponse } from '../utils/strapi.utils';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ConfirmDialogComponent } from '../../../features/forum/components/confirm-dialog/confirm-dialog.component';
import { EditTopicComponent } from '../../../features/forum/components/edit-topic/edit-topic.component';
import { EditPostComponent } from '../../../features/forum/components/edit-post/edit-post.component';
import { CreateSubcategoryComponent } from '../../../features/forum/components/create-subcategory/create-subcategory.component';
import { EditSubcategoryComponent } from '../../../features/forum/components/edit-subcategory/edit-subcategory.component';


@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private baseUrl: string = environments.baseUrlStrapi;
  private token: string = environments.strapiToken;

  constructor(private http: HttpClient, private dialog: MatDialog) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
  }

  getSubcategories(): Observable<StrapiResponse<Subcategory>> {
    return this.http.get<StrapiResponse<Subcategory>>(
      `${this.baseUrl}/api/subcategories?populate=category`,
      { headers: this.getHeaders() }
    );
  }

  getAllTopics(): Observable<Topic[]> {
    console.log('Fetching all topics...'); // Debug log
    return this.http.get<StrapiResponse<Topic>>(
      `${this.baseUrl}/api/topics`,
      { 
        headers: this.getHeaders(),
        params: new HttpParams()
          .set('populate', '*')
          .set('sort[pinned]', 'desc')  // Ordenar por pin primero
          .set('sort[createdAt]', 'desc')  // Luego por fecha de creación
          .set('timestamp', new Date().getTime().toString())
      }
    ).pipe(
      map(normalizeResponse),
      tap(topics => console.log('Fetched topics:', topics)),
      catchError(error => {
        console.error('Error details:', error);
        throw error;
      })
    );
  }

  getTopicsBySubcategory(subcategoryId: number): Observable<Topic[]> {
    return this.http.get<StrapiResponse<Topic>>(
      `${this.baseUrl}/api/topics`,
      { 
        headers: this.getHeaders(),
        params: new HttpParams()
          .set('filters[subcategory][id][$eq]', subcategoryId.toString())
          .set('populate', '*')
          .set('sort[pinned]', 'desc')  // Ordenar por pin primero
          .set('sort[createdAt]', 'desc')  // Luego por fecha de creación
          .set('timestamp', new Date().getTime().toString())
      }
    ).pipe(
      map(normalizeResponse),
      catchError(error => {
        console.error('Error details:', error);
        throw error;
      })
    );
  }

  getTopicWithPosts(id: number): Observable<Topic[]> {
    return this.http.get<StrapiResponse<Topic>>(
      `${this.baseUrl}/api/topics`,
      { 
        headers: this.getHeaders(),
        params: {
          'filters[id][$eq]': id.toString(),
          'populate[posts][populate][users_permissions_user]': '*',
          'populate[posts][populate][post]': '*',
          'populate[posts][populate][posts]': '*',
          'populate[posts][populate][images]': '*',
          'populate[users_permissions_user]': '*',
          'populate[images]': '*'
        }
      }
    ).pipe(
      map(normalizeResponse),
      map(topics => {
        if (!topics.length) throw new Error(`Topic with id ${id} not found`);
        return topics;
      })
    );
  }
  

  createPost(topic: Topic, body: string, replyTo?: Post | null, images: Media[] = []): Observable<Post> {
    const data = {
      data: {
        body,
        topic: topic.id,
        post: replyTo?.id,
        images: images.map(img => img.id)
      }
    };

    console.log('Creating post with data:', data);
    return this.http.post<StrapiResponse<Post>>(
      `${this.baseUrl}/api/posts`, 
      data,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => normalizeResponse(response)[0]),
      tap(response => console.log('Post created:', response)),
      catchError(error => {
        console.error('Error response:', error);
        return throwError(() => error);
      })
    );
  }

  createTopic(topicData: { 
    title: string; 
    body: string; 
    subcategoryId: string; 
    closed: boolean;
    pinned: boolean;
  }): Observable<StrapiResponse<Topic>> {
    return this.http.post<StrapiResponse<Topic>>(
      `${this.baseUrl}/api/topics`,
      {
        data: {
          name: topicData.title,
          body: topicData.body,
          subcategory: topicData.subcategoryId,
          closed: topicData.closed,
          pinned: topicData.pinned,
          publishedAt: new Date().toISOString()
        }
      },
      { headers: this.getHeaders() }
    ).pipe(
      tap({
        next: (response) => {
          console.log('Topic created successfully:', response);
        },
        error: (error) => {
          console.error('Error creating topic:', error);
          throw error;
        }
      })
    );
  }

  deleteTopic(topicId: number): Observable<any> {
    console.log(`Attempting to delete topic with ID: ${topicId}`);
  
    return this.http.delete(
      `${this.baseUrl}/api/topics/${topicId}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap({
        next: () => console.log('Topic deleted successfully'),
        error: (error) => {
          console.error('Error deleting topic:', error);
          throw error;
        }
      })
    );
  }
  

  confirmAndDeleteTopic(topicId: number, topicName: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Tópico',
        message: `¿Está seguro que desea eliminar "${topicName}"? Esta acción no se puede deshacer.`
      }
    });

    return dialogRef.afterClosed().pipe(
      switchMap(result => {
        if (result) {
          return this.deleteTopic(topicId).pipe(
            map(() => true)
          );
        }
        return of(false);
      })
    );
  }

  deletePost(postId: number): Observable<any> {
    // First get the post to check its images
    return this.http.get<Post>(
      `${this.baseUrl}/api/posts/${postId}`,
      { headers: this.getHeaders() }
    ).pipe(
      switchMap(post => {
        // Delete the post
        return this.http.delete(
          `${this.baseUrl}/api/posts/${postId}`,
          { headers: this.getHeaders() }
        ).pipe(
          // After deleting post, delete associated images
          tap(() => {
            if (post.images?.length) {
              post.images.forEach(image => {
                this.http.delete(
                  `${this.baseUrl}/api/upload/files/${image.id}`,
                  { headers: this.getHeaders() }
                ).subscribe();
              });
            }
          })
        );
      })
    );
  }

  confirmAndDeletePost(postId: number, postName: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Respuesta',
        message: `¿Está seguro que desea eliminar ${postName}? Esta acción no se puede deshacer.`
      }
    });

    return dialogRef.afterClosed().pipe(
      switchMap(result => {
        if (result) {
          return this.deletePost(postId).pipe(
            map(() => true)
          );
        }
        return of(false);
      })
    );
  }

  updateTopic(topicId: number, updates: { 
    name: string; 
    body: string; 
    closed: boolean;
    pinned: boolean;
    subcategory: number;
  }): Observable<any> {
    console.log('Updating topic with data:', updates);
    
    return this.http.put(
      `${this.baseUrl}/api/topics/${topicId}`,
      {
        data: {
          name: updates.name,
          body: updates.body,
          closed: updates.closed,
          pinned: updates.pinned,
          subcategory: updates.subcategory,
          publishedAt: new Date().toISOString()
        }
      },
      { headers: this.getHeaders() }
    ).pipe(
      tap({
        next: (response) => {
          console.log('Topic updated successfully:', response);
        },
        error: (error) => {
          console.error('Error updating topic:', error);
          throw error;
        }
      })
    );
  }

  openEditTopicDialog(topic: Topic): Observable<boolean> {
    const dialogRef = this.dialog.open(EditTopicComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { topic }
    });

    return dialogRef.afterClosed().pipe(
      switchMap(result => {
        if (result) {
          return this.updateTopic(topic.id, result).pipe(
            map(() => true)
          );
        }
        return of(false);
      })
    );
  }

  updatePost(post: Post): Observable<any> {
    console.log(`Updating post ${post.id} with:`, post);
    
    return this.http.put(
      `${this.baseUrl}/api/posts/${post.id}`,
      {
        data: {
          body: post.body,
          publishedAt: new Date().toISOString()
        }
      },
      { headers: this.getHeaders() }
    ).pipe(
      tap({
        next: (response) => {
          console.log('Post updated successfully:', response);
        },
        error: (error) => {
          console.error('Error updating post:', error);
          throw error;
        }
      })
    );
  }

  openEditPostDialog(post: Post): Observable<boolean> {
    const dialogRef = this.dialog.open(EditPostComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { post }
    });

    return dialogRef.afterClosed().pipe(
      switchMap(result => {
        if (result) {
          return this.updatePost(result).pipe(
            map(() => true)
          );
        }
        return of(false);
      })
    );
  }

  getGeneralCategory(): Observable<Category> {
    console.log('Fetching General category...'); // Debug log
    return this.http.get<StrapiResponse<Category>>(
      `${this.baseUrl}/api/categories?filters[name][$eq]=General&populate=*`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => console.log('Category response:', response)), // Debug log
      map(response => {
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const category = response.data[0];
          console.log('Found General category:', category); // Debug log
          return category;
        }
        throw new Error('General category not found');
      })
    );
  }

  createSubcategory(name: string): Observable<StrapiResponse<Subcategory>> {
    return this.getGeneralCategory().pipe(
      switchMap(generalCategory => {
        console.log('Creating subcategory with data:', {
          name,
          categoryId: generalCategory.id
        });
        
        return this.http.post<StrapiResponse<Subcategory>>(
          `${this.baseUrl}/api/subcategories`,
          {
            data: {
              name: name,
              category: generalCategory.id,
              publishedAt: new Date().toISOString()
            }
          },
          { headers: this.getHeaders() }
        );
      }),
      tap({
        next: (response) => {
          console.log('Subcategory creation response:', response);
        },
        error: (error) => {
          console.error('Error creating subcategory:', error);
          throw error;
        }
      })
    );
  }

  openCreateSubcategoryDialog(): Observable<boolean> {
    const dialogRef = this.dialog.open(CreateSubcategoryComponent, {
      width: '400px',
      maxWidth: '90vw'
    });

    return dialogRef.afterClosed().pipe(
      switchMap(result => {
        if (result) {
          return this.createSubcategory(result).pipe(
            map(() => true)
          );
        }
        return of(false);
      })
    );
  }

  deleteSubcategory(subcategoryId: number): Observable<any> {
    console.log(`Attempting to delete subcategory with ID: ${subcategoryId}`);

    return this.http.delete(
      `${this.baseUrl}/api/subcategories/${subcategoryId}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap({
        next: () => console.log('Subcategory deleted successfully'),
        error: (error) => {
          console.error('Error deleting subcategory:', error);
          throw error;
        }
      })
    );
  }

  confirmAndDeleteSubcategory(subcategoryId: number, subcategoryName: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Categoría',
        message: `¿Está seguro que desea eliminar "${subcategoryName}"? Esta acción no se puede deshacer.`
      }
    });

    return dialogRef.afterClosed().pipe(
      switchMap(result => {
        if (result) {
          return this.deleteSubcategory(subcategoryId).pipe(
            map(() => true)
          );
        }
        return of(false);
      })
    );
  }

  updateSubcategory(subcategoryId: number, updates: { name: string }): Observable<any> {
    console.log(`Updating subcategory ${subcategoryId} with:`, updates);
    
    return this.http.put(
      `${this.baseUrl}/api/subcategories/${subcategoryId}`,
      {
        data: {
          name: updates.name,
          publishedAt: new Date().toISOString()
        }
      },
      { headers: this.getHeaders() }
    ).pipe(
      tap({
        next: (response) => {
          console.log('Subcategory updated successfully:', response);
        },
        error: (error) => {
          console.error('Error updating subcategory:', error);
          throw error;
        }
      })
    );
  }

  openEditSubcategoryDialog(subcategory: Subcategory): Observable<boolean> {
    const dialogRef = this.dialog.open(EditSubcategoryComponent, {
      width: '400px',
      data: { subcategory }
    });

    return dialogRef.afterClosed().pipe(
      switchMap(result => {
        if (result) {
          return this.updateSubcategory(subcategory.id, result).pipe(
            map(() => true)
          );
        }
        return of(false);
      })
    );
  }

  uploadImage(formData: FormData): Observable<Media> {
    return this.http.post<Media>(
      `${this.baseUrl}/api/upload`,
      formData,
      { headers: this.getHeaders() }
    ).pipe(
      tap({
        next: (response) => console.log('Image uploaded successfully:', response),
        error: (error) => {
          console.error('Error uploading image:', error);
          throw error;
        }
      })
    );
  }

  getPost(postId: number): Observable<Post> {
    return this.http.get<StrapiResponse<Post>>(
      `${this.baseUrl}/api/posts/${postId}`,
      { 
        headers: this.getHeaders(),
        params: {
          'populate[users_permissions_user]': '*',
          'populate[images]': '*',
          'populate[topic]': '*',
          'populate[post]': '*',
          'populate[posts]': '*'
        }
      }
    ).pipe(
      map(response => normalizeResponse(response)[0])
    );
  }
}
