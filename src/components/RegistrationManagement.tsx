import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { 
  Send, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  Calendar,
  MapPin,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Event } from './EventManagement';
import type { Student } from './StudentManagement';

interface RegistrationStatus {
  studentId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  responseDate?: string;
}

interface RegistrationManagementProps {
  event: Event;
  students: Student[];
  registrationStatuses: RegistrationStatus[];
  onSendInvitations: (eventId: string, studentIds: string[], message: string) => void;
  onUpdateRegistration: (eventId: string, studentId: string, status: RegistrationStatus['status']) => void;
}

export default function RegistrationManagement({
  event,
  students,
  registrationStatuses,
  onSendInvitations,
  onUpdateRegistration
}: RegistrationManagementProps) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState('');

  const defaultMessage = `Hello,

הנכם מוזמנים לטיול: ${event.title}

📅 Date: ${new Date(event.date).toLocaleDateString('en-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}

📍 Location: ${event.location}

${event.description ? `📝 Description: ${event.description}` : ''}

💰 Price: ${formatCurrency(event.price > 0 ? `${event.price)}` : 'Free'}

${event.maxParticipants ? `👥 Limited seats: ${event.maxParticipants} participants` : ''}

⚠️ Message חשובה: 
- יש לאשר השתתפות עד יומיים לפני הDate
- Cancel עד יומיים לפני - Free
- Cancel פחות מיומיים לפני או אי הגעה - תחויבו במלוא הסכום

אנא אשרו השתתפותכם בהקדם האפשרי.

בברכה,
מחלקת הלימודים הבינלאומיים`;

  const getRegistrationStatus = (studentId: string): RegistrationStatus => {
    return registrationStatuses.find(r => r.studentId === studentId) || {
      studentId,
      status: 'pending'
    };
  };

  const getStatusBadge = (status: RegistrationStatus['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 ml-1" />
            אישר
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 ml-1" />
            ביטל
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 ml-1" />
            Pending
          </Badge>
        );
    }
  };

  const handleSelectAllStudents = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSendInvitations = () => {
    if (selectedStudents.length === 0) {
      toast.error('יש לבחור לפחות student אחד');
      return;
    }

    if (!inviteMessage.trim()) {
      toast.error('יש להזין Invitation message');
      return;
    }

    onSendInvitations(event.id, selectedStudents, inviteMessage);
    setIsInviteDialogOpen(false);
    setSelectedStudents([]);
    setInviteMessage('');
    toast.success(`הזמנות נSendו ל-${selectedStudents.length} Students`);
  };

  const openInviteDialog = () => {
    setInviteMessage(defaultMessage);
    setIsInviteDialogOpen(true);
  };

  const confirmedStudents = registrationStatuses.filter(r => r.status === 'confirmed').length;
  const pendingStudents = registrationStatuses.filter(r => r.status === 'pending').length;
  const cancelledStudents = registrationStatuses.filter(r => r.status === 'cancelled').length;

  const canSendInvitations = event.status === 'upcoming';
  const daysUntilEvent = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isMinimumMet = confirmedStudents >= 15;
  const isUrgent = daysUntilEvent <= 7 && !isMinimumMet && daysUntilEvent > 0;
  const needsAttention = daysUntilEvent <= 14 && !isMinimumMet && daysUntilEvent > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-base md:text-lg">Registrations - {event.title}</span>
            <Button 
              onClick={openInviteDialog}
              disabled={!canSendInvitations}
              className="w-full sm:w-auto"
            >
              <Send className="ml-2 h-4 w-4" />
              <span className="hidden sm:inline">Send הזמנות</span>
              <span className="sm:hidden">Send</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{daysUntilEvent > 0 ? `${daysUntilEvent} days` : 'היום'} עד האירוע</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{event.price > 0 ? `${formatCurrency(event.price)}` : 'Free'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className={`${
                needsAttention && event.status === 'upcoming'
                  ? isUrgent ? 'text-red-600 font-medium' : 'text-yellow-600 font-medium'
                  : ''
              }`}>
                {confirmedStudents}
                {event.maxParticipants && ` / ${event.maxParticipants}`}
                {' '}registered (מינימום: 15)
              </span>
            </div>
          </div>

          {/* Minimum registrations alert - only show within 14 days */}
          {needsAttention && event.status === 'upcoming' && (
            <div className={`p-3 rounded-lg mb-4 ${
              isUrgent 
                ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800' 
                : 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${isUrgent ? 'text-red-600' : 'text-yellow-600'}`} />
                <p className={`text-sm font-medium ${
                  isUrgent ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'
                }`}>
                  {isUrgent 
                    ? `⚠️ Urgent: left ${daysUntilEvent} days ורק ${confirmedStudents} registered מתוך 15 הנדרשים`
                    : `📋 הטיול בבדיקה: left ${daysUntilEvent} days ו-${confirmedStudents} registered מתוך 15 הנדרשים לConfirm הטיול`
                  }
                </p>
              </div>
            </div>
          )}

          {daysUntilEvent < 2 && daysUntilEvent > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ left פחות מיומיים לאירוע - Cancel מהיום יחויב במלוא הסכום
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>סטטיסטיקות Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center">
              <div className="text-xl md:text-2xl text-green-600">{confirmedStudents}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl text-blue-600">{pendingStudents}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl text-red-600">{cancelledStudents}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Cancelled</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student list</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {students.map((student) => {
              const registrationStatus = getRegistrationStatus(student.id);
              return (
                <div
                  key={student.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{student.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                      {registrationStatus.responseDate && (
                        <p className="text-xs text-muted-foreground">
                          תגובה: {new Date(registrationStatus.responseDate).toLocaleDateString('en-IL')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    {getStatusBadge(registrationStatus.status)}
                    {canSendInvitations && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateRegistration(event.id, student.id, 'confirmed')}
                          disabled={registrationStatus.status === 'confirmed'}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span className="ml-1 sm:hidden">Confirm</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateRegistration(event.id, student.id, 'cancelled')}
                          disabled={registrationStatus.status === 'cancelled'}
                        >
                          <XCircle className="h-4 w-4" />
                          <span className="ml-1 sm:hidden">Cancel</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Send trip invitations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Students:</Label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    checked={selectedStudents.length === students.length}
                    onCheckedChange={handleSelectAllStudents}
                  />
                  <Label>Select all ({students.length} Students)</Label>
                </div>
                {students.map((student) => (
                  <div key={student.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={(checked) =>
                        handleStudentSelection(student.id, checked as boolean)
                      }
                    />
                    <Label>{student.name} - {student.email}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="inviteMessage">Invitation message:</Label>
              <Textarea
                id="inviteMessage"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={15}
                className="mt-2"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleSendInvitations} 
                className="flex-1 order-2 sm:order-1"
                disabled={selectedStudents.length === 0}
              >
                <Mail className="ml-2 h-4 w-4" />
                Send הזמנות ({selectedStudents.length})
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsInviteDialogOpen(false)}
                className="flex-1 order-1 sm:order-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}