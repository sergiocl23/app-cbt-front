import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

interface Meeting {
  company: {
    name: string;
    logo: string; // URL o path del logo de la empresa
  };
  country: string;
  date: string; // Formato de fecha, por ejemplo: '2024-10-27'
  time: string; // Formato de hora, por ejemplo: '14:00'
  status: 'Pendiente' | 'Agendada' | 'Por Confirmar';
}

@Component({
  selector: 'upcoming-meetings-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule
  ],
  templateUrl: './upcoming-meetings-card.component.html',
  styleUrl: './upcoming-meetings-card.component.css'
})
export class UpcomingMeetingsCardComponent {

  public meetings: Meeting[] = [
    { company: { name: 'QuickShip', logo:'assets/images/company5.png'}, country: 'Chile', date: '15 de Octubre', time: '10:00', status: 'Pendiente' },
    { company: { name: 'Exporium', logo:'assets/images/company6.png'}, country: 'Brasil', date: '23 de Octubre', time: '09:30', status: 'Agendada' },
    { company: { name: 'TradeWave', logo:'assets/images/company7.png'}, country: 'Argentina', date: '05 de Novimbre', time: '13:00', status: 'Por Confirmar' },
  ]

  displayedColumns: string[] = ['Empresa', 'País', 'Fecha', 'Estado'];

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pendiente':
        return 'estado-pendiente';
      case 'Agendada':
        return 'estado-agendada';
      case 'Por Confirmar':
        return 'estado-por-confirmar';
      default:
        return '';
    }
  }

}
