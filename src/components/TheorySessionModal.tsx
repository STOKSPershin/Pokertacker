import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface TheorySessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionDuration: number;
  onSave: (topic: string, notes: string) => void;
}

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${h} ч ${m} мин ${s} сек`;
  } else if (m > 0) {
    return `${m} мин ${s} сек`;
  }
  return `${s} сек`;
};

const TheorySessionModal = ({ isOpen, onClose, sessionDuration, onSave }: TheorySessionModalProps) => {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onSave(topic, notes);
    setTopic('');
    setNotes('');
    onClose();
  };

  const handleClose = () => {
    setTopic('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Теоретическая сессия завершена</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <Label className="text-sm font-medium text-muted-foreground">Время занятия:</Label>
            <div className="text-2xl font-bold text-primary mt-1">
              {formatDuration(sessionDuration)}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="topic">Тема занятия:</Label>
            <Input
              id="topic"
              placeholder="Введите тему занятия..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Заметки:</Label>
            <Textarea
              id="notes"
              placeholder="Введите заметки о пройденном материале..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TheorySessionModal;
