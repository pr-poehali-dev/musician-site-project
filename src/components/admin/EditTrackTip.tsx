import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

const EditTrackTip: React.FC = () => {
  return (
    <Alert className="bg-blue-50 border-blue-200 mb-4">
      <Icon name="Info" className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800 text-sm ml-2">
        <strong>Совет:</strong> Чтобы загрузить или изменить аудиофайл для существующего трека:
        <br />
        1. Найдите трек в списке альбома
        <br />
        2. Нажмите кнопку редактирования (иконка карандаша)
        <br />
        3. В открывшемся окне выберите новый MP3 файл
        <br />
        4. Длительность обновится автоматически
      </AlertDescription>
    </Alert>
  );
};

export default EditTrackTip;
