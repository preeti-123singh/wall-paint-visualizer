import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-visualizer',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './visualizer.html',
  styleUrl: './visualizer.css'
})
export class Visualizer {
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;

  selectedColor = '#ff0000';
  imageLoaded = false;
  hasSelectionMade = false;
  message = '';
  private originalImage: HTMLImageElement | null = null;

  private isSelecting = false;
  private startX = 0;
  private startY = 0;
  private selection = { x: 0, y: 0, width: 0, height: 0 };
  private hasSelection = false;

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        this.originalImage = img;
        this.imageLoaded = true;
        this.hasSelection = false;
        this.hasSelectionMade = false;
        setTimeout(() => this.drawBase(), 0);
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  private drawBase() {
    if (!this.originalImage || !this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    canvas.width = this.originalImage.width;
    canvas.height = this.originalImage.height;

    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(this.originalImage, 0, 0);
  }

  startSelection(event: MouseEvent) {
    this.message = '';
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    this.isSelecting = true;
    this.startX = (event.clientX - rect.left) * scaleX;
    this.startY = (event.clientY - rect.top) * scaleY;
    this.selection = { x: this.startX, y: this.startY, width: 0, height: 0 };
  }

  updateSelection(event: MouseEvent) {
    if (!this.isSelecting) return;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const currentX = (event.clientX - rect.left) * scaleX;
    const currentY = (event.clientY - rect.top) * scaleY;

    this.selection = {
      x: Math.min(this.startX, currentX),
      y: Math.min(this.startY, currentY),
      width: Math.abs(currentX - this.startX),
      height: Math.abs(currentY - this.startY)
    };

    this.drawBase();
    this.drawSelectionBox();
  }

  endSelection() {
    this.isSelecting = false;
    this.hasSelection = this.selection.width > 5 && this.selection.height > 5;
    this.hasSelectionMade = this.hasSelection;
    this.applyColor();
  }

  private drawSelectionBox() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.selection.x, this.selection.y, this.selection.width, this.selection.height);
  }

  applyColor() {
    if (!this.originalImage || !this.canvasRef) return;

    this.drawBase();

    if (!this.hasSelection) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    ctx.save();
    ctx.beginPath();
    ctx.rect(this.selection.x, this.selection.y, this.selection.width, this.selection.height);
    ctx.clip();

    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = this.selectedColor;
    ctx.fillRect(this.selection.x, this.selection.y, this.selection.width, this.selection.height);

    ctx.restore();
  }
saveProject() {
  const canvas = this.canvasRef.nativeElement;

  // Create a smaller version for saving
  const maxWidth = 800;
  const scale = Math.min(1, maxWidth / canvas.width);
  const resizedCanvas = document.createElement('canvas');
  resizedCanvas.width = canvas.width * scale;
  resizedCanvas.height = canvas.height * scale;

  const resizedCtx = resizedCanvas.getContext('2d')!;
  resizedCtx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);

  const imageData = resizedCanvas.toDataURL('image/jpeg', 0.7);

  const token = localStorage.getItem('token');
  if (!token) {
    this.message = 'You must be logged in to save a project.';
    return;
  }

  const projectData = {
    imageData,
    color: this.selectedColor,
    selection: this.selection
  };

  this.http.post('http://localhost:5000/api/projects', projectData, {
    headers: { Authorization: `Bearer ${token}` }
  }).subscribe({
    next: (res: any) => {
      this.message = 'Project saved successfully!';
    },
    error: (err) => {
      this.message = 'Error: ' + (err.error?.error || 'Failed to save project');
    }
  });
}}
 