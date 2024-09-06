import { Component, inject, signal } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from 'src/environments/environment.prod';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';

const googleGenerativeAI = new GoogleGenerativeAI(environment.GEMINI_API_KEY);
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 500,
  responseMimeType: 'text/plain',
};

const model = googleGenerativeAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  ...generationConfig,
});

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonContent,
    IonHeader,
    IonSpinner,
    IonTextarea,
    IonTitle,
    IonToolbar,
  ],
})
export class HomePage {
  private toastController = inject(ToastController);
  loading = signal<boolean>(false);
  prompt = signal<string>('');
  result = signal<string>('');

  async sendToGemini(): Promise<void> {
    if (this.prompt().length == 0) {
      await this.showAlert('Por favor, ingrese su prompt.', true);
      return;
    }

    this.loading.set(true);
    const contentResult = await model.generateContent(this.prompt());
    const response = contentResult.response;
    this.result.set(response.text());
    this.loading.set(false);
  }

  async showAlert(message: string, error: boolean = false): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      position: 'bottom',
      color: error ? 'danger' : 'success',
      mode: 'ios',
    });
    await toast.present();
  }

  updatePromptValue(newValue: string) {
    this.prompt.set(newValue);
  }
}
