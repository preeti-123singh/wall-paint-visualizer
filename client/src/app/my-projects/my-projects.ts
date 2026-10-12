import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-projects.html',
  styleUrl: './my-projects.css'
})
export class MyProjects implements OnInit {
  projects: any[] = [];
  loading = true;
  shareMessage = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const token = localStorage.getItem('token');

    this.http.get('http://localhost:5000/api/projects', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        this.projects = res.projects.slice(0, 12);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load projects', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteProject(id: string) {
    if (!confirm('Delete this project? This cannot be undone.')) return;

    const token = localStorage.getItem('token');

    this.http.delete(`http://localhost:5000/api/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.projects = this.projects.filter(p => p._id !== id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to delete project', err);
        alert('Could not delete the project. Try logging in again.');
      }
    });
  }

  shareProject(id: string) {
    const token = localStorage.getItem('token');

    this.http.post(`http://localhost:5000/api/projects/${id}/share`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        const link = `${window.location.origin}/shared/${res.shareId}`;
        navigator.clipboard.writeText(link).then(
          () => {
            this.shareMessage = 'Link copied: ' + link;
            this.cdr.detectChanges();
          },
          () => {
            this.shareMessage = 'Share link: ' + link;
            this.cdr.detectChanges();
          }
        );
      },
      error: (err) => {
        console.error('Failed to create share link', err);
        this.shareMessage = 'Could not create a share link. Try logging in again.';
        this.cdr.detectChanges();
      }
    });
  }
}