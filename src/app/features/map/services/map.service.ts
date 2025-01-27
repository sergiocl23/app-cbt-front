import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Point, Points } from '../interfaces/point.interface';
import { environments } from '../../../../environments/environments';
import { resolve } from 'node:path';
import { rejects } from 'node:assert';
import { isPlatformBrowser } from '@angular/common';
import { LngLatLike, Map } from 'mapbox-gl';

@Injectable({providedIn: 'root'})
export class MapService {

  private map?: Map;

  private baseUrlStrapi: string = environments.baseUrlStrapi;
  private token: string = environments.strapiToken;

  public userLocation?: [number, number];

  get isUserLocationReady(): boolean {
    return !!this.userLocation;
  }

  get isMapReady(): boolean {
    return !!this.map;
  }

  setMap( map: Map ) {
    this.map = map;
  }

  flyTo( coords: LngLatLike ){
    if( !this.isMapReady) throw new Error('El mapa no esta inicializado');

    this.map?.flyTo({
      zoom: 14,
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

}
