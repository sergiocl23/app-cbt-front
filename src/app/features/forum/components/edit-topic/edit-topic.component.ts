import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { Topic, Subcategory, StrapiResponse } from '../../interfaces/forum.interface';
import { ForumService } from '../../services/forum.service';

@Component({
  selector: 'app-edit-topic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-topic.component.html',
  styleUrls: ['./edit-topic.component.css']
})
export class EditTopicComponent implements OnInit {
  editedTopic: {
    name: string;
    body: string;
    closed: boolean;
    pinned: boolean;
    subcategoryId: number;
  };
  subcategories: Subcategory[] = [];
  showPreview = false;
  previewContent!: SafeHtml;

  constructor(
    public dialogRef: MatDialogRef<EditTopicComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { topic: Topic },
    private sanitizer: DomSanitizer,
    private forumService: ForumService
  ) {
    this.editedTopic = {
      name: data.topic.name,
      body: data.topic.body,
      closed: data.topic.closed || false,
      pinned: data.topic.pinned || false,
      subcategoryId: data.topic.subcategory?.id || 0
    };
  }

  ngOnInit() {
    this.loadSubcategories();
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

  async togglePreview() {
    this.showPreview = !this.showPreview;
    if (this.showPreview) {
      await this.updatePreview();
    }
  }

  async updatePreview() {
    const htmlContent = await marked(this.editedTopic.body);
    this.previewContent = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editedTopic.name.trim() && this.editedTopic.body.trim()) {
      this.dialogRef.close({
        name: this.editedTopic.name,
        body: this.editedTopic.body,
        closed: this.editedTopic.closed,
        pinned: this.editedTopic.pinned,
        subcategory: this.editedTopic.subcategoryId
      });
    }
  }
}
