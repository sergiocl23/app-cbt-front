import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subcategory } from '../../interfaces/forum.interface';

@Component({
  selector: 'app-edit-subcategory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-subcategory.component.html',
  styleUrls: ['./edit-subcategory.component.css']
})
export class EditSubcategoryComponent {
  subcategoryName: string = '';

  constructor(
    public dialogRef: MatDialogRef<EditSubcategoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { subcategory: Subcategory }
  ) {
    this.subcategoryName = data.subcategory.name;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.subcategoryName.trim()) {
      this.dialogRef.close({ name: this.subcategoryName });
    }
  }
}
