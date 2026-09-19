import { Routes } from '@angular/router';
import { Register } from './register/register';
import { Login } from './login/login';
import { Visualizer } from './visualizer/visualizer';
import { MyProjects } from './my-projects/my-projects';

export const routes: Routes = [
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'visualizer', component: Visualizer },
  { path: 'my-projects', component: MyProjects },
  { path: '', redirectTo: '/register', pathMatch: 'full' }
];