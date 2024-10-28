import { Component, Inject, Input, OnInit, OnDestroy , PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


import { RouterModule } from '@angular/router';


@Component({
  selector: 'latest-news-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './latest-news-card.component.html',
  styleUrl: './latest-news-card.component.css'
})

export class LatestNewsCardComponent implements OnInit, OnDestroy{

  newsList: any[] = [
    {
      title: 'Item 1',
      summary: 'Lorem ipsum odor amet, consectetuer adipiscing elit. Sagittis molestie cursus proin turpis augue. Malesuada pellentesque egestas diam quam phasellus ut. Netus habitant imperdiet sem facilisi bibendum interdum torquent vulputate. Varius dis facilisi eros eleifend vulputate; gravida quisque',
      image: 'assets/images/cover1.jpg'
    },
    {
      title: 'Item 2',
      summary: 'Natoque accumsan cras cursus sed iaculis luctus. Pretium turpis elit mattis maecenas eu nam mollis posuere. Montes condimentum per faucibus nullam, dis himenaeos netus mi orci. Sem ad diam cursus platea risus dapibus auctor tincidunt.',
      image: 'assets/images/cover2.jpg' },
    {
      title: 'Item 3',
      summary: 'Natoque accumsan cras cursus sed iaculis luctus. Pretium turpis elit mattis maecenas eu nam mollis posuere. Montes condimentum per faucibus nullam, dis himenaeos netus mi orci. Sem ad diam cursus platea risus dapibus auctor tincidunt.',
      image: 'assets/images/cover2.jpg' },
  ];



  currentIndex: number = 0;
  autoplayInterval: any;
  autoplayDelay = 3000; // Cambia este valor a los milisegundos deseados para el autoplay

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
