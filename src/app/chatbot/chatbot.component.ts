
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.sass']
})
export class ChatbotComponent {
  messages: { from: 'user' | 'bot'; text: string }[] = [
    { from: 'bot', text: 'Hello! I am your assistant. How can I help?' },
  ];
  messageText = '';
  loading = false;

  async send() {
    const message = this.messageText.trim();
    if (!message) return;
    this.messages.push({ from: 'user', text: message });
    this.messageText = '';
    this.loading = true;
    this.scrollToBottom();

    try {
      const response = await fetch('https://chat-bot-backend-three.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Chat request failed (${response.status}): ${errorBody}`);
      }

      const data = await response.json();
      const botText = this.extractBotText(data);
      this.messages.push({
        from: 'bot',
        text: botText || 'Sorry, I did not receive a response.',
      });
    } catch (error) {
      this.messages.push({
        from: 'bot',
        text: 'Unable to reach the chat API. Please try again later.',
      });
    } finally {
      this.loading = false;
      this.scrollToBottom();
    }
  }

  formatMessage(text: string): string {
    return this.escapeHtml(text)
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private extractBotText(data: unknown): string {
    if (typeof data === 'string') {
      return data;
    }

    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;

      const candidates = [
        record['text'],
        record['response'],
        record['message'],
        record['reply'],
        record['content'],
        record['output'],
      ];

      for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim()) {
          return candidate;
        }
      }

      if (Array.isArray(record['choices']) && record['choices'].length > 0) {
        const firstChoice = record['choices'][0] as Record<string, unknown>;
        const message = firstChoice['message'] as Record<string, unknown> | undefined;
        if (message && typeof message['content'] === 'string') {
          return message['content'];
        }
      }
    }

    return '';
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = document.querySelector('.chatbot-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}
