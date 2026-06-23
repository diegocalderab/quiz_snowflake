import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { StatsResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private http: HttpClient) {}

  getStats() {
    return this.http.get<StatsResponse>(`${environment.apiUrl}/stats`);
  }
}
