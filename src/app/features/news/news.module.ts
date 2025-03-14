import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';

import { ListPageComponent } from './pages/list-page/list-page.component';
import { ListPageCarouselComponent } from './pages/list-page-carousel/list-page-carousel.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    InputTextModule,
    DropdownModule,
    MultiSelectModule,
    ButtonModule,
    CarouselModule,
    ListPageComponent,
    ListPageCarouselComponent
  ],
  exports: [
    ListPageComponent,
    ListPageCarouselComponent
  ]
})
export class NewsModule { } 