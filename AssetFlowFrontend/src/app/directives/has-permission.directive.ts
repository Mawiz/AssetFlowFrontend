import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../services/auth-service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  @Input()
  set appHasPermission(permission: string | string[]) {
    const names = Array.isArray(permission) ? permission : [permission];
    this.viewContainer.clear();
    if (this.authService.hasAny(names)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
