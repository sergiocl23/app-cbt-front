import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Media } from '../../interfaces/forum.interface';
import { ForumService } from '../../services/forum.service';

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MarkdownEditorComponent),
      multi: true,
    }
  ]
})
export class MarkdownEditorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('editor') editorElement!: ElementRef;
  @Input() placeholder: string = 'Escriba aquí...';
  @Input() initialValue: string = '';
  @Output() imageUploaded = new EventEmitter<Media>();

  private editor: any = null;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private forumService: ForumService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initializeEditor();
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.toTextArea();
      this.editor = null;
    }
  }

  private async initializeEditor() {
    const EasyMDE = (await import('easymde')).default;
    
    if (this.editorElement) {
      this.editor = new EasyMDE({
        element: this.editorElement.nativeElement,
        spellChecker: false,
        initialValue: this.initialValue,
        forceSync: true,
        placeholder: this.placeholder,
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
            action: (editor) => this.handleImageUpload(editor),
            className: "fa fa-image",
            title: "Insertar imagen"
          },
          "|",
          {
            name: "preview",
            action: EasyMDE.togglePreview,
            className: "fa fa-eye no-disable",
            title: "Vista previa"
          }
        ],
        status: false
      });

      this.editor.codemirror.on('change', () => {
        const value = this.editor.value();
        this.onChange(value);
        this.onTouched();
      });
    }
  }

  private handleImageUpload(editor: any) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    fileInput.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        const loadingSnackBar = this.snackBar.open('Subiendo imagen...', '', {
          duration: undefined,
        });

        const formData = new FormData();
        formData.append('files', file);

        this.forumService.uploadImage(formData).subscribe({
          next: (response) => {
            loadingSnackBar.dismiss();
            const imageUrl = response.url;
            const imageMarkdown = `![${file.name}](${imageUrl})`;
            editor.codemirror.replaceSelection(imageMarkdown);
            
            this.snackBar.open('Imagen subida correctamente', 'OK', {
              duration: 3000,
            });
            
            this.imageUploaded.emit(response);
            document.body.removeChild(fileInput);
          },
          error: (error) => {
            loadingSnackBar.dismiss();
            console.error('Error uploading image:', error);
            
            this.snackBar.open('Error al subir la imagen', 'OK', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            
            document.body.removeChild(fileInput);
          }
        });
      }
    };

    fileInput.click();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    if (this.editor && value !== null) {
      this.editor.value(value);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.editor) {
      this.editor.codemirror.setOption('readOnly', isDisabled);
    }
  }
}