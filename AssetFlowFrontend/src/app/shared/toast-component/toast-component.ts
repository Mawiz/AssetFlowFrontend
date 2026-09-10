import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastMessage } from '../../model/toast';

@Component({
  selector: 'app-toast-component',
  imports: [CommonModule],
  templateUrl: './toast-component.html',
  styleUrl: './toast-component.scss',
  standalone: true
})
export class ToastComponent {
  toasts: { message: string, type: 'success' | 'error' }[] = [];

  show(message: string, type: 'success' | 'error' = 'success', duration = 3000) {
    const toast = { message, type };
    this.toasts.push(toast);
    setTimeout(() => this.removeToast(toast), duration);
  }

  removeToast(toast: any) {
    const index = this.toasts.indexOf(toast);
    if (index > -1) this.toasts.splice(index, 1);
  }
}
