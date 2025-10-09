import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

const HowToUploadGuide: React.FC = () => {
  return (
    <Card className="bg-vintage-cream border-vintage-brown/20 mb-6">
      <CardHeader>
        <CardTitle className="text-vintage-dark-brown flex items-center gap-2">
          <Icon name="HelpCircle" size={24} />
          Как загрузить аудиофайлы
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Badge className="bg-vintage-dark-brown text-vintage-cream min-w-[32px] h-8 flex items-center justify-center text-base">
            1
          </Badge>
          <div className="flex-1">
            <p className="text-vintage-warm font-semibold mb-1">Перейдите на вкладку "Треки"</p>
            <p className="text-vintage-warm/70 text-sm">
              В админ-панели нажмите на иконку <Icon name="Music" size={14} className="inline mx-1" /> "Треки"
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Badge className="bg-vintage-dark-brown text-vintage-cream min-w-[32px] h-8 flex items-center justify-center text-base">
            2
          </Badge>
          <div className="flex-1">
            <p className="text-vintage-warm font-semibold mb-1">Нажмите "Добавить трек"</p>
            <p className="text-vintage-warm/70 text-sm">
              Откроется форма загрузки нового трека
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Badge className="bg-vintage-dark-brown text-vintage-cream min-w-[32px] h-8 flex items-center justify-center text-base">
            3
          </Badge>
          <div className="flex-1">
            <p className="text-vintage-warm font-semibold mb-1">Выберите MP3 файл</p>
            <p className="text-vintage-warm/70 text-sm">
              Поддерживаются форматы: MP3, WAV, OGG, M4A (максимум 50 МБ)
            </p>
            <p className="text-vintage-warm/70 text-sm mt-1">
              ⚡ Длительность трека определится автоматически
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Badge className="bg-vintage-dark-brown text-vintage-cream min-w-[32px] h-8 flex items-center justify-center text-base">
            4
          </Badge>
          <div className="flex-1">
            <p className="text-vintage-warm font-semibold mb-1">Укажите альбом</p>
            <p className="text-vintage-warm/70 text-sm">
              Выберите альбом, в который добавится трек
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Badge className="bg-vintage-dark-brown text-vintage-cream min-w-[32px] h-8 flex items-center justify-center text-base">
            5
          </Badge>
          <div className="flex-1">
            <p className="text-vintage-warm font-semibold mb-1">Сохраните трек</p>
            <p className="text-vintage-warm/70 text-sm">
              Нажмите "Добавить трек" - файл сохранится в IndexedDB браузера
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-vintage-brown/10 rounded-lg border border-vintage-brown/20">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={20} className="text-vintage-dark-brown flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-vintage-dark-brown font-semibold mb-1">Важно знать:</p>
              <ul className="text-vintage-warm/80 text-sm space-y-1 list-disc list-inside">
                <li>Файлы хранятся локально в браузере (IndexedDB)</li>
                <li>При очистке данных браузера файлы удалятся</li>
                <li>Рекомендуется делать резервные копии в разделе "Резервные копии"</li>
                <li>Один трек = один файл (нельзя загрузить несколько файлов сразу)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-2">
            <Icon name="CheckCircle2" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-semibold mb-1">После загрузки:</p>
              <p className="text-green-700 text-sm">
                Трек появится в альбоме и станет доступен для воспроизведения и скачивания. 
                Вы сможете увидеть его в магазине музыки!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HowToUploadGuide;
