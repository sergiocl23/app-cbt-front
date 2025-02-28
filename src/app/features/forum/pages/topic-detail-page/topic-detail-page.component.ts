import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { Topic, Post, Media } from '../../interfaces/forum.interface';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EditPostComponent } from '../../components/edit-post/edit-post.component';
import { Marked } from 'marked';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MarkdownEditorComponent } from '../../components/markdown-editor/markdown-editor.component';

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
    MatInputModule,
    MatSnackBarModule, 
    MarkdownEditorComponent,
  ],
  templateUrl: './topic-detail-page.component.html',
  styleUrls: ['./topic-detail-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TopicDetailComponent implements OnInit {
  topic!: Topic;
  formattedTopicContent!: SafeHtml;
  formattedPosts: { id: number; formattedContent: SafeHtml }[] = [];
  newPostContent: string = '';
  showReplyPreview = false;
  replyPreview!: SafeHtml;
  replyingTo: Post | undefined = undefined;
  
  private marked = new Marked();
  @ViewChild(MarkdownEditorComponent) markdownEditor!: MarkdownEditorComponent;

  referencedPosts: Map<number, Post> = new Map();

  constructor(
    private route: ActivatedRoute,
    private forumService: ForumService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog
  ) {
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

  async onSubmitPost() {
    if (this.topic.closed || !this.newPostContent.trim()) return;

    try {
      const { images, content } = await this.markdownEditor.uploadStoredImages();

      this.forumService.createPost(
        this.topic,
        content,
        this.replyingTo || undefined,  // Pass undefined if replyingTo is null
        images
      ).subscribe({
        next: (response) => {
          console.log('Post created successfully:', response);
          this.loadTopic(this.topic.id);
          this.newPostContent = '';
          this.replyingTo = undefined;  // Reset to undefined
        },
        error: (error) => {
          console.error('Error creating post:', error);
        }
      });
    } catch (error) {
      console.error('Error uploading images:', error);
    }
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
    this.replyingTo = undefined;
  }

  scrollToPost(event: Event, postId: number) {
    event.preventDefault();
    
    // First ensure the post is loaded
    if (!this.referencedPosts.has(postId)) {
      this.forumService.getPost(postId).subscribe(post => {
        this.referencedPosts.set(postId, post);
        this.scrollToElement(postId);
      });
    } else {
      this.scrollToElement(postId);
    }
  }

  private scrollToElement(postId: number) {
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

  onImageUploaded(media: Media) {
    console.log('Image uploaded:', media);
  }

  getReferencedPost(postId: number): Post | undefined {
    return this.referencedPosts.get(postId);
  }

  loadReferencedPost(postId: number) {
    if (!this.referencedPosts.has(postId)) {
      this.forumService.getPost(postId).subscribe(post => {
        this.referencedPosts.set(postId, post);
      });
    }
  }
}