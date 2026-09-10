import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments';
import { CreateUserDto, UpdateUserDto, UserFilterDto } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  create(dto: CreateUserDto): Observable<any> {
    return this.http.post(this.apiUrl, dto);
  }

  update(dto: UpdateUserDto): Observable<any> {
    return this.http.put(this.apiUrl, dto);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  filter(filter: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/filter`, filter).pipe(
      tap({
        next: () => console.log('UserService.filter() response received'),
        error: () => console.log('UserService.filter() error')
      })
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
