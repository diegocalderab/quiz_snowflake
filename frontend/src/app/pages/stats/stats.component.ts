import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatsService } from '../../services/stats.service';
import { StatsResponse, AreaStat } from '../../models';

const AREA_COLORS: Record<string, string> = {
  'Snowflake Data Cloud Features & Architecture': '#29b5e8',
  'Performance Concepts': '#a855f7',
  'Account Access and Security': '#f97316',
  'Data Loading and Unloading': '#3b82f6',
  'Data Protection and Data Sharing': '#10b981',
  'Data Transformations': '#f59e0b'
};

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <div class="page">
      <div class="container">
        <div class="topbar">
          <a routerLink="/dashboard" class="btn-ghost">← Dashboard</a>
          <h2>Mis estadísticas</h2>
        </div>

        <div *ngIf="stats">
          <!-- Global -->
          <div class="section-title">Global</div>
          <div class="stat-grid">
            <div class="stat-card">
              <div class="sv" style="color:#29b5e8">{{ stats.global.total }}</div>
              <div class="sl">Total</div>
            </div>
            <div class="stat-card">
              <div class="sv" style="color:#10b981">{{ stats.global.correct }}</div>
              <div class="sl">Correctas</div>
            </div>
            <div class="stat-card">
              <div class="sv" style="color:#f97316">{{ stats.global.due }}</div>
              <div class="sl">Pendientes</div>
            </div>
            <div class="stat-card">
              <div class="sv" [style.color]="globalPct >= 70 ? '#10b981' : '#f97316'">{{ globalPct }}%</div>
              <div class="sl">Score</div>
            </div>
          </div>

          <!-- By area -->
          <div class="section-title">Por área</div>
          <div class="area-list">
            <div class="area-row" *ngFor="let a of stats.areas">
              <div class="area-top2">
                <div style="display:flex;align-items:center;gap:8px">
                  <div class="dot" [style.background]="color(a.area)"></div>
                  <span class="aname">{{ a.area }}</span>
                </div>
                <span class="apct" [style.color]="color(a.area)">{{ pct(a) }}%</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" [style.width]="pct(a) + '%'" [style.background]="color(a.area)"></div>
              </div>
              <div class="area-detail">
                <span>✓ {{ a.correct }} correctas</span>
                <span>· {{ a.total }} total</span>
                <span *ngIf="+a.due > 0" style="color:#f97316">· {{ a.due }} pendientes</span>
              </div>
            </div>
          </div>

          <!-- Recent sessions -->
          <div class="section-title" *ngIf="stats.recent_sessions.length">Últimas sesiones</div>
          <div class="sessions" *ngIf="stats.recent_sessions.length">
            <div class="session-row" *ngFor="let s of stats.recent_sessions">
              <div class="session-left">
                <span class="session-mode">{{ modeLabel(s.mode) }}</span>
                <span class="session-area" *ngIf="s.area">· {{ s.area | slice:0:20 }}</span>
              </div>
              <div class="session-right">
                <span [style.color]="sessionPct(s) >= 70 ? '#10b981' : '#f97316'">{{ sessionPct(s) }}%</span>
                <span class="session-date">{{ s.finished_at | date:'dd/MM HH:mm' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="loading" *ngIf="!stats && !error">Cargando...</div>
        <div class="err" *ngIf="error">{{ error }}</div>
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .page { min-height: 100vh; background: #020b18; font-family: 'Inter', -apple-system, sans-serif; color: #f1f5f9; }
    .container { max-width: 720px; margin: 0 auto; padding: 24px 16px; }
    .topbar { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
    h2 { margin: 0; font-size: 20px; font-weight: 800; }
    .btn-ghost { background: transparent; color: #64748b; border: 1px solid #1e293b; border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: none; }
    .section-title { font-size: 11px; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; margin-top: 24px; }
    .stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
    .stat-card { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; text-align: center; }
    .sv { font-size: 24px; font-weight: 800; }
    .sl { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
    .area-list { display: flex; flex-direction: column; gap: 10px; }
    .area-row { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px 16px; }
    .area-top2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .aname { color: #e2e8f0; font-size: 13px; font-weight: 600; }
    .apct { font-weight: 700; font-size: 14px; }
    .bar-track { background: #1e293b; border-radius: 99px; height: 6px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 99px; transition: width 0.4s; }
    .area-detail { font-size: 11px; color: #475569; margin-top: 4px; display: flex; gap: 4px; }
    .sessions { display: flex; flex-direction: column; gap: 8px; }
    .session-row { background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
    .session-left { display: flex; align-items: center; gap: 4px; }
    .session-mode { font-weight: 700; font-size: 13px; color: #e2e8f0; }
    .session-area { font-size: 12px; color: #64748b; }
    .session-right { display: flex; align-items: center; gap: 10px; }
    .session-right span:first-child { font-weight: 700; font-size: 14px; }
    .session-date { font-size: 11px; color: #475569; }
    .loading, .err { text-align: center; padding: 40px; color: #64748b; }
    .err { color: #ef4444; }
  `]
})
export class StatsComponent implements OnInit {
  stats: StatsResponse | null = null;
  error = '';

  constructor(private statsService: StatsService) {}

  ngOnInit() {
    this.statsService.getStats().subscribe({
      next: (s) => this.stats = s,
      error: () => this.error = 'Error cargando stats'
    });
  }

  get globalPct() {
    if (!this.stats) return 0;
    return +this.stats.global.total > 0 ? Math.round((+this.stats.global.correct / +this.stats.global.total) * 100) : 0;
  }

  color(area: string) { return AREA_COLORS[area] || '#64748b'; }
  pct(a: AreaStat) { return +a.total > 0 ? Math.round((+a.correct / +a.total) * 100) : 0; }
  sessionPct(s: any) { return s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0; }
  modeLabel(m: string) {
    return { due: '⚡ Pendientes', random: '🎲 Aleatorio', weak: '🎯 Fallos', exam: '📋 Examen', area: '📚 Área' }[m] || m;
  }
}
