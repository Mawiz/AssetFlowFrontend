import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { AppFloatingConfigurator } from '@/layout/component/app.floatingconfigurator';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    AppFloatingConfigurator
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService]
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  rememberMe = false;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // If a previous user session exists, clear it before showing login
    if (this.authService.isAuthenticated()) {
      this.authService.logout();
    }
  }

  onLogin() {
    if (!this.username || !this.password) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing Information',
        detail: 'Please enter both username and password.',
      });
      return;
    }

    this.loading = true;
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Login Successful',
            detail: 'Redirecting to dashboard...',
          });
          setTimeout(() => this.router.navigate(['/dashboard']), 800);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Invalid Login',
            detail: 'Incorrect username or password.',
          });
        }
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: 'Please check your credentials or try again later.',
        });
      },
    });
  }
}
