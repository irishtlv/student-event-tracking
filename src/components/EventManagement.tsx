import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Calendar, MapPin, Users, DollarSign, Plus, Edit, Trash2, Send, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  maxParticipants?: number;
  registrations: string[]; // student IDs
  attendance: Record<string, boolean>; // student ID -> attended
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface EventManagementProps {
  events: Event[];
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onUpdateEvent: (id: string, event: Partial<Event>) => void;
  onDeleteEvent: (id: string) => void;
  onSendInvitations: (eventId: string) => void;
}

export default function EventManagement({
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onSendInvitations
}: EventManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    price: 0,
    maxParticipants: undefined as number | undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.location) {
      toast.error('Title, Date וLocation הם שדות חובה');
      return;
    }

    const eventData = {
      ...formData,
      registrations: [],
      attendance: {},
      status: 'upcoming' as const
    };

    if (editingEvent) {
      onUpdateEvent(editingEvent.id, eventData);
      toast.success('פרטי האירוע עודכנו בהצלחה');
    } else {
      onAddEvent(eventData);
      toast.success('Event נוסף בהצלחה');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      location: '',
      price: 0,
      maxParticipants: undefined
    });
    setEditingEvent(null);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      price: event.price,
      maxParticipants: event.maxParticipants
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (event: Event) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את האירוע "${event.title}"?`)) {
      onDeleteEvent(event.id);
      toast.success('Event נDelete בהצלחה');
    }
  };

  const getStatusBadge = (status: Event['status']) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="default">עתיד</Badge>;
      case 'ongoing':
        return <Badge variant="secondary">מתרחש כעת</Badge>;
      case 'completed':
        return <Badge variant="outline">הסתיים</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return price > 0 ? `${formatCurrency(price)}` : 'Free';
  };

  const getEventStatusInfo = (event: Event) => {
    const confirmedCount = event.registrations.length;
    const isMinimumMet = confirmedCount >= 15;
    const daysUntilEvent = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      confirmedCount,
      isMinimumMet,
      daysUntilEvent,
      status: isMinimumMet ? 'confirmed' : daysUntilEvent <= 7 ? 'urgent' : daysUntilEvent <= 14 ? 'needs_attention' : 'normal'
    };
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg md:text-xl">ניהול Events וטיולים</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="w-full sm:w-auto">
              <Plus className="ml-2 h-4 w-4" />
              <span className="hidden sm:inline">הוסף Event</span>
              <span className="sm:hidden">הוסף</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {editingEvent ? 'עריכת Event' : 'הוספת Event חדש'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Event title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="הכנס Title Event"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="הכנס Event description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="date">Date וTime</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="הכנס Event location"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price (שקלים חדשים)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="maxParticipants">מספר participants מקסימלי (אופציונלי)</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    maxParticipants: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  placeholder="ללא הגבלה"
                  min="1"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="flex-1 order-2 sm:order-1">
                  {editingEvent ? 'עדכן' : 'הוסף'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 order-1 sm:order-2"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No Events במערכת. הוסף את האירוע הראשון.
            </CardContent>
          </Card>
        ) : (
          events.map((event) => {
            const statusInfo = getEventStatusInfo(event);
            return (
              <Card key={event.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-base md:text-lg">{event.title}</span>
                      <div className="flex gap-2">
                        {getStatusBadge(event.status)}
                        {event.status === 'upcoming' && (
                          <Badge 
                            variant={statusInfo.isMinimumMet ? 'default' : statusInfo.status === 'urgent' ? 'destructive' : statusInfo.status === 'needs_attention' ? 'secondary' : 'outline'}
                            className="flex items-center gap-1"
                          >
                            {statusInfo.isMinimumMet ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : statusInfo.daysUntilEvent <= 14 && statusInfo.daysUntilEvent > 0 ? (
                              <AlertTriangle className="h-3 w-3" />
                            ) : null}
                            {statusInfo.isMinimumMet ? 'אושר' : statusInfo.daysUntilEvent <= 14 && statusInfo.daysUntilEvent > 0 ? 'בבדיקה' : 'רגיל'}
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                  <div className="flex gap-1 sm:gap-2 self-end sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSendInvitations(event.id)}
                      disabled={event.status !== 'upcoming'}
                      className="flex-1 sm:flex-none"
                    >
                      <Send className="h-4 w-4" />
                      <span className="ml-1 sm:hidden">Send</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(event)}
                      className="flex-1 sm:flex-none"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="ml-1 sm:hidden">ערוך</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(event)}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-1 sm:hidden">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Status Alert - only show for events within 14 days */}
                {event.status === 'upcoming' && !statusInfo.isMinimumMet && statusInfo.daysUntilEvent <= 14 && statusInfo.daysUntilEvent > 0 && (
                  <div className={`p-3 rounded-lg mb-4 ${
                    statusInfo.status === 'urgent' 
                      ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800' 
                      : 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${
                        statusInfo.status === 'urgent' ? 'text-red-600' : 'text-yellow-600'
                      }`} />
                      <p className={`text-sm font-medium ${
                        statusInfo.status === 'urgent' ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {statusInfo.status === 'urgent' 
                          ? `Urgent: left ${statusInfo.daysUntilEvent} days ורק ${statusInfo.confirmedCount} registered (required 15)`
                          : `צריך לבדוק: left ${statusInfo.daysUntilEvent} days ורק ${statusInfo.confirmedCount} registered מתוך 15 הנדרשים`
                        }
                      </p>
                    </div>
                  </div>
                )}

                {event.description && (
                  <p className="text-muted-foreground mb-3 text-sm">{event.description}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{formatPrice(event.price)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className={`${
                      event.status === 'upcoming' && statusInfo.confirmedCount < 15 && statusInfo.daysUntilEvent <= 14 && statusInfo.daysUntilEvent > 0
                        ? statusInfo.status === 'urgent' ? 'text-red-600 font-medium' : 'text-yellow-600 font-medium'
                        : ''
                    }`}>
                      {statusInfo.confirmedCount}
                      {event.maxParticipants && ` / ${event.maxParticipants}`}
                      {' '}registered
                      {event.status === 'upcoming' && (
                        <span className="text-muted-foreground font-normal">
                          {' '}(מינימום: 15)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })
        )}
      </div>
    </div>
  );
}