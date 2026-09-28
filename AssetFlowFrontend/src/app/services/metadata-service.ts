import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments';
import { MetaDataByTypeRequest } from '../model/entity-metadata';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
      private apiUrl = `${environment.apiUrl}`;
  private metaUrl = '/metadata/GetMetaDataValues';

  constructor(private http: HttpClient) {}

    getMetadataValues(payload: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}${this.metaUrl}`, payload);
    }

    getByType(payload: MetaDataByTypeRequest): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/metadata/GetMetaDataByType`, payload);
    }

    getEnums(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/metadata/GetMetaDataEnums`);
    }
}
