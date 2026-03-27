import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Ejemplo de componente presentacional reutilizable en varias features */
@Component({
  selector: 'app-placeholder-card',
  standalone: true,
  template: `
    <div class="card">
      <h2>{{ title() }}</h2>
      <ng-content />
    </div>
  `,
  styles: [
    `
      .card {
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid var(--ion-border-color, #ccc);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceholderCardComponent {
  readonly title = input.required<string>();
}
