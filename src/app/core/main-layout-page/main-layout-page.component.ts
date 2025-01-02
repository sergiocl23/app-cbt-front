import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';

import { FormsModule } from '@angular/forms';

import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    ButtonModule,
    ToolbarModule,
    DropdownModule,

    FormsModule,

    SidebarComponent,

  ],
  templateUrl: './main-layout-page.component.html',
  styleUrl: './main-layout-page.component.css'
})
export class MainLayoutPageComponent{
  isSidebarOpen: boolean = true;
  isBrowser!: boolean;

  languages = [
      { name: 'Español', code: 'es', flag:'assets/images/flags/espana.png' },
      { name: 'Inglés', code: 'en', flag:'assets/images/flags/estados-unidos.png' },
      { name: 'Portugués', code: 'pt', flag:'assets/images/flags/brasil.png' },
      { name: 'Guaraní', code: 'gn', flag:'assets/images/flags/paraguay.png' },
  ];

  selectedLanguage = this.languages[0];

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
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
