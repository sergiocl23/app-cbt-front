import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { Subcategory, Topic, StrapiResponse } from '../../interfaces/forum.interface';
import { ForumService } from '../../services/forum.service';
import { tap } from 'rxjs/operators';
import { AuthService } from 'src/app/features/auth/services/auth.service';

@Component({
  selector: 'app-forum-layout-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule
  ],
  templateUrl: './forum-layout-page.component.html',
  styleUrls: ['./forum-layout-page.component.css']
})
export class ForumLayoutPageComponent implements OnInit {
  authService = inject(AuthService);

  subcategories: Subcategory[] = [];
  topics: Topic[] = [];
  selectedSubcategory: Subcategory | null = null;

  public user = computed(() => this.authService.user());

  public hasAccess: boolean = (this.user()?.role?.id==3) ? true : false;

  constructor(
    private forumService: ForumService,
    private router: Router  // Add Router injection
  ) {}

  ngOnInit() {
    this.loadSubcategories();
    this.loadTopics();
  }

  loadSubcategories() {
    this.forumService.getSubcategories()
      .subscribe({
        next: (response: StrapiResponse<Subcategory>) => {
          this.subcategories = Array.isArray(response.data) ? response.data : [response.data];
        },
        error: (error) => console.error('Error loading subcategories:', error)
      });
  }

  loadTopics() {
    if (this.selectedSubcategory) {
      this.forumService.getTopicsBySubcategory(this.selectedSubcategory.id)
        .subscribe({
          next: (topics) => {
            this.topics = this.sortTopics(topics);
          },
          error: (error) => console.error('Error loading topics:', error)
        });
    } else {
      this.forumService.getAllTopics()
        .subscribe({
          next: (topics) => {
            this.topics = this.sortTopics(topics);
          },
          error: (error) => console.error('Error loading topics:', error)
        });
    }
  }

  private sortTopics(topics: Topic[]): Topic[] {
    return topics.sort((a, b) => {
      // Primero ordenar por estado de pin
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // Si el estado de pin es el mismo (ambos están fijados), ordenar por fecha de creación (más reciente primero)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  selectSubcategory(subcategory: Subcategory | null) {
    this.selectedSubcategory = subcategory;
    if (subcategory) {
      this.forumService.getTopicsBySubcategory(subcategory.id)
        .subscribe({
          next: (topics) => {
            this.topics = topics;
          },
          error: (error) => console.error('Error loading subcategory topics:', error)
        });
    } else {
      this.loadTopics();
    }
  }

  onNewTopic() {
    // Navigate to the new topic form
    this.router.navigate(['/forum/new']);
  }

  onDeleteTopic(event: Event, topic: Topic) {
    event.stopPropagation(); // Prevent navigation to topic detail

    this.forumService.confirmAndDeleteTopic(topic.id, topic.name)
      .subscribe({
        next: (deleted) => {
          if (deleted) {
            // Remove the deleted topic from the local array
            this.topics = this.topics.filter(t => t.id !== topic.id);

            // Optionally, refresh the full list
            if (this.selectedSubcategory) {
              this.selectSubcategory(this.selectedSubcategory);
            } else {
              this.loadTopics();
            }
          }
        },
        error: (error) => console.error('Error in delete operation:', error)
      });
  }

  onEditTopic(event: Event, topic: Topic) {
    event.stopPropagation();

    this.forumService.openEditTopicDialog(topic)
      .subscribe({
        next: (updated) => {
          if (updated) {
            // Force reload all data
            this.loadTopics();

            // Also update the specific topic in the current array
            const index = this.topics.findIndex(t => t.id === topic.id);
            if (index !== -1) {
              this.topics[index] = { ...this.topics[index], ...topic };
            }
          }
        },
        error: (error) => console.error('Error updating topic:', error)
      });
  }

  getPreviewText(text: string, maxLength: number = 150): string {
    // Simple text truncation without markdown processing
    const plainText = text
      .replace(/[#*\[\]`_]/g, '') // Remove markdown symbols
      .replace(/\s+/g, ' ')       // Normalize whitespace
      .trim();

    return plainText.length <= maxLength
      ? plainText
      : plainText.substring(0, maxLength) + '...';
  }

  onCreateSubcategory(): void {
    this.forumService.openCreateSubcategoryDialog()
      .subscribe(created => {
        if (created) {
          this.loadSubcategories(); // Refresh the list
        }
      });
  }

  async onDeleteSubcategory(event: Event, subcategory: Subcategory) {
    event.stopPropagation(); // Prevent triggering the selectSubcategory

    this.forumService.confirmAndDeleteSubcategory(subcategory.id, subcategory.name)
      .pipe(
        tap(deleted => {
          if (deleted) {
            // If the deleted subcategory was selected, clear the selection
            if (this.selectedSubcategory?.id === subcategory.id) {
              this.selectedSubcategory = null;
            }
            // Refresh the subcategories list
            this.loadSubcategories();
          }
        })
      )
      .subscribe();
  }

  onEditSubcategory(event: Event, subcategory: Subcategory): void {
    event.stopPropagation();

    this.forumService.openEditSubcategoryDialog(subcategory)
      .pipe(
        tap(updated => {
          if (updated) {
            this.loadSubcategories();
          }
        })
      )
      .subscribe();
  }
}
