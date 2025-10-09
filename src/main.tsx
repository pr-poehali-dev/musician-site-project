import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

console.log('🚀 Запуск приложения...');

window.addEventListener('error', (event) => {
  console.error('❌ Глобальная ошибка:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Необработанный Promise:', event.reason);
});

const rootElement = document.getElementById("root");
console.log('🔍 Root element:', rootElement);

if (!rootElement) {
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(to bottom right, #f5e6d3, #8b6f47); padding: 20px;">
      <div style="max-width: 500px; background: white; padding: 40px; border-radius: 10px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
        <div style="font-size: 60px; margin-bottom: 20px;">⚠️</div>
        <h1 style="color: #4a3728; margin-bottom: 15px;">Ошибка загрузки</h1>
        <p style="color: #8b6f47; margin-bottom: 20px;">Не удалось найти элемент для монтирования приложения.</p>
        <button onclick="window.location.reload()" style="background: #8b6f47; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
          🔄 Перезагрузить страницу
        </button>
      </div>
    </div>
  `;
} else {
  try {
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error('Ошибка при монтировании приложения:', error);
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(to bottom right, #f5e6d3, #8b6f47); padding: 20px;">
        <div style="max-width: 500px; background: white; padding: 40px; border-radius: 10px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
          <div style="font-size: 60px; margin-bottom: 20px;">⚠️</div>
          <h1 style="color: #4a3728; margin-bottom: 15px;">Ошибка инициализации</h1>
          <p style="color: #8b6f47; margin-bottom: 20px;">Произошла ошибка при запуске приложения. Попробуйте очистить кэш браузера.</p>
          <button onclick="localStorage.clear(); window.location.reload();" style="background: #8b6f47; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; margin-right: 10px;">
            🗑️ Очистить данные
          </button>
          <button onclick="window.location.reload()" style="background: transparent; color: #8b6f47; border: 2px solid #8b6f47; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
            🔄 Обновить
          </button>
          <details style="margin-top: 20px; text-align: left;">
            <summary style="cursor: pointer; color: #8b6f47; font-size: 14px;">Технические детали</summary>
            <pre style="margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 5px; font-size: 12px; overflow: auto; max-height: 150px;">${error instanceof Error ? error.message : String(error)}</pre>
          </details>
        </div>
      </div>
    `;
  }
}