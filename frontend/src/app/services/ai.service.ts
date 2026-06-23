import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AiService {
  constructor(private http: HttpClient) {}

  explain(question: string, options: string[], selected: string[]) {
    return this.http.post<{ explanation: string }>(`${environment.apiUrl}/ai/explain`, {
      question, options, selected
    });
  }
}
