import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Toaster } from './components/ui/sonner';
import StudentManagement, { type Student } from './components/StudentManagement';
import EventManagement, { type Event } from './components/EventManagement';
import RegistrationManagement from './components/RegistrationManagement';
import AttendanceManagement from './components/AttendanceManagement';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { 
  Users, 
  Calendar, 
  ClipboardList, 
  CheckSquare,
  School,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface RegistrationStatus {
  studentId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  responseDate?: string;
}

export default function MainApp() {
  // Sample data
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'יוסף כהן',
      email: 'yosef@example.com',
      phone: '052-1234567',
      balance: 0
    },
    {
      id: '2',
      name: 'מרים לוי',
      email: 'miriam@example.com',
      phone: '053-2345678',
      balance: 50
    },
    {
      id: '3',
      name: 'אחמד עלי',
      email: 'ahmad@example.com',
      phone: '054-3456789',
      balance: -100
    }
  ]);

  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Trip לירושלים',
      description: 'Trip מודרך בעיר העתיקה והכותל המערבי',
      date: '2024-12-15T09:00',
      location: 'Jerusalem - עיר עתיקה',
      price: 120,
      maxParticipants: 30,
      registrations: ['1', '2'],
      attendance: {},
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'סיור במוזיאון הטבע',
      description: 'סיור מודרך במוזיאון הטבע העברי',
      date: '2024-12-10T10:00',
      location: 'תל אביב - מוזיאון הטבע',
      price: 60,
      registrations: ['2', '3'],
      attendance: { '2': true, '3': false },
      status: 'completed'
    }
  ]);

  const [registrationStatuses, setRegistrationStatuses] = useState<RegistrationStatus[]>([
    { studentId: '1', status: 'confirmed', responseDate: '2024-12-01' },
    { studentId: '2', status: 'confirmed', responseDate: '2024-12-02' },
    { studentId: '2', status: 'confirmed', responseDate: '2024-12-01' },
    { studentId: '3', status: 'pending' }
  ]);

  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Student management functions
  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString()
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const handleUpdateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, ...updates } : student
    ));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(student => student.id !== id));
    // Also remove from any event registrations
    setEvents(prev => prev.map(event => ({
      ...event,
      registrations: event.registrations.filter(studentId => studentId !== id)
    })));
  };

  // Event management functions
  const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString()
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const handleUpdateEvent = (id: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
    setRegistrationStatuses(prev => 
      prev.filter(status => {
        const event = events.find(e => e.id === id);
        return !event || !event.registrations.includes(status.studentId);
      })
    );
  };

  // Registration management functions
  const handleSendInvitations = (eventId: string, studentIds: string[], message: string) => {
    // In a real app, this would send actual emails/notifications
    console.log('Sending invitations:', { eventId, studentIds, message });
    
    // Add students to event registrations
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, registrations: [...new Set([...event.registrations, ...studentIds])] }
        : event
    ));

    // Add registration statuses
    const newStatuses = studentIds.map(studentId => ({
      studentId,
      status: 'pending' as const
    }));
    setRegistrationStatuses(prev => [
      ...prev.filter(status => !studentIds.includes(status.studentId)),
      ...newStatuses
    ]);
  };

  const handleUpdateRegistration = (eventId: string, studentId: string, status: RegistrationStatus['status']) => {
    setRegistrationStatuses(prev => {
      const existing = prev.find(r => r.studentId === studentId);
      const updated = {
        studentId,
        status,
        responseDate: new Date().toISOString()
      };

      if (existing) {
        return prev.map(r => r.studentId === studentId ? updated : r);
      } else {
        return [...prev, updated];
      }
    });

    if (status === 'cancelled') {
      // Remove from event registrations
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, registrations: event.registrations.filter(id => id !== studentId) }
          : event
      ));
    }
  };

  // Attendance management functions
  const handleUpdateAttendance = (eventId: string, attendance: Record<string, boolean>) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, attendance } : event
    ));
  };

  const handleChargeStudent = (studentId: string, amount: number, reason: string) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, balance: student.balance + amount }
        : student
    ));
    console.log('Charged student:', { studentId, amount, reason });
  };

  const handleSendReport = (eventId: string, report: any, email: string) => {
    // In a real app, this would send actual email with the detailed report
    console.log('Sending detailed attendance report:', { 
      eventId, 
      report, 
      email,
      reportContent: {
        event: report.event,
        summary: report.summary,
        absentStudentsCount: report.absentStudents?.length || 0,
        attendedStudentsCount: report.attendedStudents?.length || 0,
        absentStudentsList: report.absentStudents,
        attendedStudentsList: report.attendedStudents
      }
    });
    
    // Show a success message with details
    toast.success(`דוח Attendance נSend ל-${email} עם פרטי ${report.absentStudents?.length || 0} Students שNo-showו`);
  };

  const handleSendAbsenteeMessage = (eventId: string, absentStudents: any[], message: string) => {
    // In a real app, this would send actual notifications/emails to absent students
    console.log('Sending message to absent students:', {
      eventId,
      absentStudents: absentStudents.map(s => ({ name: s.name, email: s.email })),
      message,
      count: absentStudents.length
    });
    
    toast.success(`Message נSendה ל-${absentStudents.length} Students שNo-showו`);
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Dashboard stats
  const totalStudents = students.length;
  const upcomingEvents = events.filter(e => e.status === 'upcoming').length;
  const totalDebt = students.reduce((sum, s) => s.balance < 0 ? sum + Math.abs(s.balance) : sum, 0);
  const totalCredit = students.reduce((sum, s) => s.balance > 0 ? sum + s.balance : sum, 0);
  
  // Event minimum registrations check - only for events starting within 14 days
  const eventsNeedingAttention = events.filter(e => {
    if (e.status !== 'upcoming') return false;
    const daysUntilEvent = Math.ceil((new Date(e.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return e.registrations.length < 15 && daysUntilEvent <= 14 && daysUntilEvent > 0;
  }).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 md:mb-8">
          <h1 className="flex items-center gap-2 md:gap-3 text-lg md:text-2xl">
            <School className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <span className="hidden sm:inline">מערכת ניהול טיולים - לימודים בינלאומיים</span>
            <span className="sm:hidden">ניהול טיולים</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            University of Haifa – International School
          </p>
        </div>

        {/* Alert for events needing attention */}
        {eventsNeedingAttention > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <div className="text-yellow-600">⚠️</div>
              <div>
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                  יש {eventsNeedingAttention} טיולים שזקוקים לתשומת לב
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  טיולים המתחילים בעוד שבועיים או פחות עם פחות מ-15 נרשמים. לחץ על לשונית "Events" לפרטים נוספים.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm flex items-center gap-1 md:gap-2">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Students</span>
                <span className="sm:hidden">סטוד'</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl md:text-2xl">{totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm flex items-center gap-1 md:gap-2">
                <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Events עתידיים</span>
                <span className="sm:hidden">Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl md:text-2xl">{upcomingEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm flex items-center gap-1 md:gap-2">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                <span className="hidden sm:inline">זכות (₪)</span>
                <span className="sm:hidden">זכות</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl md:text-2xl text-green-600">+{totalCredit.toLocaleString()} ₪</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm flex items-center gap-1 md:gap-2">
                <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                <span className="hidden sm:inline">חובות (₪)</span>
                <span className="sm:hidden">חובות</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl md:text-2xl text-red-600">-{totalDebt.toLocaleString()} ₪</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            <TabsTrigger value="students" className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3">
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Students</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3">
              <Calendar className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Events</span>
            </TabsTrigger>
            <TabsTrigger value="registrations" className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3">
              <ClipboardList className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Registrations</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3">
              <CheckSquare className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Attendance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-6">
            <StudentManagement
              students={students}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <EventManagement
              events={events}
              onAddEvent={handleAddEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              onSendInvitations={(eventId) => {
                setSelectedEventId(eventId);
                // Switch to registrations tab
                const registrationsTab = document.querySelector('[value="registrations"]') as HTMLElement;
                registrationsTab?.click();
              }}
            />
          </TabsContent>

          <TabsContent value="registrations" className="mt-6">
            <div className="space-y-6">
              {/* Event Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Select Event לניהול Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {events.filter(e => e.status === 'upcoming').map(event => (
                      <Button
                        key={event.id}
                        variant={selectedEventId === event.id ? "default" : "outline"}
                        onClick={() => setSelectedEventId(event.id)}
                        className="justify-start h-auto p-3 flex-wrap"
                      >
                        <span className="flex-1 text-right truncate">{event.title}</span>
                        <Badge variant="secondary" className="mr-2 flex-shrink-0">
                          {event.registrations.length} registered
                        </Badge>
                      </Button>
                    ))}
                  </div>
                  {events.filter(e => e.status === 'upcoming').length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No Events עתידיים. צור Event חדש בלשונית "Events".
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Registration Management */}
              {selectedEvent && (
                <RegistrationManagement
                  event={selectedEvent}
                  students={students}
                  registrationStatuses={registrationStatuses}
                  onSendInvitations={handleSendInvitations}
                  onUpdateRegistration={handleUpdateRegistration}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <div className="space-y-6">
              {/* Event Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Select Event לניהול Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {events.map(event => (
                      <Button
                        key={event.id}
                        variant={selectedEventId === event.id ? "default" : "outline"}
                        onClick={() => setSelectedEventId(event.id)}
                        className="justify-start h-auto p-3 flex-wrap"
                      >
                        <span className="flex-1 text-right truncate">{event.title}</span>
                        <Badge 
                          variant={
                            event.status === 'upcoming' ? 'default' : 
                            event.status === 'ongoing' ? 'secondary' : 'outline'
                          } 
                          className="mr-2 flex-shrink-0"
                        >
                          {event.status === 'upcoming' ? 'עתיד' : 
                           event.status === 'ongoing' ? 'מתרחש כעת' : 'הסתיים'}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                  {events.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No Events במערכת. צור Event חדש בלשונית "Events".
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Attendance Management */}
              {selectedEvent && (
                <AttendanceManagement
                  event={selectedEvent}
                  students={students}
                  onUpdateAttendance={handleUpdateAttendance}
                  onChargeStudent={handleChargeStudent}
                  onSendReport={handleSendReport}
                  onSendAbsenteeMessage={handleSendAbsenteeMessage}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Toaster position="bottom-right" />
    </div>
  );
}