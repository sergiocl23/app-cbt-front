import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-news-layout-page',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './news-layout-page.component.html',
  styleUrls: ['./news-layout-page.component.css']
})
export class NewsLayoutPageComponent {}
