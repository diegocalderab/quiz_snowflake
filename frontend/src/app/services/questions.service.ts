import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Question, AreaStat } from '../models';

@Injectable({ providedIn: 'root' })
export class QuestionsService {
  private readonly api = `${environment.apiUrl}/questions`;

  constructor(private http: HttpClient) {}

  getSession(mode: string, area?: string, limit = 40) {
    let params: Record<string, string> = { mode, limit: String(limit) };
    if (area) params['area'] = area;
    return this.http.get<Question[]>(`${this.api}/session`, { params });
  }

  getAreas() {
    return this.http.get<AreaStat[]>(`${this.api}/areas`);
  }
}
