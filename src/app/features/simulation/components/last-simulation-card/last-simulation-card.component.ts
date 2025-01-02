import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';

import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'last-simulation-card',
  standalone: true,
  imports: [
    CommonModule,

    CardModule,
    ButtonModule,
    ChartModule
  ],
  templateUrl: './last-simulation-card.component.html',
  styleUrl: './last-simulation-card.component.css'
})
export class LastSimulationCardComponent implements OnInit {

  data: any;
  options: any;

  public cities = [
    { name: 'Alto Hospicio, Chile', time: 1 },
    { name: 'Pozo Almonte, Chile', time: 3 },
    { name: 'Quillagua, Chile', time: 5 },
    { name: 'Calama, Chile', time: 8 },
  ]

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    Chart.register(ChartDataLabels);
  }

  ngOnInit(): void {
    this.data = {
      labels: ['Carne', 'Tecnología', 'Soya', 'Otros'],
      datasets: [
        {
          data: [68, 54, 34, 44],
        }
      ]
    };


    this.options = {
      responsive: true,  // Hace que el gráfico sea responsivo
      maintainAspectRatio: false,  // Permite que se ajusten las proporciones
      aspectRatio: 1,            // Proporción opcional si deseas controlar el comportamiento
      cutoutPercentage: 60,      // Ajusta el "hueco" central del doughnut (ajusta según sea necesario)
      rotation: -90,
      circumference: 180,
      // cutout: 100,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: false,
          text: 'Porcentaje de cargas trasladadas',
          font: {
            size: 20,
          }
        },
        tooltip: {
          titleFont: {
            size: 0
          },
          bodyFont: {
            size: 15,
            weight: 'bold',
          },
          usePointStyle: true, // Usa un punto en lugar de un rectángulo de color
          padding: 10, // Agrega espacio interno en el tooltip
          callbacks: {
            labelPointStyle: () => ({
              pointStyle: 'rectRounded', // Hace que el punto sea un cuadro redondeado
              rotation: 0
            }),
            label: (context: any) => {
              // Configura el formato de la etiqueta en el tooltip
              const label = context.label || '';
              const value = context.raw;
              return ` ${label}: ${value} `;
            }
          },

        },
        datalabels: {
          backgroundColor: function(context: any) {
            return context.dataset.backgroundColor;
          },
          borderColor: 'white',
          borderRadius: 25,
          borderWidth: 2,
          color: 'white',
          display: function(context: any) {
            var dataset = context.dataset;
            var count = dataset.data.length;
            var value = dataset.data[context.dataIndex];
            return value > count * 1.5;
          },
          font: {
            weight: 'bold'
          },
          padding: 6,
          formatter: (value: number, context: any) => {
            const label = context.chart.data.labels[context.dataIndex]; // Obtiene la etiqueta
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0); // Calcula el total
            const percentage = ((value / total) * 100).toFixed(0); // Calcula el porcentaje
            return `${label}: ${percentage}%`; // Devuelve el texto "etiqueta: porcentaje%"
          },
          anchor: 'end',
        }
      },
      layout: {
        padding: {
          top: 0, // Reduce el espacio superior
          bottom: 0, // Reduce el espacio inferior
          right: 40,
          left: 40

      },
      },
    };
  }

  // Función para obtener el color de fondo de la distancia
  getTimeColor(time: number): string {
    if (time < 3) {
      return 'green-circle';  // Verde si está a menos de 100 km
    } else if (time >= 3 && time <= 6) {
      return 'yellow-circle'; // Amarillo si está entre 100 y 400 km
    } else {
      return 'gray-circle';   // Gris si está a más de 400 km
    }
  }

}
