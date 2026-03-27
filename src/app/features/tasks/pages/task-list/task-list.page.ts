import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CategoryRepository } from '../../../../core/interfaces/category.repository';
import type { Category } from '../../../../core/models/category.model';
import { TaskRepository } from '../../../../core/interfaces/task.repository';
import type { Task } from '../../../../core/models/task.model';
import {
  taskMatchesCategoryFilter,
  type TaskCategoryFilter,
} from '../../../../core/utils/task-category-filter';
import { AppRemoteConfigService } from '../../../../services/remote-config/app-remote-config.service';

/** Umbral para activar virtual scroll (CDK) y desactivar scroll nativo de ion-content. */
const VIRTUAL_SCROLL_THRESHOLD = 100;

@Component({
  selector: 'app-task-list',
  standalone: true,
  templateUrl: './task-list.page.html',
  styleUrls: ['./task-list.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ScrollingModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonList,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonInput,
    IonSelect,
    IonSelectOption,
  ],
})
export class TaskListPage implements OnInit {
  tasks: Task[] = [];
  /** Subconjunto filtrado (evita re-evaluar un pipe en cada ciclo de virtual scroll). */
  filteredTasks: Task[] = [];
  /** Si true: lista renderizada con CDK Virtual Scroll y sin scroll en ion-content. */
  virtualScrollActive = false;

  categories: Category[] = [];
  categoryFilter: TaskCategoryFilter = 'all';

  newTitle = '';
  newCategoryId = '';

  constructor(
    private readonly taskRepo: TaskRepository,
    private readonly categoryRepo: CategoryRepository,
    readonly remoteConfig: AppRemoteConfigService,
    private readonly alertCtrl: AlertController,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  /** TrackBy explícito para *cdkVirtualFor y listas @for (equivalente a trackBy de *ngFor). */
  trackByTaskId(_index: number, task: Task): string {
    return task.id;
  }

  trackByCategoryId(_index: number, category: Category): string {
    return category.id;
  }

  onCategoryFilterChange(): void {
    this.recomputeFiltered();
    this.cdr.markForCheck();
  }

  reload(): void {
    this.taskRepo.getAll().subscribe((t) => {
      this.tasks = t;
      this.recomputeFiltered();
      this.cdr.markForCheck();
    });
    this.categoryRepo.getAll().subscribe((c) => {
      this.categories = c;
      this.cdr.markForCheck();
    });
  }

  categoryLabel(categoryId: string | undefined): string {
    if (categoryId == null || categoryId === '') {
      return 'Sin categoría';
    }
    return this.categories.find((c) => c.id === categoryId)?.name ?? categoryId;
  }

  addTask(): void {
    const title = this.newTitle.trim();
    if (!title) {
      return;
    }
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      categoryId: this.newCategoryId ? this.newCategoryId : undefined,
      createdAt: new Date().toISOString(),
    };
    this.taskRepo.upsert(task).subscribe(() => {
      this.newTitle = '';
      this.reload();
    });
  }

  toggleComplete(task: Task, checked: boolean | undefined): void {
    if (checked === undefined) {
      return;
    }
    this.taskRepo.upsert({ ...task, completed: checked }).subscribe(() => {
      this.reload();
    });
  }

  deleteTask(task: Task): void {
    this.taskRepo.remove(task.id).subscribe(() => this.reload());
  }

  async confirmDeleteAllTasks(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar todas las tareas',
      message:
        'Se borrarán todas las tareas guardadas localmente. Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar todas',
          role: 'destructive',
          handler: () => {
            this.deleteAllTasks();
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private deleteAllTasks(): void {
    this.taskRepo
      .getAll()
      .pipe(
        switchMap((tasks) => {
          if (!tasks.length) {
            return of(undefined);
          }
          return forkJoin(tasks.map((t) => this.taskRepo.remove(t.id)));
        }),
      )
      .subscribe(() => this.reload());
  }

  private recomputeFiltered(): void {
    this.filteredTasks = this.tasks.filter((t) =>
      taskMatchesCategoryFilter(t, this.categoryFilter),
    );
    this.virtualScrollActive =
      this.filteredTasks.length > VIRTUAL_SCROLL_THRESHOLD;
  }
}
