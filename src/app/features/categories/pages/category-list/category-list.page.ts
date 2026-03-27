import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { CategoryRepository } from '../../../../core/interfaces/category.repository';
import type { Category } from '../../../../core/models/category.model';
import { TaskRepository } from '../../../../core/interfaces/task.repository';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-category-list',
  standalone: true,
  templateUrl: './category-list.page.html',
  styleUrls: ['./category-list.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonList,
    IonItemSliding,
    IonItem,
    IonLabel,
    IonItemOptions,
    IonItemOption,
    IonButton,
    IonFab,
    IonFabButton,
  ],
})
export class CategoryListPage implements OnInit {
  categories: Category[] = [];

  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly taskRepo: TaskRepository,
    private readonly alertCtrl: AlertController,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  trackByCategoryId(_index: number, category: Category): string {
    return category.id;
  }

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.categoryRepo.getAll().subscribe((list) => {
      this.categories = list;
      this.cdr.markForCheck();
    });
  }

  async openCreate(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Nueva categoría',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nombre' },
        {
          name: 'color',
          type: 'text',
          placeholder: 'Color (#RRGGBB opcional)',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            const name = (data?.name as string)?.trim();
            if (!name) {
              return false;
            }
            const color = (data?.color as string)?.trim() || undefined;
            const cat: Category = {
              id: crypto.randomUUID(),
              name,
              color,
            };
            this.categoryRepo.upsert(cat).subscribe(() => this.reload());
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async openEdit(category: Category): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Editar categoría',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre',
          value: category.name,
        },
        {
          name: 'color',
          type: 'text',
          placeholder: 'Color (#RRGGBB opcional)',
          value: category.color ?? '',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            const name = (data?.name as string)?.trim();
            if (!name) {
              return false;
            }
            const color = (data?.color as string)?.trim() || undefined;
            const updated: Category = {
              ...category,
              name,
              color,
            };
            this.categoryRepo.upsert(updated).subscribe(() => this.reload());
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async confirmDelete(category: Category): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar categoría',
      message: `¿Eliminar «${category.name}»? Las tareas asociadas quedarán sin categoría.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.detachTasksAndRemove(category.id),
        },
      ],
    });
    await alert.present();
  }

  private detachTasksAndRemove(categoryId: string): void {
    this.taskRepo
      .getAll()
      .pipe(
        switchMap((tasks) => {
          const affected = tasks.filter((t) => t.categoryId === categoryId);
          if (!affected.length) {
            return this.categoryRepo.remove(categoryId);
          }
          const updates = affected.map((t) =>
            this.taskRepo.upsert({
              ...t,
              categoryId: undefined,
            }),
          );
          return forkJoin(updates).pipe(
            switchMap(() => this.categoryRepo.remove(categoryId)),
          );
        }),
      )
      .subscribe(() => this.reload());
  }
}
