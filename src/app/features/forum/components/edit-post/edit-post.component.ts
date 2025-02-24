import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { Post } from '../../interfaces/forum.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-post.component.html',
  styleUrl: './edit-post.component.css'
})
export class EditPostComponent {
  editedPost: Post;
  showPreview = false;
  previewContent!: SafeHtml;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { post: Post },
    private dialogRef: MatDialogRef<EditPostComponent>,
    private sanitizer: DomSanitizer
  ) {
    this.editedPost = { ...data.post };
  }

  async togglePreview() {
    this.showPreview = !this.showPreview;
    if (this.showPreview) {
      await this.updatePreview();
    }
  }

  async updatePreview() {
    const htmlContent = await marked(this.editedPost.body);
    this.previewContent = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.editedPost);
  }
}
