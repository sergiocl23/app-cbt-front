import { Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

import * as echarts from 'echarts';
@Component({
  selector: 'last-simulation-card',
  standalone: true,
  imports: [
    CommonModule,

    CardModule,
    ButtonModule
  ],
  templateUrl: './last-simulation-card.component.html',
  styleUrl: './last-simulation-card.component.css'
})
export class LastSimulationCardComponent implements OnInit{

  public cities = [
    { name: 'Alto Hospicio, Chile', time: 1 },
    { name: 'Pozo Almonte, Chile', time: 3 },
    { name: 'Quillagua, Chile', time: 5 },
    { name: 'Calama, Chile', time: 8 },
  ]


  private chartInstance: any;

  categories = [
    { name: 'Categoría 1', value: 70 },
    { name: 'Categoría 2', value: 50 },
    { name: 'Categoría 3', value: 30 },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initChart();
    }
  }

  initChart(): void {
    this.chartInstance = echarts.init(document.getElementById('chart') as HTMLElement);
    this.chartInstance.setOption(this.getChartOptions());
  }

  getChartOptions() {
    const chartData = [
      { value: 34, name: 'Carne' },
      { value: 27, name: 'Tecnología' },
      { value: 17, name: 'Soya' },
      { value: 22, name: 'Otros' },
    ];

    return {
      title: {
        text: 'Porcentajes de Cargas Trasladadas',  // Aquí defines el título
        left: 'center',                // Posiciona el título en el centro
        top: 'top'                     // Posiciona el título en la parte superior
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
        const total = chartData.reduce((sum, cat) => sum + cat.value, 0);
        const percent = ((params.data.value / total) * 100).toFixed(2);
        const color = params.color; // Color de la serie
        return `
          <span style="display:inline-block;width:10px;height:10px;background-color:${color};border-radius:50%;margin-right:5px;"></span>
          ${params.data.name}: <strong>${percent}%</strong>
        `;
        },
      },
      legend: {
        show: false
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '90%'],
          // adjust the start and end angle
          startAngle: 180,
          endAngle: 360,
          data: chartData,
          emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
          },
          label: {
              show: true,
              formatter: (params: any) => {
                const total = chartData.reduce((sum, data) => sum + data.value, 0);
                const percent = ((params.data.value / total) * 100).toFixed(2);
                return `${params.data.name} \n ${percent}%`; // Muestra solo el porcentaje en la etiqueta
              },
          },

        }
      ]
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

  @HostListener('window:resize', ['$event'])
    onResize() {
        if (this.chartInstance) {
            this.chartInstance.resize();
        }
    }
}
