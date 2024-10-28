import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'last-simulation-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './last-simulation-card.component.html',
  styleUrl: './last-simulation-card.component.css'
})
export class LastSimulationCardComponent {

}
