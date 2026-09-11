import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
@Component({
  selector: 'app-home',
  template: '<h1>{{ title() }}</h1><p>Application foundation is ready.</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly title = signal('Spatial platform').asReadonly();
}
