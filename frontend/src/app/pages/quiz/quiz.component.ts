import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuestionsService } from '../../services/questions.service';
import { ProgressService } from '../../services/progress.service';
import { Question } from '../../models';

const AREA_COLORS: Record<string, string> = {
  'Snowflake Data Cloud Features & Architecture': '#29b5e8',
  'Performance Concepts': '#a855f7',
  'Account Access and Security': '#f97316',
  'Data Loading and Unloading': '#3b82f6',
  'Data Protection and Data Sharing': '#10b981',
  'Data Transformations': '#f59e0b'
};

const AREA_SHORT: Record<string, string> = {
  'Snowflake Data Cloud Features & Architecture': 'Architecture',
  'Performance Concepts': 'Performance',
  'Account Access and Security': 'Security',
  'Data Loading and Unloading': 'Loading',
  'Data Protection and Data Sharing': 'Data Sharing',
  'Data Transformations': 'Transformations'
};

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="container">

        <div class="loading" *ngIf="loading">Cargando preguntas...</div>

        <!-- Finished -->
        <div class="finished" *ngIf="finished">
          <div class="emoji">{{ finalEmoji }}</div>
          <h2>Sesión completada</h2>
          <p>{{ correct }} de {{ sessionTotal }} correctas</p>
          <div class="result-card">
            <div class="result-pct" [style.color]="finalPct >= 70 ? '#10b981' : '#f97316'">{{ finalPct }}%</div>
            <div class="result-bar">
              <div class="result-fill" [style.width]="finalPct + '%'" [style.background]="finalPct >= 70 ? '#10b981' : '#f97316'"></div>
            </div>
            <div class="result-row">
              <span style="color:#10b981">✓ {{ correct }}</span>
              <span style="color:#ef4444">✗ {{ wrong }}</span>
            </div>
          </div>
          <button class="btn-primary" (click)="goBack()">← Volver al dashboard</button>
        </div>

        <!-- Quiz -->
        <div *ngIf="!loading && !finished && current">
          <!-- Top bar -->
          <div class="topbar">
            <button class="btn-ghost" (click)="goBack()">← Salir</button>
            <span class="counter">{{ idx + 1 }}/{{ questions.length }}</span>
            <div>
              <span class="score-c">✓{{ correct }}</span>
              <span class="score-w">✗{{ wrong }}</span>
            </div>
          </div>

          <div class="strip">
            <div class="strip-fill" [style.width]="(idx / questions.length * 100) + '%'" [style.background]="areaColor"></div>
          </div>

          <!-- Question card -->
          <div class="card">
            <div class="badges">
              <span class="badge" [style.background]="areaColor + '22'" [style.color]="areaColor" [style.border]="'1px solid ' + areaColor + '44'">
                {{ short(current.area) }}
              </span>
              <span class="badge badge-purple" *ngIf="current.choose_n > 1">Selecciona {{ current.choose_n }}</span>
              <span class="badge badge-green" *ngIf="current.last_correct === true">✓ antes</span>
              <span class="badge badge-red" *ngIf="current.last_correct === false">✗ antes</span>
            </div>

            <p class="question">{{ current.question }}</p>

            <div class="options">
              <button
                *ngFor="let opt of current.options"
                (click)="toggle(opt)"
                [disabled]="submitted"
                class="option"
                [class.correct-opt]="submitted && isCorrectOption(opt)"
                [class.wrong-opt]="submitted && isSelected(opt) && !isCorrectOption(opt)"
                [class.selected]="isSelected(opt) && !submitted"
              >
                <span class="check-icon" *ngIf="submitted && isCorrectOption(opt)">✓</span>
                <span class="check-icon wrong-icon" *ngIf="submitted && isSelected(opt) && !isCorrectOption(opt)">✗</span>
                <span class="check-dot" *ngIf="!submitted">
                  <span *ngIf="isSelected(opt)">●</span>
                </span>
                {{ opt }}
              </button>
            </div>

            <button
              *ngIf="!submitted"
              (click)="submit()"
              [disabled]="selected.length === 0"
              class="btn-verify"
              [class.active]="selected.length > 0"
            >Verificar →</button>
          </div>

          <!-- Result + Explanation -->
          <div class="result-banner" *ngIf="submitted" [class.banner-correct]="isAnswerCorrect" [class.banner-wrong]="!isAnswerCorrect">
            <span class="banner-icon">{{ isAnswerCorrect ? '✓' : '✗' }}</span>
            <span>{{ isAnswerCorrect ? '¡Correcto!' : 'Incorrecto — Respuesta: ' + current.correct.join(', ') }}</span>
          </div>

          <div class="explanation-card" *ngIf="submitted && current.explanation">
            <div class="exp-label">📖 Explicación</div>
            <p class="exp-text">{{ current.explanation }}</p>
            <a *ngIf="current.reference" [href]="current.reference" target="_blank" class="exp-ref">Documentación oficial →</a>
          </div>

          <button class="btn-next" *ngIf="submitted" (click)="next()">
            {{ idx + 1 < questions.length ? 'Siguiente →' : 'Ver resultado' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .page { min-height: 100vh; background: #020b18; font-family: 'Inter', -apple-system, sans-serif; color: #f1f5f9; }
    .container { max-width: 680px; margin: 0 auto; padding: 16px; }
    .loading { text-align: center; padding: 80px 0; color: #64748b; font-size: 14px; }
    .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .btn-ghost { background: transparent; color: #64748b; border: 1px solid #1e293b; border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .counter { font-size: 12px; color: #64748b; font-weight: 600; }
    .score-c { color: #10b981; font-weight: 700; margin-right: 10px; }
    .score-w { color: #ef4444; font-weight: 700; }
    .strip { background: #1e293b; height: 3px; border-radius: 99px; overflow: hidden; margin-bottom: 14px; }
    .strip-fill { height: 100%; border-radius: 99px; transition: width 0.4s; }
    .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 22px; margin-bottom: 12px; }
    .badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .badge { border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 700; }
    .badge-purple { background: #a855f722; color: #a855f7; border: 1px solid #a855f744; }
    .badge-green { background: #10b98122; color: #10b981; border: 1px solid #10b98144; }
    .badge-red { background: #ef444422; color: #ef4444; border: 1px solid #ef444444; }
    .question { color: #f1f5f9; font-size: 15px; line-height: 1.65; margin: 0 0 18px; font-weight: 500; }
    .options { display: flex; flex-direction: column; gap: 8px; }
    .option {
      background: #0a1628; border: 2px solid #1e293b; border-radius: 10px;
      padding: 11px 14px; color: #94a3b8; font-size: 13.5px; text-align: left;
      cursor: pointer; display: flex; align-items: flex-start; gap: 10px;
      transition: all 0.15s; font-family: inherit;
    }
    .option.selected { border-color: #29b5e8; background: #29b5e818; color: #f1f5f9; font-weight: 600; }
    .option.correct-opt { border-color: #10b981 !important; background: #10b98118 !important; color: #10b981 !important; font-weight: 700; }
    .option.wrong-opt { border-color: #ef4444 !important; background: #ef444418 !important; color: #ef4444 !important; font-weight: 700; }
    .option:disabled { cursor: default; }
    .check-icon { font-weight: 800; font-size: 14px; flex-shrink: 0; margin-top: 1px; }
    .wrong-icon { color: #ef4444; }
    .check-dot { width: 18px; height: 18px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #29b5e8; font-size: 10px; }
    .btn-verify {
      width: 100%; margin-top: 18px; padding: 14px;
      background: #1e293b; color: #475569; border: none; border-radius: 10px;
      font-size: 14px; font-weight: 700; cursor: not-allowed; font-family: inherit;
    }
    .btn-verify.active { background: linear-gradient(135deg, #0369a1, #29b5e8); color: #fff; cursor: pointer; }
    .result-banner {
      border-radius: 12px; padding: 14px 18px; margin-bottom: 12px;
      display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 14px;
    }
    .banner-correct { background: #10b98118; border: 2px solid #10b98140; color: #10b981; }
    .banner-wrong { background: #ef444418; border: 2px solid #ef444440; color: #ef4444; }
    .banner-icon { font-size: 18px; }
    .explanation-card { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin-bottom: 12px; }
    .exp-label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
    .exp-text { color: #94a3b8; font-size: 13px; line-height: 1.7; margin: 0 0 10px; white-space: pre-line; }
    .exp-ref { color: #29b5e8; font-size: 12px; text-decoration: none; font-weight: 600; }
    .exp-ref:hover { text-decoration: underline; }
    .btn-next {
      width: 100%; padding: 14px; background: linear-gradient(135deg, #0369a1, #29b5e8);
      color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 700;
      cursor: pointer; margin-bottom: 20px; font-family: inherit;
    }
    .finished { text-align: center; padding: 40px 0; }
    .emoji { font-size: 56px; margin-bottom: 12px; }
    h2 { color: #f1f5f9; margin: 0 0 6px; }
    p { color: #64748b; margin-bottom: 28px; font-size: 14px; }
    .result-card { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .result-pct { font-size: 42px; font-weight: 800; margin-bottom: 4px; }
    .result-bar { background: #1e293b; border-radius: 99px; height: 8px; overflow: hidden; margin-bottom: 12px; }
    .result-fill { height: 100%; border-radius: 99px; }
    .result-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-weight: 700; }
    .btn-primary { padding: 14px 32px; background: linear-gradient(135deg, #0369a1, #29b5e8); color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; width: 100%; font-family: inherit; }
  `]
})
export class QuizComponent implements OnInit {
  questions: Question[] = [];
  idx = 0;
  selected: string[] = [];
  submitted = false;
  loading = true;
  finished = false;
  correct = 0;
  wrong = 0;
  mode = 'random';
  area: string | null = null;

  constructor(
    private questionsService: QuestionsService,
    private progressService: ProgressService,
    private router: Router
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as any;
    if (state) {
      this.mode = state['mode'] || 'random';
      this.area = state['area'] || null;
    }
  }

  ngOnInit() {
    this.questionsService.getSession(this.mode, this.area || undefined).subscribe({
      next: (qs) => { this.questions = qs; this.loading = false; },
      error: () => { this.loading = false; this.router.navigate(['/dashboard']); }
    });
  }

  get current(): Question | null { return this.questions[this.idx] || null; }
  get sessionTotal() { return this.correct + this.wrong; }
  get finalPct() { return this.sessionTotal > 0 ? Math.round((this.correct / this.sessionTotal) * 100) : 0; }
  get finalEmoji() { return this.finalPct >= 70 ? '🏆' : this.finalPct >= 50 ? '📈' : '💪'; }

  get areaColor(): string {
    return AREA_COLORS[this.current?.area || ''] || '#29b5e8';
  }

  short(area: string) { return AREA_SHORT[area] || area; }
  isSelected(opt: string) { return this.selected.includes(opt); }

  isCorrectOption(opt: string): boolean {
    if (!this.current) return false;
    // opt is like "B) Economy" — correct is like "Economy"
    return this.current.correct.some(c =>
      opt === c || opt.includes(c) || opt.replace(/^[A-Z]\)\s*/, '') === c
    );
  }

  get isAnswerCorrect(): boolean {
    if (!this.current) return false;
    const needed = this.current.correct.length;
    const matched = this.current.correct.filter(c =>
      this.selected.some(s => s === c || s.includes(c) || s.replace(/^[A-Z]\)\s*/, '') === c)
    ).length;
    return matched === needed && this.selected.length === needed;
  }

  toggle(opt: string) {
    if (this.submitted) return;
    if (this.current!.choose_n === 1) {
      this.selected = [opt];
    } else {
      this.selected = this.isSelected(opt)
        ? this.selected.filter(o => o !== opt)
        : this.selected.length < this.current!.choose_n
          ? [...this.selected, opt]
          : this.selected;
    }
  }

  submit() {
    if (!this.selected.length) return;
    this.submitted = true;
    const correct = this.isAnswerCorrect;
    this.progressService.recordAnswer(this.current!.id, correct).subscribe();
    if (correct) this.correct++; else this.wrong++;
  }

  next() {
    if (this.idx + 1 >= this.questions.length) {
      this.finished = true;
      this.progressService.saveSession(this.mode, this.area, this.sessionTotal, this.correct).subscribe();
    } else {
      this.idx++;
      this.selected = [];
      this.submitted = false;
    }
  }

  goBack() { this.router.navigate(['/dashboard']); }
}
