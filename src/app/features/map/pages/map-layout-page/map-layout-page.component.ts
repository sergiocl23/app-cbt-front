import { Component, Inject, PLATFORM_ID, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import mapboxgl, { Map, NavigationControl, LngLat, Marker, Popup, LngLatBounds } from 'mapbox-gl';
import { Feature, LineString } from 'geojson';
import { environments } from '../../../../../environments/environments';
import { HttpClient } from '@angular/common/http';

mapboxgl.accessToken = environments.mapBoxKey;

@Component({
  selector: 'app-map-layout-page',
  standalone: true,
  imports: [],
  templateUrl: './map-layout-page.component.html',
  styleUrl: './map-layout-page.component.css'
})
export class MapLayoutPageComponent implements AfterViewInit, OnDestroy{
  private map!: Map;
  private currentLngLat: LngLat = new LngLat(-70.14056585946109, -20.24473796434132);

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {

      this.map = new Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-64.09705313935333, -22.520013511251367],
        zoom: 6.5,
        pitch: 45
      })

      this.map.addControl(new NavigationControl());

      // Marker ubicacion
      // this.createCurrentLocationMarker(this.map, this.currentLngLat)

      this.getRoute([-70.13662363926578, -20.23110856880029], [-57.88345909398014, -21.697567863951402]);
      this.addMarker(this.map, [-70.13662363926578, -20.23110856880029]);
      this.addMarker(this.map, [-57.88345909398014, -21.697567863951402]);


    }
  }

  // Detecta cambios en el tamaño de la ventana
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if (this.map) {
      this.map.resize(); // Ajusta el mapa al nuevo tamaño del contenedor
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

   // Obtener y graficar la ruta
  getRoute(start: [number, number], end: [number, number]) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.join(',')};${end.join(',')}?geometries=geojson&overview=full&access_token=${environments.mapBoxKey}`;

    this.http.get(url).subscribe((response: any) => {
      const data = response.routes[0].geometry;

      // Crear fuente para la ruta
      this.map.on('load', () => {
        this.map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: data
          }
        });

        // Agregar la línea al mapa
        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#FF5733', // Color de la línea (naranja en este caso)
            'line-width': 5, // Grosor de la línea
          }
        });
      });
    });
  }

  // Agregar marcador en un punto
  addMarker(map: Map, coordinates: [number, number]) {
    new mapboxgl.Marker(({
      color: 'red'
    })).setLngLat(coordinates).addTo(map);
  }

}
