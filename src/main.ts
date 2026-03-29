import { bootstrapApplication } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  checkmarkCircle,
  clipboardOutline,
  folderOutline,
  pricetagsOutline,
  trashOutline,
} from 'ionicons/icons';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

addIcons({
  trashOutline,
  pricetagsOutline,
  addCircleOutline,
  folderOutline,
  clipboardOutline,
  checkmarkCircle,
});

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
