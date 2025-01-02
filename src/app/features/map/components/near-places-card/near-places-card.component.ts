import { Component, Inject, PLATFORM_ID, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

import mapboxgl, { Map, NavigationControl, LngLat, Marker, Popup, LngLatBounds } from 'mapbox-gl';
import { environments } from '../../../../../environments/environments';

mapboxgl.accessToken = environments.mapBoxKey;

@Component({
  selector: 'near-places-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule
  ],
  templateUrl: './near-places-card.component.html',
  styleUrl: './near-places-card.component.css'
})
export class NearPlacesCardComponent implements AfterViewInit, OnDestroy{
  private map!: Map;
  private currentLngLat: LngLat = new LngLat(-70.14056585946109, -20.24473796434132);
  public nearPlaces = [
    { order: 1 ,name: 'Alto Hospicio, Chile', distance: '16.4', coords: [-70.09697379013878, -20.293861412727768], color: 'orange' },
    { order: 2 ,name: 'Pozo Almonte, Chile', distance: '60.8', coords: [-69.78570822059187, -20.257099018382934], color: 'orange' },
    { order: 3 ,name: 'Quillagua, Chile', distance: '223', coords: [-69.53410809315363, -21.658873217010314], color: 'orange' },
    { order: 4 ,name: 'María Elena, Chile', distance: '278', coords: [-69.66202232267717,-22.34462964408669], color: 'orange' },
    { order: 5 ,name: 'Calama, Chile', distance: '379', coords: [-68.92879299594195, -22.454528879239856], color: 'orange' },
    { order: 6 ,name: 'San Pedro de Atacama, Chile', distance: '493', coords: [-68.1990509416736, -22.90927031661637], color: 'orange' },
  ]
  displayedColumns: string[] = ['numero', 'nombre', 'distancia'];
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.map = new Map({
        container: 'map-near-places',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: this.currentLngLat,
        zoom: 8,
        pitch: 45
      })

      this.map.addControl(new NavigationControl());

      // Marker ubicacion
      const currentLocationMarker = this.createCurrentLocationMarker(this.map, this.currentLngLat)

      const bounds = new LngLatBounds();

      this.nearPlaces.forEach(place => {

        const el = document.createElement('div');
        el.className = 'marker';
        el.innerText = (place.order).toString(); // Mostrar el número del lugar en el marcador

        // Personalizar el marcador con CSS
        el.style.width = '25px';
        el.style.height = '25px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = 'rgb(193 193, 193)';
        el.style.fontWeight = 'bold';
        el.style.display = 'flex';
        el.style.justifyContent = 'center';
        el.style.alignItems = 'center';
        el.style.fontSize = '15px';



        // Crea el popup
        const popup = new Popup().setText(place.name);

        const marker = new Marker(el)
          .setLngLat(new LngLat(place.coords[0], place.coords[1]))
          .setPopup(popup)
          .addTo(this.map);

        this.reSizeMarker(marker);

        bounds.extend(place.coords as [number, number]);
      });

      this.map.fitBounds(bounds, { padding: 50 });

    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove(); // Elimina el mapa al destruir el componente
    }
  }

  createCurrentLocationMarker( map: Map, lngLat: LngLat): Marker{
    const locationMarker = new Marker(({
      color: 'red'
    }))
      .setLngLat( lngLat )
      .addTo(map)

    this.reSizeMarker(locationMarker);

    // Crea el popup
    const popup = new Popup({ offset: 25 }).setText('Ubicación Actual');
    locationMarker.setPopup(popup);

    return locationMarker;
  }

  reSizeMarker(marker: Marker){
    const markerElement = marker.getElement();
    const iconElement = markerElement.querySelector('img') || markerElement.querySelector('svg');

    if (iconElement) {
      iconElement.style.width = '30px';  // Ajusta el ancho del icono
      iconElement.style.height = '30px'; // Ajusta la altura del icono
    }
  }

  // Función para obtener el color de fondo de la distancia
  getDistanceColor(distancia: string): string {
    const dist = Number(distancia)
    if (dist < 100) {
      return 'green-circle';  // Verde si está a menos de 100 km
    } else if (dist >= 100 && dist <= 400) {
      return 'yellow-circle'; // Amarillo si está entre 100 y 400 km
    } else {
      return 'gray-circle';   // Gris si está a más de 400 km
    }
  }

}
