import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MapService } from '../../services/map.service';
import mapboxgl from 'mapbox-gl';

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

    const map = this.mapService.Map
    const iconId = `circle-point-my-location`;
    const iconUrl = 'assets/images/icons/my-location.png';

    //Elimina cualquier marcador previo con el mismo ID
    if (map.getLayer(iconId)) {
      map.removeLayer(iconId);
    }
    if (map.getSource(iconId)) {
      map.removeSource(iconId);
    }

    if (!map.hasImage(iconId)) {
      map.loadImage(iconUrl, (error, image) => {
        if (error) throw error;

        // Agregar la imagen con un identificador único
        map.addImage(iconId, image!);

        // Agregar el punto al mapa con su icono correspondiente
        this.mapService.addPointToMap(map, this.mapService.userLocation!, iconId, 'Mi ubicación');
      })
    }
    else{
      // Si la imagen ya está cargada, solo agrega el punto con su icono
      this.mapService.addPointToMap(map, this.mapService.userLocation!, iconId, 'Mi ubicación');
    }


  }

}
