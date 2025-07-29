import { Component, computed, inject, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';

import { FormsModule } from '@angular/forms';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { MessagesModule } from 'primeng/messages';
import { InputTextModule } from 'primeng/inputtext';
import { Message } from 'primeng/api';

@Component({
  selector: 'app-main-layout-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    ButtonModule,
    ToolbarModule,
    DropdownModule,

    InputTextModule,
    MessagesModule,

    FormsModule,

    SidebarComponent,

  ],
  templateUrl: './main-layout-page.component.html',
  styleUrl: './main-layout-page.component.css'
})
export class MainLayoutPageComponent implements OnInit{
  public isSidebarOpen = true;
  static sidebarState: boolean = true;

  public showVerificationMessage = false;

  authService = inject(AuthService);
  public user = computed(() => this.authService.user());

  isBrowser!: boolean;

  languages = [
      { name: 'Español', code: 'es', flag:'assets/images/flags/espana.png' },
      { name: 'Inglés', code: 'en', flag:'assets/images/flags/estados-unidos.png' },
      { name: 'Portugués', code: 'pt', flag:'assets/images/flags/brasil.png' },
      { name: 'Guaraní', code: 'gn', flag:'assets/images/flags/paraguay.png' },
  ];

  selectedLanguage = this.languages[0];

  messages!: Message[];
  successMessage!: Message[];

  constructor(@Inject(PLATFORM_ID) private platformId: object, private route: ActivatedRoute) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.messages = [
      {
        severity: 'warn',
        detail: 'La plataforma se encuentra actualmente en fase de pruebas. Agradecemos su comprensión mientras continuamos mejorando la plataforma.',
        closable: false,
        summary: 'ATENCIÓN',
      },
    ];

    this.route.queryParamMap.subscribe(params => {
      const verified = params.get('verified');
      this.successMessage = [{
        severity: 'success',
        detail: '¡Tu correo ha sido verificado exitosamente!',
        summary: 'ÉXITO',
      }];
      this.showVerificationMessage = verified === '1';
    });
  }

  changeLanguage() {
    console.log(`Idioma cambiado a: ${this.selectedLanguage.name}`);
    // Aquí puedes añadir la lógica para cambiar el idioma
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  get mainContentClass() {
    // return '';
    return this.isSidebarOpen ? 'sidebar-open' : '';
  }


}
