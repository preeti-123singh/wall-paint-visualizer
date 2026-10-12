import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Register } from './register/register';
import { Login } from './login/login';
import { Visualizer } from './visualizer/visualizer';
import { MyProjects } from './my-projects/my-projects';
import { SharedProject } from './shared-project/shared-project';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'visualizer', component: Visualizer, canActivate: [authGuard] },
  { path: 'my-projects', component: MyProjects, canActivate: [authGuard] },
  { path: 'shared/:id', component: SharedProject },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];