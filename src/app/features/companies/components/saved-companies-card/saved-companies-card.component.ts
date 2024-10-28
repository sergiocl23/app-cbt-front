import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'saved-companies-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './saved-companies-card.component.html',
  styleUrl: './saved-companies-card.component.css'
})
export class SavedCompaniesCardComponent {
  public companies = [
    { name: 'CorsCube', logo:'assets/images/company1.png', country: 'Chile', city: 'Iquique'},
    { name: 'CargoSphere', logo:'assets/images/company2.png', country: 'Paraguay', city: 'Asunción'},
    { name: 'Shipify', logo:'assets/images/company3.png', country: 'Argentina', city: 'Salta'},
    { name: 'Voyager', logo:'assets/images/company4.png', country: 'Chile', city: 'Calama'},
  ]
}
