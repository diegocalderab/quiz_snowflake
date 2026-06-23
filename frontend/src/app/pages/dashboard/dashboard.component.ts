import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StatsService } from '../../services/stats.service';
import { ProgressService } from '../../services/progress.service';
import { AuthService } from '../../services/auth.service';
import { StatsResponse, AreaStat } from '../../models';

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
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div>
            <div class="logo">❄️</div>
            <h1>SnowPro Core</h1>
            <p>Hola, {{ auth.user()?.name }}</p>
          </div>
          <div class="header-actions">
            <a routerLink="/stats" class="btn-ghost">📊 Stats</a>
            <button class="btn-ghost" (click)="auth.logout()">Salir</button>
          </div>
        </div>

        <!-- Global stats -->
        <div class="stat-grid" *ngIf="stats">
          <div class="stat-card" *ngFor="let s of globalCards">
            <div class="stat-value" [style.color]="s.color">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="progress-card" *ngIf="stats">
          <div class="progress-header">
            <span>Progreso global</span>
            <span [style.color]="globalPct >= 70 ? '#10b981' : '#f97316'" class="pct">{{ globalPct }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" [style.width]="globalPct + '%'" [style.background]="globalPct >= 70 ? '#10b981' : '#29b5e8'"></div>
          </div>
          <div class="progress-hint">Objetivo: 70% · Faltan {{ needMore }} preguntas más</div>
        </div>

        <!-- Main actions -->
        <div class="actions" *ngIf="stats">
          <button class="btn-primary" (click)="startQuiz('due')">
            ⚡ Estudiar pendientes ({{ stats.global.due }})
          </button>
          <div class="action-row">
            <button class="btn-secondary" (click)="startQuiz('random')">🎲 Aleatorio</button>
            <button class="btn-secondary" (click)="startQuiz('weak')">🎯 Mis fallos</button>
          </div>
          <button class="btn-exam" (click)="startQuiz('exam')">📋 Simular examen (100 preguntas)</button>
        </div>

        <!-- By area -->
        <div class="section-title">Por área</div>
        <div class="areas" *ngIf="stats">
          <div class="area-card" *ngFor="let a of stats.areas" (click)="startQuiz('area', a.area)">
            <div class="area-top">
              <div class="area-left">
                <div class="dot" [style.background]="color(a.area)"></div>
                <span class="area-name">{{ short(a.area) }}</span>
              </div>
              <div class="area-right">
                <span class="due-badge" *ngIf="+a.due > 0">{{ a.due }}</span>
                <span class="area-pct" [style.color]="color(a.area)">{{ pct(a) }}%</span>
                <span class="chevron">›</span>
              </div>
            </div>
            <div class="area-bar">
              <div class="area-fill" [style.width]="pct(a) + '%'" [style.background]="color(a.area)"></div>
            </div>
            <div class="area-sub">{{ a.correct }}/{{ a.total }} correctas</div>
          </div>
        </div>

        <!-- Reset -->
        <button class="btn-reset" (click)="resetProgress()" *ngIf="stats && +stats.global.attempted > 0">
          🗑️ Resetear mi progreso
        </button>

        <div class="loading" *ngIf="!stats && !error">Cargando...</div>
        <div class="error-msg" *ngIf="error">{{ error }}</div>
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .page {
      min-height: 100vh; background: #020b18;
      font-family: 'Inter', -apple-system, sans-serif; color: #f1f5f9;
    }
    .container { max-width: 720px; margin: 0 auto; padding: 24px 16px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .logo { font-size: 32px; }
    h1 { margin: 4px 0 2px; font-size: 22px; font-weight: 800; }
    p { margin: 0; color: #64748b; font-size: 13px; }
    .header-actions { display: flex; gap: 8px; }
    .btn-ghost {
      background: transparent; color: #64748b; border: 1px solid #1e293b;
      border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 600;
      cursor: pointer; text-decoration: none; display: inline-flex; align-items: center;
    }
    .stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 18px; }
    .stat-card {
      background: #0f172a; border: 1px solid #1e293b;
      border-radius: 12px; padding: 14px 8px; text-align: center;
    }
    .stat-value { font-size: 24px; font-weight: 800; }
    .stat-label { font-size: 10px; color: #64748b; margin-top: 2px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
    .progress-card { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
    .progress-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; color: #94a3b8; font-weight: 600; }
    .pct { font-size: 20px; font-weight: 800; }
    .progress-track { background: #1e293b; border-radius: 99px; height: 10px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 99px; transition: width 0.4s; }
    .progress-hint { font-size: 11px; color: #475569; margin-top: 6px; }
    .actions { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
    .btn-primary {
      padding: 16px; background: linear-gradient(135deg, #0369a1, #29b5e8);
      color: #fff; border: none; border-radius: 12px;
      font-size: 15px; font-weight: 700; cursor: pointer;
    }
    .action-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .btn-secondary {
      padding: 13px; background: #1e293b; color: #e2e8f0;
      border: 1px solid #334155; border-radius: 12px;
      font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .btn-exam {
      padding: 13px; background: #1e293b; color: #a855f7;
      border: 1px solid #a855f744; border-radius: 12px;
      font-size: 13px; font-weight: 700; cursor: pointer;
    }
    .section-title { font-size: 11px; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
    .areas { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .area-card {
      background: #0f172a; border: 1px solid #1e293b;
      border-radius: 12px; padding: 12px 16px; cursor: pointer;
      transition: border-color 0.15s;
    }
    .area-card:hover { border-color: #334155; }
    .area-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .area-left { display: flex; align-items: center; gap: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .area-name { color: #e2e8f0; font-weight: 600; font-size: 13px; }
    .area-right { display: flex; align-items: center; gap: 6px; }
    .due-badge { background: #f9731622; color: #f97316; border: 1px solid #f9731644; border-radius: 6px; padding: 2px 7px; font-size: 11px; font-weight: 700; }
    .area-pct { font-weight: 700; font-size: 13px; }
    .chevron { color: #334155; font-size: 16px; }
    .area-bar { background: #1e293b; border-radius: 99px; height: 5px; overflow: hidden; }
    .area-fill { height: 100%; border-radius: 99px; transition: width 0.4s; }
    .area-sub { font-size: 10px; color: #334155; margin-top: 4px; }
    .btn-reset {
      width: 100%; background: transparent; color: #475569;
      border: 1px solid #1e293b; border-radius: 10px;
      padding: 10px; font-size: 12px; cursor: pointer;
    }
    .loading, .error-msg { text-align: center; padding: 40px; color: #64748b; }
    .error-msg { color: #ef4444; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: StatsResponse | null = null;
  error = '';

  constructor(
    public auth: AuthService,
    private statsService: StatsService,
    private progressService: ProgressService,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.statsService.getStats().subscribe({
      next: (s) => this.stats = s,
      error: () => this.error = 'Error cargando estadísticas'
    });
  }

  get globalCards() {
    if (!this.stats) return [];
    const g = this.stats.global;
    return [
      { label: 'Total', value: g.total, color: '#64748b' },
      { label: 'Vistas', value: g.attempted, color: '#29b5e8' },
      { label: 'Correctas', value: g.correct, color: '#10b981' },
      { label: 'Pendientes', value: g.due, color: '#f97316' }
    ];
  }

  get globalPct() {
    if (!this.stats) return 0;
    return this.stats.global.total > 0
      ? Math.round((+this.stats.global.correct / +this.stats.global.total) * 100)
      : 0;
  }

  get needMore() {
    if (!this.stats) return 0;
    return Math.max(0, Math.ceil(+this.stats.global.total * 0.7) - +this.stats.global.correct);
  }

  color(area: string) { return AREA_COLORS[area] || '#64748b'; }
  short(area: string) { return AREA_SHORT[area] || area; }
  pct(a: AreaStat) { return a.total > 0 ? Math.round((+a.correct / +a.total) * 100) : 0; }

  startQuiz(mode: string, area?: string) {
    const state: any = { mode };
    if (area) state['area'] = area;
    this.router.navigate(['/quiz'], { state });
  }

  resetProgress() {
    if (!confirm('¿Resetear todo tu progreso?')) return;
    this.progressService.resetProgress().subscribe(() => this.load());
  }
}
