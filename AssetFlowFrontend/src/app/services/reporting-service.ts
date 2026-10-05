import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments';
import {
  AssetAnalyticsDashboard,
  AssetDetailAnalytics,
  AssetReportBundle,
  BreakdownReportBundle,
  CostAnalyticsDashboard,
  CostReportBundle,
  DashboardSummary,
  MaintenanceAnalyticsDashboard,
  MaintenanceReportBundle,
  ManagementAnalytics,
  PerformanceReportBundle,
  ReliabilityAnalyticsDashboard,
  ReportingFilter,
  SparePartsAnalyticsDashboard,
  SparePartsReportBundle,
  WorkOrderAnalyticsDashboard
} from '../model/reporting';

interface ApiResult<T> {
  result: T;
}

@Injectable({ providedIn: 'root' })
export class ReportingService {
  private dashboardUrl = `${environment.apiUrl}/dashboard`;
  private reportsUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getDashboardSummary(filter: ReportingFilter): Observable<DashboardSummary> {
    return this.http
      .post<ApiResult<DashboardSummary>>(`${this.dashboardUrl}/summary`, filter)
      .pipe(map((r) => r.result));
  }

  getAssetReport(filter: ReportingFilter): Observable<AssetReportBundle> {
    return this.http.post<ApiResult<AssetReportBundle>>(`${this.reportsUrl}/assets`, filter).pipe(map((r) => r.result));
  }

  getMaintenanceReport(filter: ReportingFilter): Observable<MaintenanceReportBundle> {
    return this.http
      .post<ApiResult<MaintenanceReportBundle>>(`${this.reportsUrl}/maintenance`, filter)
      .pipe(map((r) => r.result));
  }

  getBreakdownReport(filter: ReportingFilter): Observable<BreakdownReportBundle> {
    return this.http
      .post<ApiResult<BreakdownReportBundle>>(`${this.reportsUrl}/breakdowns`, filter)
      .pipe(map((r) => r.result));
  }

  getSparePartsReport(filter: ReportingFilter): Observable<SparePartsReportBundle> {
    return this.http
      .post<ApiResult<SparePartsReportBundle>>(`${this.reportsUrl}/spare-parts`, filter)
      .pipe(map((r) => r.result));
  }

  getPerformanceReport(filter: ReportingFilter): Observable<PerformanceReportBundle> {
    return this.http
      .post<ApiResult<PerformanceReportBundle>>(`${this.reportsUrl}/performance`, filter)
      .pipe(map((r) => r.result));
  }

  getCostReport(filter: ReportingFilter): Observable<CostReportBundle> {
    return this.http.post<ApiResult<CostReportBundle>>(`${this.reportsUrl}/costs`, filter).pipe(map((r) => r.result));
  }

  private analyticsUrl = `${environment.apiUrl}/analytics`;

  getManagementAnalytics(filter: ReportingFilter): Observable<ManagementAnalytics> {
    return this.http.post<ApiResult<ManagementAnalytics>>(`${this.analyticsUrl}/management`, filter).pipe(map((r) => r.result));
  }

  getAssetAnalyticsDashboard(filter: ReportingFilter): Observable<AssetAnalyticsDashboard> {
    return this.http.post<ApiResult<AssetAnalyticsDashboard>>(`${this.analyticsUrl}/assets`, filter).pipe(map((r) => r.result));
  }

  getMaintenanceAnalyticsDashboard(filter: ReportingFilter): Observable<MaintenanceAnalyticsDashboard> {
    return this.http.post<ApiResult<MaintenanceAnalyticsDashboard>>(`${this.analyticsUrl}/maintenance`, filter).pipe(map((r) => r.result));
  }

  getReliabilityAnalyticsDashboard(filter: ReportingFilter): Observable<ReliabilityAnalyticsDashboard> {
    return this.http.post<ApiResult<ReliabilityAnalyticsDashboard>>(`${this.analyticsUrl}/reliability`, filter).pipe(map((r) => r.result));
  }

  getWorkOrderAnalyticsDashboard(filter: ReportingFilter): Observable<WorkOrderAnalyticsDashboard> {
    return this.http.post<ApiResult<WorkOrderAnalyticsDashboard>>(`${this.analyticsUrl}/work-orders`, filter).pipe(map((r) => r.result));
  }

  getSparePartsAnalyticsDashboard(filter: ReportingFilter): Observable<SparePartsAnalyticsDashboard> {
    return this.http.post<ApiResult<SparePartsAnalyticsDashboard>>(`${this.analyticsUrl}/spare-parts`, filter).pipe(map((r) => r.result));
  }

  getCostAnalyticsDashboard(filter: ReportingFilter): Observable<CostAnalyticsDashboard> {
    return this.http.post<ApiResult<CostAnalyticsDashboard>>(`${this.analyticsUrl}/cost`, filter).pipe(map((r) => r.result));
  }

  getTeamPerformanceDashboard(filter: ReportingFilter): Observable<PerformanceReportBundle> {
    return this.http.post<ApiResult<PerformanceReportBundle>>(`${this.analyticsUrl}/performance`, filter).pipe(map((r) => r.result));
  }

  getAssetDetailAnalytics(assetId: number, filter: ReportingFilter): Observable<AssetDetailAnalytics> {
    return this.http
      .post<ApiResult<AssetDetailAnalytics>>(`${this.analyticsUrl}/assets/${assetId}/detail`, filter)
      .pipe(map((r) => r.result));
  }
}
