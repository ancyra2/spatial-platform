import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { appRoutes } from './app.routes';
describe('application routes', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideRouter(appRoutes)] }),
  );
  it('loads the start route lazily', async () => {
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeNativeElement?.textContent).toContain(
      'Application foundation is ready.',
    );
  });
  it('renders a recovery link for an unknown route', async () => {
    const harness = await RouterTestingHarness.create('/missing');
    expect(harness.routeNativeElement?.textContent).toContain('Page not found');
    expect(
      harness.routeNativeElement?.querySelector('a')?.getAttribute('href'),
    ).toBe('/');
  });
});
