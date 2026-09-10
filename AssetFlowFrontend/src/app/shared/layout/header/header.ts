import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUserName: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.currentUserName = user?.fullName || 'User';
  }

  logout() {
    this.authService.logout();
  }
}
