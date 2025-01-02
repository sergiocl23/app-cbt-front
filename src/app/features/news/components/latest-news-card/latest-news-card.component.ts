import { Component, Inject, Input, OnInit, OnDestroy , PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'latest-news-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    CardModule,
    ButtonModule
  ],
  templateUrl: './latest-news-card.component.html',
  styleUrl: './latest-news-card.component.css'
})

export class LatestNewsCardComponent implements OnInit, OnDestroy{

  newsList: any[] = [
        {
      title: 'Proyecto FIC “Corredor Bioceánico Tarapacá” realizó Primera Mesa de Trabajo en la UNAP',
      summary: 'El proyecto es financiado por el Gobierno Regional de Tarapacá y su Consejo Regional a través del Fondo de Innovación para la Competitividad y es ejecutado por la Universidad Arturo Prat.',
      image: 'assets/images/cover1.jpg' },
      {
        title: 'El Proyecto FIC Corredor Bioceánico Tarapacá entrega los primeros resultados de la Mesa de Trabajo',
        summary: 'El objetivo principal era generar un espacio donde los asistentes pudieran conocer el proyecto, hacer contribuciones y sugerencias que permitan enriquecerlo.',
        image: 'assets/images/cover2.jpg'
      },
  ];



  currentIndex: number = 0;
  autoplayInterval: any;
  autoplayDelay = 8000; // Cambia este valor a los milisegundos deseados para el autoplay

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoplay();
    }
  }

  ngOnDestroy(): void {
    this.clearAutoplay();
  }

  startAutoplay(): void {
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoplayDelay);
  }

  clearAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  nextSlide(): void {
    this.clearAutoplay(); // Pausa el autoplay temporalmente al cambiar manualmente
    this.currentIndex = (this.currentIndex + 1) % this.newsList.length; // Mueve al siguiente slide de forma cíclica
    this.startAutoplay();
  }

  prevSlide(): void {
    this.clearAutoplay(); // Pausa el autoplay temporalmente al cambiar manualmente
    this.currentIndex = (this.currentIndex - 1 + this.newsList.length) % this.newsList.length; // Mueve al anterior slide de forma cíclica
    this.startAutoplay();
  }
}
