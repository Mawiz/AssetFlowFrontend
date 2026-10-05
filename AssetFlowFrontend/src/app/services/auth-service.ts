import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments';
import { jwtDecode } from 'jwt-decode';

const PERMISSIONS_KEY = 'permissions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    const apiUrl = `${environment.apiUrl}/User/Authenticate`;
    const body = { userName: username, password: password };

    return this.http.post<any>(apiUrl, body).pipe(
      tap((response) => {
        if (response.success && response.result?.token) {
          localStorage.setItem('authToken', response.result.token);
          localStorage.setItem(
            PERMISSIONS_KEY,
            JSON.stringify(response.result.permissions ?? [])
          );
          this.loggedIn = true;
        }
      })
    );
  }

  logout() {
    this.loggedIn = false;
    localStorage.removeItem('authToken');
    localStorage.removeItem(PERMISSIONS_KEY);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getPermissions(): string[] {
    try {
      const raw = localStorage.getItem(PERMISSIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  hasPermission(name: string): boolean {
    if (this.systemAdminPermissions()) {
      return true;
    }
    return this.getPermissions().includes(name);
  }

  hasAny(names: string[]): boolean {
    return names.some((name) => this.hasPermission(name));
  }

  hasPrefix(prefix: string): boolean {
    if (this.systemAdminPermissions()) {
      return true;
    }
    return this.getPermissions().some((p) => p.startsWith(prefix));
  }

  private decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

  getCurrentUser() {
    return this.decodeToken();
  }

  /** Numeric application user id (matches WorkOrder.assignedToUserId and API userId claim). */
  getUserId(): number | null {
    const decoded: any = this.decodeToken();
    if (!decoded) return null;

    const fromClaim = decoded.userId ?? decoded['userId'] ?? decoded.nameid;
    if (fromClaim != null && fromClaim !== '') {
      const n = Number(fromClaim);
      if (!Number.isNaN(n)) return n;
    }

    const nameIdentifier =
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    if (nameIdentifier != null && nameIdentifier !== '') {
      const n = Number(nameIdentifier);
      if (!Number.isNaN(n)) return n;
    }

    // AssetFlow JWT uses sub for username, not id — only use sub when it is numeric.
    const sub = decoded.sub;
    if (sub != null && /^\d+$/.test(String(sub).trim())) {
      return Number(String(sub).trim());
    }

    return null;
  }

  getUserName(): string | null {
    const decoded: any = this.decodeToken();
    return (
      decoded?.unique_name ||
      decoded?.name ||
      decoded?.['http://schemas.microsoft.com/ws/2005/05/identity/claims/name'] ||
      null
    );
  }

  getEmail(): string | null {
    const decoded: any = this.decodeToken();
    return decoded?.email || null;
  }

  getRole(): string | null {
    const decoded: any = this.decodeToken();

    return (
      decoded?.role ||
      decoded?.roles ||
      decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      null
    );
  }

  getTenantId(): number | null {
    const decoded: any = this.decodeToken();

    return (
      decoded?.tenantId ||
      decoded?.tenant ||
      decoded?.['tenantId'] ||
      null
    );
  }

  systemAdminPermissions(): boolean {
    const tenant = this.getTenantId();
    return tenant === null || tenant == 0;
  }
}
