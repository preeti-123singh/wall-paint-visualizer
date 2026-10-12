import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  message = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    const loginData = {
      email: this.email,
      password: this.password
    };

    this.http.post('http://localhost:5000/api/login', loginData).subscribe({
      next: (res: any) => {
        this.message = 'Login successful!';
        localStorage.setItem('token', res.token);
        this.router.navigate(['/visualizer']);
      },
      error: (err) => {
        this.message = 'Error: ' + (err.error?.error || 'Login failed');
      }
    });
  }
}