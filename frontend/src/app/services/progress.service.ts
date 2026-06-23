import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly api = `${environment.apiUrl}/progress`;

  constructor(private http: HttpClient) {}

  recordAnswer(questionId: number, correct: boolean) {
    return this.http.patch(`${this.api}/${questionId}`, { correct });
  }

  saveSession(mode: string, area: string | null, total: number, correct: number) {
    return this.http.post(`${this.api}/session`, { mode, area, total, correct });
  }

  resetProgress() {
    return this.http.delete(this.api);
  }
}
