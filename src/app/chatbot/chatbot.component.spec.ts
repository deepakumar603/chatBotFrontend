import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotComponent } from './chatbot.component';

describe('ChatbotComponent', () => {
  let component: ChatbotComponent;
  let fixture: ComponentFixture<ChatbotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use the backend response field when present', async () => {
    spyOn(window, 'fetch').and.resolveTo({
      ok: true,
      json: async () => ({ response: 'Hello from backend' }),
    } as Response);

    component.messageText = 'hello';
    await component.send();

    expect(component.messages[component.messages.length - 1]).toEqual({
      from: 'bot',
      text: 'Hello from backend',
    });
  });
});
