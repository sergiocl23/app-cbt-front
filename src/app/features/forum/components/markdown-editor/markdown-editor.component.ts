import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, forwardRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Media } from '../../interfaces/forum.interface';
import { ForumService } from '../../services/forum.service';
import { isPlatformBrowser } from '@angular/common';

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
  private uploadedImages: Media[] = [];
  private tempImages: { file: File, tempUrl: string, markdown: string }[] = [];

  private editor: any = null;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private forumService: ForumService,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeEditor();
    }
  }

  ngOnDestroy() {
    this.tempImages.forEach(img => URL.revokeObjectURL(img.tempUrl));
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
        const tempUrl = URL.createObjectURL(file);
        const imageMarkdown = `![${file.name}](${tempUrl})`;
        
        this.tempImages.push({ 
          file, 
          tempUrl,
          markdown: imageMarkdown 
        });
        
        editor.codemirror.replaceSelection(imageMarkdown);
        document.body.removeChild(fileInput);
      }
    };

    fileInput.click();
  }

  async uploadStoredImages(): Promise<{images: Media[], content: string}> {
    const uploadedImages: Media[] = [];
    let content = this.editor.value();

    for (const img of this.tempImages) {
      const formData = new FormData();
      formData.append('files', img.file);

      try {
        const response = await this.forumService.uploadImage(formData).toPromise() as Media;
        if (response && response.url) {
          uploadedImages.push(response);
          // Replace temp URL with real URL in content
          content = content.replace(img.markdown, `![${img.file.name}](${response.url})`);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    }

    // Clean up temp URLs
    this.tempImages.forEach(img => URL.revokeObjectURL(img.tempUrl));
    this.tempImages = [];

    return { images: uploadedImages, content };
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

  getUploadedImages(): Media[] {
    return this.uploadedImages;
  }
}