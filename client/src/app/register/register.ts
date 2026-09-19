import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  name = '';
  email = '';
  password = '';
  message = '';

  constructor(private http: HttpClient) {}

  onSubmit() {
    const userData = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: 'homeowner'
    };

    this.http.post('http://localhost:5000/api/register', userData).subscribe({
      next: (res: any) => {
        this.message = 'Registration successful!';
        this.name = '';
        this.email = '';
        this.password = '';
      },
      error: (err) => {
        this.message = 'Error: ' + (err.error?.error || 'Registration failed');
      }
    });
  }
}