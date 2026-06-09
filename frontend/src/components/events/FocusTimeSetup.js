import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import api from '../../lib/api';
import logger from '../../lib/logger';
import { toast } from 'sonner';
import { Repeat, Plus } from 'lucide-react';
import { WeekGrid, AddSlotForm } from './FocusParts';

export const FocusTimeSetup = ({ de }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newSlot, setNewSlot] = useState({ day: 'tuesday', start_time: '09:00', end_time: '10:30', session_type: 'deep_work' });

  const loadSlots = useCallback(async () => {
    try {
      const res = await api.get('/focus-times');
      setSlots(res.data);
    } catch (err) { logger.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  const handleAdd = () => {
    setSlots(prev => [...prev, { ...newSlot, slot_id: `new_${Date.now()}` }]);
    setShowAdd(false);
    setNewSlot({ day: 'tuesday', start_time: '09:00', end_time: '10:30', session_type: 'deep_work' });
  };

  const handleRemove = (slotId) => setSlots(prev => prev.filter(s => s.slot_id !== slotId));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/focus-times', { slots });
      toast.success(de ? 'Training Times gespeichert!' : 'Training times saved!');
      loadSlots();
    } catch (err) {
      logger.error(err);
      toast.error(de ? 'Fehler beim Speichern' : 'Error saving');
    } finally { setSaving(false); }
  };

  return (
    <Card className="border-black/[0.04] dark:border-white/[0.06] overflow-hidden" data-testid="focus-time-setup">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/5 dark:to-teal-500/5 p-6 border-b border-emerald-200/30 dark:border-emerald-500/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
            <Repeat size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{de ? 'Deine Leadership Training Time' : 'Your Leadership Training Time'}</h3>
            <p className="text-sm text-muted-foreground">
              {de ? 'Definiere feste Zeitfenster für strukturierte Leadership-Arbeit.' : 'Define fixed time slots for structured leadership work.'}
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-5">
        <WeekGrid slots={slots} onRemove={handleRemove} de={de} />

        {showAdd ? (
          <AddSlotForm newSlot={newSlot} setNewSlot={setNewSlot} onAdd={handleAdd} onCancel={() => setShowAdd(false)} de={de} />
        ) : (
          <Button variant="outline" onClick={() => setShowAdd(true)} className="w-full border-dashed font-semibold text-sm" data-testid="add-focus-slot-btn">
            <Plus size={14} className="mr-1.5" /> {de ? 'Zeitfenster hinzufügen' : 'Add Time Slot'}
          </Button>
        )}

        {slots.length > 0 && (
          <Button onClick={handleSave} disabled={saving} className="w-full bg-[#0A0A0A] dark:bg-white dark:text-black text-white font-bold h-11" data-testid="save-focus-times">
            {saving ? (de ? 'Wird gespeichert...' : 'Saving...') : (de ? 'Training Times speichern' : 'Save Training Times')}
          </Button>
        )}

        <div className="text-center pt-2">
          <p className="text-[11px] text-muted-foreground">
            {de ? 'Feste Leadership Training Times = Gewohnheit aufbauen. Nutze diese Zeiten für Challenges, Workflows oder Coaching.' : 'Fixed leadership training times = build habits. Use these times for challenges, workflows or coaching.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
