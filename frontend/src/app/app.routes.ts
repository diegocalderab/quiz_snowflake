import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'quiz',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/quiz/quiz.component').then(m => m.QuizComponent)
  },
  {
    path: 'stats',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/stats/stats.component').then(m => m.StatsComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
