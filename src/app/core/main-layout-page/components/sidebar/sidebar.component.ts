import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AuthService } from 'src/app/features/auth/services/auth.service';

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

  authService = inject(AuthService);
  router = inject(Router)

  public user = computed(() => this.authService.user());

  // public name = this.user()!.name;
  // public lastName = this.user()!.lastName;
  // public role = this.user()?.role?.name;
  // public initials = (this.name[0] + this.lastName[0]).toUpperCase();

  public name = this.user()?.name;
  public lastName = this.user()?.lastName;
  public role = this.user()?.role?.name;
  public initials = this.name && this.lastName?(this.name[0] + this.lastName[0]).toUpperCase():'';
  public id_role = this.user()?.role?.id;
  public name_color = (this.id_role==1)?'bg-green':'bg-red';

  public sidebarItems = [
    { label: 'Genericas', show: false, sections: [
      { label: 'Competencias de Tarapacá', icon: 'checklist', url: 'a'},
      // { label: 'Inicio', icon: 'home', url: 'home'},
      { label: 'Portal de Noticias', icon: 'newspaper', url: 'news/carousel'},
      // { label: 'Catálogo de Empresas', icon: 'store', url: 'a'},
      { label: 'Mapa Interactivo', icon: 'map', url: 'map'},
      { label: 'Foro', icon: 'forum', url: 'forum'},
      { label: 'Simulación', icon: 'route', url: 'simulation'},
      // { label: 'Contactos', icon: 'perm_contact_calendar', url: 'a'},
    ]},
    //{ label: 'Portal de Noticias', show: true, sections: [
      //{ label: 'Ver Noticias', icon: 'newspaper', url: 'news/list'},
      //{ label: 'Noticias Carrusel', icon: 'view_carousel', url: 'news/carousel'},
    //]},
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

  onLogout(){
    this.authService.logout();
    // this.router.navigateByUrl('/auth/login');
     window.location.reload();
  }

  onClose() {
    this.close.emit(); // Emite evento de cierre
  }
}
