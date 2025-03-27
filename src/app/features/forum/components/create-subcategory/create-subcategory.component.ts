import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-create-subcategory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-subcategory.component.html',
  styleUrls: ['./create-subcategory.component.css']
})
export class CreateSubcategoryComponent {
  subcategoryName: string = '';

  constructor(
    public dialogRef: MatDialogRef<CreateSubcategoryComponent>
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.subcategoryName.trim()) {
      this.dialogRef.close(this.subcategoryName);
    }
  }
}
