import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments';
import { jwtDecode } from 'jwt-decode';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;

  constructor(private http: HttpClient, private router: Router) {}

  // 🔹 LOGIN
  login(username: string, password: string): Observable<any> {
    const apiUrl = `${environment.apiUrl}/User/Authenticate`;
    const body = { userName: username, password: password };

    return this.http.post<any>(apiUrl, body).pipe(
      tap((response) => {
        if (response.success && response.result?.token) {
          // ✅ Store ONLY token
          localStorage.setItem('authToken', response.result.token);

          this.loggedIn = true;
        }
      })
    );
  }

  // 🔹 LOGOUT
  logout() {
    this.loggedIn = false;
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  // 🔹 CHECK AUTH
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // 🔹 GET TOKEN
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // 🔹 DECODE TOKEN (CORE FUNCTION)
  private decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }

  // 🔹 GENERIC USER (ALL CLAIMS)
  getCurrentUser() {
    return this.decodeToken();
  }

  // 🔹 GET USER ID
  getUserId(): string | null {
    const decoded: any = this.decodeToken();
    return (
      decoded?.sub ||
      decoded?.nameid ||
      decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      null
    );
  }

  // 🔹 GET USERNAME
  getUserName(): string | null {
    const decoded: any = this.decodeToken();
    return (
      decoded?.unique_name ||
      decoded?.name ||
      decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      null
    );
  }

  // 🔹 GET EMAIL
  getEmail(): string | null {
    const decoded: any = this.decodeToken();
    return decoded?.email || null;
  }

  // 🔹 GET ROLE
  getRole(): string | null {
    const decoded: any = this.decodeToken();

    return (
      decoded?.role ||
      decoded?.roles ||
      decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      null
    );
  }

  // 🔹 GET TENANT ID
  getTenantId(): number | null {
    const decoded: any = this.decodeToken();

    return (
      decoded?.tenantId ||
      decoded?.tenant ||
      decoded?.['tenantId'] ||
      null
    );
  }

  // 🔹 SYSTEM ADMIN CHECK
  systemAdminPermissions(): boolean {
    const tenant = this.getTenantId();
    return tenant === null || tenant == 0;
  }
}
