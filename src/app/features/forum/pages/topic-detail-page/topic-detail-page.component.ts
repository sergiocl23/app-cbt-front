import { Component, OnInit, OnDestroy, ViewChild, ElementRef, PLATFORM_ID, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { Topic, Post } from '../../interfaces/forum.interface';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EditPostComponent } from '../../components/edit-post/edit-post.component';
import { Marked } from 'marked';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-topic-detail',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './topic-detail-page.component.html',
  styleUrls: ['./topic-detail-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TopicDetailComponent implements OnInit, OnDestroy {
  @ViewChild('editor') editorElement!: ElementRef;
  
  topic!: Topic;
  formattedTopicContent!: SafeHtml;
  formattedPosts: { id: number; formattedContent: SafeHtml }[] = [];
  newPostContent: string = '';
  showReplyPreview = false;
  replyPreview!: SafeHtml;
  replyingTo: Post | null = null;
  
  private editor: any = null;
  private marked = new Marked();

  constructor(
    private route: ActivatedRoute,
    private forumService: ForumService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Just use basic marked configuration
    this.marked.setOptions({
      breaks: true,
      gfm: true
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.loadTopic(id);
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeEditor();
      }, 100);
    }
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.toTextArea();
      this.editor = null;
    }
  }

  private async initializeEditor() {
    if (isPlatformBrowser(this.platformId)) {
      const EasyMDE = (await import('easymde')).default;
      
      if (this.editorElement) {
        this.editorElement.nativeElement.style.display = '';
        
        try {
          this.editor = new EasyMDE({
            element: this.editorElement.nativeElement,
            spellChecker: false,
            initialValue: '',
            forceSync: true,
            placeholder: 'Escriba su respuesta aquí...',
            toolbar: [
              {
                name: "bold",
                action: EasyMDE.toggleBold,
                className: "fa fa-bold",
                title: "Negrita"
              },
              {
                name: "italic",
                action: EasyMDE.toggleItalic,
                className: "fa fa-italic",
                title: "Cursiva"
              },
              "|",
              {
                name: "heading",
                action: EasyMDE.toggleHeadingSmaller,
                className: "fa fa-header",
                title: "Encabezado"
              },
              "|",
              {
                name: "quote",
                action: EasyMDE.toggleBlockquote,
                className: "fa fa-quote-left",
                title: "Cita"
              },
              {
                name: "unordered-list",
                action: EasyMDE.toggleUnorderedList,
                className: "fa fa-list-ul",
                title: "Lista con viñetas"
              },
              {
                name: "ordered-list",
                action: EasyMDE.toggleOrderedList,
                className: "fa fa-list-ol",
                title: "Lista numerada"
              },
              "|",
              {
                name: "link",
                action: EasyMDE.drawLink,
                className: "fa fa-link",
                title: "Crear enlace"
              },
              {
                name: "image",
                action: EasyMDE.drawImage,
                className: "fa fa-image",
                title: "Insertar imagen",
              },
              "|",
              {
                name: "preview",
                action: EasyMDE.togglePreview,
                className: "fa fa-eye no-disable",
                title: "Vista previa"
              }
            ],
            renderingConfig: {
              singleLineBreaks: true,
              codeSyntaxHighlighting: false,
            },
            status: false,
            previewRender: (plainText: string, previewElement: HTMLElement) => {
              this.marked.setOptions({
                breaks: true,
                gfm: true
              });
              const rendered = this.marked.parse(plainText) as string;
              return rendered;
            },
            uploadImage: true,
            imageUploadFunction: (file: File, onSuccess: Function, onError: Function) => {
              const formData = new FormData();
              formData.append('files', file);

              this.forumService.uploadImage(formData).subscribe({
                next: (response: { url: string }) => {
                  onSuccess(response.url);
                },
                error: (error: Error) => {
                  console.error('Error uploading image:', error);
                  onError('Error al subir la imagen');
                }
              });
            }
          });

          setTimeout(() => {
            if (this.editor && this.editor.codemirror) {
              this.editor.codemirror.refresh();
            }
          }, 100);

          this.editor.codemirror.on('change', () => {
            this.newPostContent = this.editor?.value() || '';
          });
        } catch (error) {
          console.error('Error creating editor:', error);
        }
      }
    }
  }

  async formatContent(content: string): Promise<SafeHtml> {
    this.marked.setOptions({
      breaks: true,
      gfm: true
    });
    const htmlContent = this.marked.parse(content) as string;
    return this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  private async loadTopic(topicId: number) {
    this.forumService.getTopicWithPosts(topicId).subscribe(async topics => {
      if (topics && topics.length > 0) {
        this.topic = topics[0];
        this.formattedTopicContent = await this.formatContent(this.topic.body);
        
        if (this.topic.posts) {
          this.formattedPosts = await Promise.all(this.topic.posts.map(async post => ({
            id: post.id,
            formattedContent: await this.formatContent(post.body)
          })));
        }
      } else {
        console.error(`Topic ${topicId} not found`);
      }
    }, error => {
      console.error('Error loading topic:', error);
    });
  }

  onSubmitPost() {
    if (this.topic.closed) {
      console.warn('Este tópico está cerrado y no acepta nuevas respuestas');
      return;
    }

    if (!this.topic || !this.newPostContent.trim()) return;

    this.forumService.createPost(
      this.topic.id, 
      this.newPostContent,
      this.replyingTo?.id
    ).subscribe({
      next: (response) => {
        console.log('Post created successfully:', response);
        this.loadTopic(this.topic.id);
        this.newPostContent = '';
        this.replyingTo = null;
        if (this.editor) {
          this.editor.value('');
        }
      },
      error: (error) => {
        console.error('Error creating post:', error);
      }
    });
  }

  onDeletePost(post: Post) {
    this.forumService.confirmAndDeletePost(post.id, 'esta respuesta')
      .subscribe({
        next: (deleted) => {
          if (deleted && this.topic) {
            // Refresh the topic to get updated posts
            this.loadTopic(this.topic.id);
          }
        },
        error: (error) => console.error('Error deleting post:', error)
      });
  }

  canDeletePost(post: Post): boolean {
    // Add your delete permission logic here
    return true; // Or implement your actual permission check
  }

  getFormattedContent(postId: number): SafeHtml | undefined {
    return this.formattedPosts.find(p => p.id === postId)?.formattedContent;
  }

  async updateReplyPreview() {
    if (this.newPostContent) {
      const htmlContent = await marked(this.newPostContent);
      this.replyPreview = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
    }
  }

  async toggleReplyPreview() {
    this.showReplyPreview = !this.showReplyPreview;
    if (this.showReplyPreview) {
      await this.updateReplyPreview();
    }
  }

  onEditPost(post: Post): void {
    const dialogRef = this.dialog.open(EditPostComponent, {
      width: '800px',
      data: { post }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update only the body since it's a reply
        const updatedPost = { ...post, body: result.body };
        this.forumService.updatePost(updatedPost).subscribe({
          next: () => {
            this.loadTopic(this.topic.id); // Refresh the topic to show updated post
          },
          error: (error) => {
            console.error('Error updating post:', error);
            // Handle error (show message to user)
          }
        });
      }
    });
  }

  onReplyToPost(post: Post) {
    console.log('Replying to post:', post);
    this.replyingTo = post;
    document.querySelector('.reply-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  clearReplyTo() {
    this.replyingTo = null;
  }

  scrollToPost(event: Event, postId: number) {
    event.preventDefault();
    const element = document.getElementById(`post-${postId}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      
      // Add and remove highlight class
      element.classList.add('highlight-animation');
      setTimeout(() => {
        element.classList.remove('highlight-animation');
      }, 2000); // Match animation duration
    }
  }
}