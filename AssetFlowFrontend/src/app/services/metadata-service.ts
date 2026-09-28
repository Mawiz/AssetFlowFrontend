import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments';

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

    getMetadataKeys(applicableEntityType?: string): Observable<any> {
      const params = applicableEntityType
        ? { applicableEntityType }
        : undefined;
      return this.http.get<any>(`${this.apiUrl}/metadata/MetaDataKeys`, { params });
    }

    getEnums(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/metadata/GetMetaDataEnums`);
    }
}
