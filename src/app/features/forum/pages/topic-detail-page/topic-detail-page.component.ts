import { Component, OnInit } from '@angular/core';
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
  styleUrls: ['./topic-detail-page.component.scss']
})
export class TopicDetailComponent implements OnInit {
  topic!: Topic;
  formattedTopicContent!: SafeHtml;
  formattedPosts: { id: number; formattedContent: SafeHtml }[] = [];
  newPostContent: string = '';
  showReplyPreview = false;
  replyPreview!: SafeHtml;

  constructor(
    private route: ActivatedRoute,
    private forumService: ForumService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.loadTopic(id);
    });
  }

  async formatContent(content: string): Promise<SafeHtml> {
    const htmlContent = await marked(content);
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

    this.forumService.createPost(this.topic.id, this.newPostContent)
      .subscribe({
        next: () => {
          this.loadTopic(this.topic.id);
          this.newPostContent = '';
        },
        error: (error) => console.error('Error:', error)
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
}