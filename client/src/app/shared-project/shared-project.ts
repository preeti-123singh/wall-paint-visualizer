import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-shared-project',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shared-project.html',
  styleUrl: './shared-project.css'
})
export class SharedProject implements OnInit {
  project: any = null;
  loading = true;
  notFound = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.http.get(`http://localhost:5000/api/shared/${id}`).subscribe({
      next: (res: any) => {
        this.project = res.project;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}