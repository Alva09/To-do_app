import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuButton,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  MenuController,
  ViewWillEnter,
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
import { taskCardSurfaceStyles } from '../../../../core/utils/category-appearance';
import { AppRemoteConfigService } from '../../../../services/remote-config/app-remote-config.service';

/** Umbral para activar virtual scroll (CDK) y desactivar scroll nativo de ion-content. */
const VIRTUAL_SCROLL_THRESHOLD = 100;

const TASK_LIST_CONTENT_ID = 'task-list-main';
const TASK_CATEGORY_MENU_ID = 'task-category-menu';

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
    IonCard,
    IonCardContent,
    IonCheckbox,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonMenu,
    IonList,
    IonItem,
    IonLabel,
    IonMenuButton,
  ],
})
export class TaskListPage implements ViewWillEnter {
  readonly taskListContentId = TASK_LIST_CONTENT_ID;
  readonly taskCategoryMenuId = TASK_CATEGORY_MENU_ID;
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
    private readonly menuCtrl: MenuController,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  /** Recarga al entrar a la pantalla (p. ej. al volver de Categorías con una categoría nueva). */
  ionViewWillEnter(): void {
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

  filterActive(value: TaskCategoryFilter): boolean {
    return this.categoryFilter === value;
  }

  filterActiveCategory(categoryId: string): boolean {
    return this.categoryFilter === categoryId;
  }

  async setCategoryFilter(value: TaskCategoryFilter): Promise<void> {
    this.categoryFilter = value;
    this.onCategoryFilterChange();
    await this.menuCtrl.close(this.taskCategoryMenuId);
  }

  async closeCategoryMenu(): Promise<void> {
    await this.menuCtrl.close(this.taskCategoryMenuId);
  }

  /** Texto compacto del filtro activo (visible en mobile bajo el encabezado). */
  categoryFilterLabel(): string {
    if (this.categoryFilter === 'all') {
      return 'Todas las tareas';
    }
    if (this.categoryFilter === 'uncategorized') {
      return 'Sin categoría';
    }
    const c = this.categories.find((x) => x.id === this.categoryFilter);
    return c ? `${c.name}` : 'Todas las tareas';
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
    return (
      this.categories.find((c) => c.id === categoryId)?.name ?? 'Sin categoría'
    );
  }

  /** Fondo de tarjeta: blanco sin categoría; tinte suave del color de la categoría si aplica. */
  taskSurface(task: Task): Record<string, string> {
    return taskCardSurfaceStyles(
      task.categoryId,
      this.categories,
      task.completed,
    );
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

  async confirmDeleteTask(task: Task): Promise<void> {
    const alert = await this.alertCtrl.create({
      cssClass: 'app-alert-rounded',
      header: 'Eliminar tarea',
      message:
        'Esta tarea se va a eliminar de forma permanente. ¿Estás seguro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.taskRepo.remove(task.id).subscribe(() => this.reload());
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async confirmDeleteAllTasks(): Promise<void> {
    const alert = await this.alertCtrl.create({
      cssClass: 'app-alert-rounded',
      header: 'Eliminar todas las tareas',
      message:
        'Se van a eliminar todas las tareas guardadas en este dispositivo. No podrás deshacer esta acción.',
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
