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

  palette = [
    { name: 'Warm White', hex: '#f5efe6' },
    { name: 'Sage Green', hex: '#9caf88' },
    { name: 'Sky Blue', hex: '#87ceeb' },
    { name: 'Terracotta', hex: '#c8694a' },
    { name: 'Dusty Rose', hex: '#d8a7a7' },
    { name: 'Mustard', hex: '#e1ad01' },
    { name: 'Navy', hex: '#1f3a5f' },
    { name: 'Charcoal', hex: '#3b3b3b' },
    { name: 'Lavender', hex: '#b7a6d9' },
    { name: 'Mint', hex: '#a8e0c8' },
    { name: 'Peach', hex: '#ffcba4' },
    { name: 'Teal', hex: '#2a8c8c' }
  ];

  selectedColor = '#9caf88';
  intensity = 100;
  showOriginal = false;
  imageLoaded = false;
  hasSelectionMade = false;
  message = '';
  projectName = '';
  suggestions: { label: string; hex: string }[] = [];
    wallWidth: number | null = null;
  wallHeight: number | null = null;
  coats = 2;
  unit: 'ft' | 'm' = 'ft';
  private originalImage: HTMLImageElement | null = null;

  private isSelecting = false;
  private startX = 0;
  private startY = 0;
  private selection = { x: 0, y: 0, width: 0, height: 0 };
  private hasSelection = false;

   constructor(private http: HttpClient) {
    this.suggestions = this.buildHarmony();
  }

  currentColorName(): string {
    const match = this.palette.find(c => c.hex === this.selectedColor);
    return match ? match.name : 'Custom color ' + this.selectedColor;
  }

  selectColor(hex: string) {
    this.selectedColor = hex;
    this.message = '';
    this.showOriginal = false;
    this.applyColor();
  }

  toggleOriginal() {
    this.showOriginal = !this.showOriginal;
    this.applyColor();
  }

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
        this.showOriginal = false;
        this.message = '';
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
    ctx.globalAlpha = 1;
    ctx.drawImage(this.originalImage, 0, 0);
  }

  startSelection(event: MouseEvent) {
    this.message = '';
    this.showOriginal = false;
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
    this.suggestions = this.buildHarmony();
    if (!this.originalImage || !this.canvasRef) return;

    this.drawBase();

    if (!this.hasSelection || this.showOriginal) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    ctx.save();
    ctx.beginPath();
    ctx.rect(this.selection.x, this.selection.y, this.selection.width, this.selection.height);
    ctx.clip();

    ctx.globalAlpha = this.intensity / 100;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = this.selectedColor;
    ctx.fillRect(this.selection.x, this.selection.y, this.selection.width, this.selection.height);

    ctx.restore();
  }
    areaSqM(): number {
    const w = Number(this.wallWidth) || 0;
    const h = Number(this.wallHeight) || 0;
    const factor = this.unit === 'ft' ? 0.3048 : 1;
    return w * factor * h * factor;
  }

  litersNeeded(): number {
    // Typical coverage: about 10 square meters per liter, per coat
    return (this.areaSqM() * this.coats) / 10;
  }

    suggestedCans(): string {
    let remaining = Math.ceil(this.litersNeeded());
    if (remaining <= 0) return '';

    const tens = Math.floor(remaining / 10);
    remaining %= 10;
    let fours = Math.floor(remaining / 4);
    remaining %= 4;
    let ones = remaining;

    // 3 or more single liters: one 4L can is cheaper and simpler
    if (ones >= 3) {
      fours += 1;
      ones = 0;
    }

    const parts: string[] = [];
    if (tens) parts.push(tens + ' × 10L');
    if (fours) parts.push(fours + ' × 4L');
    if (ones) parts.push(ones + ' × 1L');
    return parts.join(' + ');
  }
  private hexToHsl(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h *= 60;
    }
    return [h, s * 100, l * 100];
  }

  private hslToHex(h: number, s: number, l: number): string {
    h = ((h % 360) + 360) % 360;
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
    return '#' + toHex(f(0)) + toHex(f(8)) + toHex(f(4));
  }

  private buildHarmony(): { label: string; hex: string }[] {
    const [h, s, l] = this.hexToHsl(this.selectedColor);
    return [
      { label: 'Complementary', hex: this.hslToHex(h + 180, s, l) },
      { label: 'Analogous 1', hex: this.hslToHex(h + 30, s, l) },
      { label: 'Analogous 2', hex: this.hslToHex(h - 30, s, l) },
      { label: 'Triadic', hex: this.hslToHex(h + 120, s, l) },
      { label: 'Soft Trim', hex: this.hslToHex(h, Math.min(s, 20), 92) }
    ];
  }
  saveProject() {
    // Make sure the painted version is what gets saved
    this.showOriginal = false;
    this.applyColor();

    const canvas = this.canvasRef.nativeElement;

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
      name: this.projectName || 'Untitled Project',
      imageData,
      color: this.selectedColor,
      selection: this.selection
    };

    this.http.post('http://localhost:5000/api/projects', projectData, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.message = 'Project saved successfully!';
      },
      error: (err) => {
        this.message = 'Error: ' + (err.error?.error || 'Failed to save project');
      }
    });
  }
}