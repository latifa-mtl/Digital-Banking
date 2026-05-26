import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { HttpClient, HttpDownloadProgressEvent, HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-bot.html',
  styleUrl: './chat-bot.css',
})
export class ChatBot implements AfterViewChecked {
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;

  query    = '';
  response = '';          // live streaming buffer for current bot reply
  progress = false;
  messages: Message[] = [
    {
      role: 'bot',
      content: `Bonjour ! Je suis **BankBot** 🏦\nPosez-moi vos questions sur vos comptes, opérations et services bancaires.`,
      timestamp: new Date()
    }
  ];

  constructor(private http: HttpClient) {}

  // ── Send message ──────────────────────────────────────────────────────────
  askAgent() {
    const text = this.query.trim();
    if (!text || this.progress) return;

    // 1. Push user message
    this.messages.push({ role: 'user', content: text, timestamp: new Date() });
    this.query    = '';
    this.response = '';
    this.progress = true;

    // 2. Stream from backend (YOUR EXACT LOGIC — unchanged)
    this.http.get('http://localhost:8087/chat?query=' + encodeURIComponent(text), {
      responseType: 'text',
      observe: 'events',
      reportProgress: true
    }).subscribe({
      next: evt => {
        if (evt.type === HttpEventType.DownloadProgress) {
          // Update live streaming buffer
          this.response = (evt as HttpDownloadProgressEvent).partialText ?? '';
        }
      },
      error: () => {
        this.messages.push({
          role: 'bot',
          content: 'Une erreur s\'est produite. Veuillez réessayer.',
          timestamp: new Date()
        });
        this.progress = false;
        this.response = '';
      },
      complete: () => {
        // 3. Stream finished → commit to history
        if (this.response) {
          this.messages.push({ role: 'bot', content: this.response, timestamp: new Date() });
        }
        this.response = '';
        this.progress = false;
      }
    });
  }

  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.askAgent(); }
  }

  clearChat() {
    this.messages = [{
      role: 'bot',
      content: 'Conversation réinitialisée. Comment puis-je vous aider ?',
      timestamp: new Date()
    }];
    this.response = '';
    this.progress = false;
  }

  formatTime(d: Date) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  ngAfterViewChecked() {
    try { this.scrollAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }
}
