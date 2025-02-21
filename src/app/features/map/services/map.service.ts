import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { Point, Points } from '../interfaces/point.interface';
import { environments } from '../../../../environments/environments';
import { resolve } from 'node:path';
import { rejects } from 'node:assert';
import { isPlatformBrowser } from '@angular/common';
import { LngLatBounds, LngLatLike, Map, SourceSpecification } from 'mapbox-gl';
import { Feature, PlacesResponse } from '../interfaces/places.interace';
import { DirectionsResponse, Route } from '../interfaces/directions.interface';
import { PlacesNominatim } from '../interfaces/placesNominatim.interface';
import { SearchResultItem } from '../interfaces/searchResultItem.interface';

@Injectable({providedIn: 'root'})
export class MapService {

  private map?: Map;

  private baseUrlStrapi: string = environments.baseUrlStrapi;
  private token: string = environments.strapiToken;
  private mapBoxKey: string = environments.mapBoxKey;

  public userLocation?: [number, number];

  public isLoadingPlaces: boolean = false;
  public places: PlacesNominatim[] = [];

  get isUserLocationReady(): boolean {
    return !!this.userLocation;
  }

  get isMapReady(): boolean {
    return !!this.map;
  }
  get Map(): Map {
    return this.map!;
  }

  setMap( map: Map ) {
    this.map = map;
  }

  flyTo( coords: LngLatLike ){
    if( !this.isMapReady) throw new Error('El mapa no esta inicializado');

    this.map?.flyTo({
      zoom: 18,
      center: coords
    })
  }

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID)
    private platformId: Object,
  ) {
    this.getUserLocation();
  }

  public async getUserLocation(): Promise<[number, number]>{
    return new Promise( (resolve, reject ) => {
      if (isPlatformBrowser(this.platformId)){
        navigator.geolocation.getCurrentPosition(
          ( { coords } ) => {
            this.userLocation = [coords.longitude, coords.latitude];
            resolve(this.userLocation);
          },
          ( err ) => {
            alert('No se pudo obtener la geolocalizción');
            console.log(err);
            reject();
          }
        );
      }

    } );
  }

  getPoints():Observable<Points>{

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    })

    return this.http.get<Points>(`${ this.baseUrlStrapi }/api/points?populate=*`, { headers });
  }

  getPlacesByQuery( query: string = '' ){
    if( query.length === 0 ){
      this.isLoadingPlaces = false;
      this.places = [];
      return;
    }

    this.isLoadingPlaces = true;
    /*
    forkJoin({
      mapbox: this.http.get<PlacesResponse>(`https://api.mapbox.com/search/geocode/v6/forward?q=${ query }&proximity=${ this.userLocation?.join(',') }&language=es&limit=5&access_token=${ this.mapBoxKey }`).pipe(catchError(() => of({ features: [] }))),
      nominatim: this.http.get<PlacesNominatim[]>(`https://nominatim.openstreetmap.org/search?q=${ query }&format=json&limit=5`).pipe(catchError(() => of([]))),
    }).pipe(
      map(({ mapbox, nominatim }) => {
        // Mapear los resultados de Mapbox
        const mapboxResults = mapbox.features.map((feature: Feature) => ({
          id: feature.id,
          name: feature.properties.name,
          address: feature.properties.full_address,
          lat: feature.properties.coordinates.latitude,
          lon: feature.properties.coordinates.longitude,
          source: 'Mapbox',
        }));

        // Mapear los resultados de Nominatim
        const nominatimResults = nominatim.map((place: PlacesNominatim) => ({
          id: place.place_id,
          name: place.display_name,
          address: place.display_name,
          lat: parseFloat(place.lat),
          lon: parseFloat(place.lon),
          source: 'Nominatim',
        }));

        // Combinar resultados y evitar duplicados
        return [...mapboxResults, ...nominatimResults].filter(
          (v, i, a) => a.findIndex((t) => t.lat === v.lat && t.lon === v.lon) === i
        );
      })
    ).subscribe((results) => {
      this.isLoadingPlaces = false;
      this.places = results;
    });
    */


    this.http.get<PlacesNominatim[]>(`https://nominatim.openstreetmap.org/search?q=${ query }&format=json&limit=5&lon=${ this.userLocation![0]}.3522&lat=${ this.userLocation![1]}`)
      .subscribe( resp => {
        this.isLoadingPlaces = false;
        this.places = resp;
        console.log(`https://nominatim.openstreetmap.org/search?q=${ query }&format=json&limit=5&lon=${ this.userLocation![0]}.3522&lat=${ this.userLocation![1]}`);
      });

    // this.http.get<PlacesResponse>(`https://api.mapbox.com/search/geocode/v6/forward?q=${ query }&proximity=${ this.userLocation?.join(',') }&language=es&access_token=${ this.mapBoxKey }`)
    //   .subscribe( resp => {
    //     this.isLoadingPlaces = false;
    //     this.places = resp.features;
    //   });
  }



  getRouteBetweenPoints( start: [number, number], end: [number, number]){
    this.http.get<DirectionsResponse>(`https://api.mapbox.com/directions/v5/mapbox/driving/${ start.join(',') };${ end.join(',') }?alternatives=false&geometries=geojson&language=es&overview=full&steps=false&access_token=${ this.mapBoxKey }`)
      .subscribe( resp => {
        // console.log(`https://api.mapbox.com/directions/v5/mapbox/driving/${ start.join(',') };${ end.join(',') }?alternatives=false&geometries=geojson&language=es&overview=full&steps=false&access_token=${ this.mapBoxKey }`);
        // console.log(resp);
        this.drawPolyline(resp.routes[0]);
      });
  }

  private drawPolyline(route: Route){
    console.log(
      {
        kms: route.distance/1000,
        duration: route.duration/60
      }
    );

    if(!this.map) throw Error('Mapa no inicializado');

    const coords = route.geometry.coordinates;
    const bounds = new LngLatBounds();
    coords.forEach( ([lng, lat]) => {
      bounds.extend([lng, lat]);
    })

    this.map?.fitBounds( bounds, {
      padding: 100
    })

    // Polyline
    const sourceData: SourceSpecification = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coords,
            }
          }
        ]
      }
    };

    // TODO: Limipar ruta previa
    if(this.map.getLayer('RouteString')){
      this.map.removeLayer('RouteString');
      this.map.removeSource('RouteString');
    }

    this.map.addSource('RouteString', sourceData);

    this.map.addLayer({
      id: 'RouteString',
      type: 'line',
      source: 'RouteString',
      layout: {
       'line-cap': 'round',
       'line-join': 'round'
      },
      paint: {
        'line-color': 'black',
        'line-width': 3
      }
    })

  }

  deletePlaces() {
    this.places = [];
  }

}
