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
  IonCard,
  IonCardContent,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { CategoryRepository } from '../../../../core/interfaces/category.repository';
import type { Category } from '../../../../core/models/category.model';
import { TaskRepository } from '../../../../core/interfaces/task.repository';
import { categoryListCardSurface } from '../../../../core/utils/category-appearance';
import { parseColorInputToHex } from '../../../../core/utils/color-input';
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
    IonCard,
    IonCardContent,
    IonButton,
    IonFab,
    IonFabButton,
    IonIcon,
    IonModal,
    IonInput,
  ],
})
export class CategoryListPage implements OnInit {
  categories: Category[] = [];

  categoryFormOpen = false;
  categoryFormMode: 'create' | 'edit' = 'create';
  categoryFormName = '';
  /** Texto libre: #RRGGBB, #RGB o rgb(...). Vacío = color automático. */
  categoryFormColorRaw = '';
  private editingCategory: Category | null = null;

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

  categorySurface(category: Category): Record<string, string> {
    return categoryListCardSurface(category);
  }

  /** Vista previa del color cuando el texto es válido. */
  categoryFormColorPreview(): string | null {
    const parsed = parseColorInputToHex(this.categoryFormColorRaw);
    if (parsed === null || parsed === undefined) {
      return null;
    }
    return parsed;
  }

  openCreate(): void {
    this.categoryFormMode = 'create';
    this.editingCategory = null;
    this.categoryFormName = '';
    this.categoryFormColorRaw = '';
    this.categoryFormOpen = true;
    this.cdr.markForCheck();
  }

  openEdit(category: Category): void {
    this.categoryFormMode = 'edit';
    this.editingCategory = category;
    this.categoryFormName = category.name;
    this.categoryFormColorRaw = category.color?.trim() ?? '';
    this.categoryFormOpen = true;
    this.cdr.markForCheck();
  }

  closeCategoryForm(): void {
    this.categoryFormOpen = false;
    this.cdr.markForCheck();
  }

  onCategoryFormDismiss(): void {
    this.editingCategory = null;
    this.categoryFormName = '';
    this.categoryFormColorRaw = '';
    this.cdr.markForCheck();
  }

  saveCategoryForm(): void {
    const name = this.categoryFormName.trim();
    if (!name) {
      void this.showNameRequiredAlert();
      return;
    }

    const parsed = parseColorInputToHex(this.categoryFormColorRaw);
    if (parsed === undefined) {
      void this.showInvalidColorAlert();
      return;
    }
    const color = parsed === null ? undefined : parsed;

    if (this.categoryFormMode === 'create') {
      const cat: Category = {
        id: crypto.randomUUID(),
        name,
        color,
      };
      this.categoryRepo.upsert(cat).subscribe(() => {
        this.reload();
        this.closeCategoryForm();
      });
      return;
    }

    if (this.editingCategory) {
      const updated: Category = {
        ...this.editingCategory,
        name,
        color,
      };
      this.categoryRepo.upsert(updated).subscribe(() => {
        this.reload();
        this.closeCategoryForm();
      });
    }
  }

  private async showNameRequiredAlert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      cssClass: 'app-alert-rounded',
      header: 'Nombre obligatorio',
      message: 'Escribe un nombre para la categoría.',
      buttons: [{ text: 'Entendido', role: 'cancel' }],
    });
    await alert.present();
  }

  private async showInvalidColorAlert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      cssClass: 'app-alert-rounded',
      header: 'Color HEX no válido',
      message:
        'El color debe ir en hexadecimal empezando con # (ej. #3880ff o #3af). Puedes dejar el campo vacío para color automático.',
      buttons: [{ text: 'Entendido', role: 'cancel' }],
    });
    await alert.present();
  }

  async confirmDelete(category: Category): Promise<void> {
    const alert = await this.alertCtrl.create({
      cssClass: 'app-alert-rounded',
      header: 'Eliminar categoría',
      message: `¿Quieres eliminar «${category.name}»? Las tareas asociadas quedarán sin categoría.`,
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
