import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    DividerModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isOpen: boolean = false; // Recibe el estado desde el componente padre
  @Output() close = new EventEmitter<void>(); // Emite cuando el sidebar se cierra

  public sidebarItems = [
    { label: 'Genericas', show: false, sections: [
      { label: 'Inicio', icon: 'home', url: 'home'},
      { label: 'Portal de Noticias', icon: 'newspaper', url: 'news'},
      // { label: 'Catálogo de Empresas', icon: 'store', url: 'a'},
      { label: 'Mapa Interactivo', icon: 'map', url: 'map'},
      // { label: 'Foro', icon: 'forum', url: 'forum'},
      { label: 'Simulación', icon: 'route', url: 'simulation'},
      // { label: 'Contactos', icon: 'perm_contact_calendar', url: 'a'},
      // { label: 'Aprende', icon: 'menu_book', url: 'a'},
    ]},
    // { label: 'Portal de Noticias', show: true, sections: [
    //   { label: 'Ver Noticas', icon: 'newspaper', url: 'news'},
    //   { label: 'Mis Noticias', icon: 'folder_open', url: 'a'},
    //   { label: 'Publicar Noticia', icon: 'post_add', url: 'a'},
    // ]},
    // { label: 'Catálogo de Empresas', show: true, sections: [
    //   { label: 'Ver Empresas', icon: 'store', url: 'companies'},
    //   { label: 'Matchmaking', icon: 'groups', url: 'a'},
    //   { label: 'Gestor de Reuniones', icon: 'calendar_month', url: 'a'},
    // ]},
    // { label: 'Mapa Interactivo', show: true, sections: [
    //   { label: 'Ver Mapa', icon: 'map', url: 'a'},
    //   { label: 'Crear Marcador', icon: 'location_on', url: 'a'},
    // ]},
    // { label: 'Simulación', show: true, sections: [
    //   { label: 'Realizar simulación', icon: 'route', url: 'simulation'},
    // ]},
    // { label: 'Foro', show: true, sections: [
    //   { label: 'Ver Publicaciones', icon: 'forum', url: 'a'},
    //   { label: 'Mis Publicaciones', icon: 'folder_open', url: 'a'},
    //   { label: 'Realizar Publicación', icon: 'post_add', url: 'a'},
    // ]},
    // { label: 'Aprende', show: true, sections: [
    //   { label: 'Plataforma Digital', icon: 'devices', url: 'a'},
    //   { label: 'Corredor Bioceánico', icon: 'local_shipping', url: 'a'},
    // ]},
  ];

  onClose() {
    this.close.emit(); // Emite evento de cierre
  }
}
