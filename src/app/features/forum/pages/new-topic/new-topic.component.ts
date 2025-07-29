import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { Subcategory, Topic, StrapiResponse } from '../../interfaces/forum.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { AuthService } from 'src/app/features/auth/services/auth.service';

@Component({
  selector: 'app-new-topic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-topic.component.html',
  styleUrls: ['./new-topic.component.css']
})
export class NewTopicComponent implements OnInit {
  authService = inject(AuthService);
  public user = computed(() => this.authService.user());

  subcategories: Subcategory[] = [];
  newTopic = {
    title: '',
    body: '',
    subcategoryId: '',
    closed: false,
    pinned: false
  };
  previewContent!: SafeHtml;
  showPreview = false;

  constructor(
    private forumService: ForumService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadSubcategories();
  }

  async togglePreview() {
    this.showPreview = !this.showPreview;
    if (this.showPreview) {
      await this.updatePreview();
    }
  }

  async updatePreview() {
    const htmlContent = await marked(this.newTopic.body);
    this.previewContent = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  loadSubcategories() {
    this.forumService.getSubcategories()
      .subscribe({
        next: (response: StrapiResponse<Subcategory>) => {
          this.subcategories = Array.isArray(response.data) ? response.data : [response.data];
        },
        error: (error) => console.error('Error loading subcategories:', error)
      });
  }

  createTopic() {
    if (!this.newTopic.title.trim() || !this.newTopic.body.trim() || !this.newTopic.subcategoryId) {
      return;
    }

    this.forumService.createTopic(this.newTopic, this.user()!)
      .subscribe({
        next: (response: StrapiResponse<Topic>) => {
          const topicId = Array.isArray(response.data) ? response.data[0].id : response.data.id;
          this.router.navigate(['/forum/topic', topicId]);
        },
        error: (error) => console.error('Error creating topic:', error)
      });
  }

  cancelCreate() {
    this.router.navigate(['/forum']);
  }
}
