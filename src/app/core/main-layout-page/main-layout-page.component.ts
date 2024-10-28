import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule
  ],
  templateUrl: './main-layout-page.component.html',
  styleUrl: './main-layout-page.component.css'
})
export class MainLayoutPageComponent{

  public sidebarItems = [
    { label: 'Inicio', icon: 'home', url: 'home'},
    { label: 'Portal de noticias', icon: 'newspaper', url: 'news'},
    { label: 'Simulación', icon: 'route', url: 'simulation'},
    { label: 'Mapa Interactivo', icon: 'map_search', url: 'map'},
    { label: 'Catálogo de Empresas', icon: 'menu_book', url: 'companies'}
  ]
  /*
  isCollapsed = false;  // El sidenav comienza expandido

  toggleSidenav() {
    this.isCollapsed = !this.isCollapsed;  // Alterna entre expandido y colapsado
  }
  */

}
