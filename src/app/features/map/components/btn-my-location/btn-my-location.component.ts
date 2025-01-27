import { Component } from '@angular/core';
import {ButtonModule} from 'primeng/button';
import { MapService } from '../../services/map.service';

@Component({
  selector: 'btn-my-location',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './btn-my-location.component.html',
  styleUrl: './btn-my-location.component.css'
})
export class BtnMyLocationComponent {

  constructor(
    private mapService: MapService
  ){}

  goToMyLocation(){
    if( !this.mapService.isUserLocationReady) throw new Error('No hay ubicación de usuario');
    if( !this.mapService.isMapReady) throw new Error('No hay mapa disponible');

    this.mapService.flyTo( this.mapService.userLocation! );
  }

}
