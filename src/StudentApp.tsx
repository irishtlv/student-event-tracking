import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Alert, AlertDescription } from './components/ui/alert';
import { Toaster } from './components/ui/sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { 
  User, 
  Calendar, 
  MapPin, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  History,
  Bell,
  LogIn,
  Home,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Import types and sample data from the main app
import type { Event } from './components/EventManagement';
import type { Student } from './components/StudentManagement';

interface StudentRegistration {
  eventId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  registrationDate: string;
  responseDate?: string;
}

interface StudentNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
}

export default function StudentApp() {
  // Sample data - in real app this would come from API
  const [students] = useState<Student[]>([
    {
      id: '1',
      name: 'יוסף כהן',
      email: 'yosef@example.com',
      phone: '052-1234567',
      balance: -150
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

  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Trip לירושלים',
      description: 'Trip מודרך בעיר העתיקה והכותל המערבי. כולל ארוחת צהריים ומדריך מקצועי.',
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
      description: 'סיור מודרך במוזיאון הטבע העברי עם הרצאה מיוחדת על החי והצומח בישראל.',
      date: '2024-12-10T10:00',
      location: 'תל אביב - מוזיאון הטבע',
      price: 60,
      registrations: ['2', '3'],
      attendance: { '2': true, '3': false },
      status: 'completed'
    },
    {
      id: '3',
      title: 'Trip לחיפה והכרמל',
      description: 'יום של חקר Haifa: הגנים הבהאיים, נמל Haifa ונקודות תצפית על the Carmel.',
      date: '2024-12-20T08:30',
      location: 'Haifa - הגנים הבהאיים',
      price: 90,
      maxParticipants: 25,
      registrations: ['1'],
      attendance: {},
      status: 'upcoming'
    },
    {
      id: '4',
      title: 'Workshop Cooking Falafel',
      description: 'למדו להכין Falafel ביתי אותנטי עם שף מקצועי. כולל ארוחה וחומרי גלם.',
      date: '2024-12-25T14:00',
      location: 'Center Community הדר',
      price: 0,
      maxParticipants: 15,
      registrations: [],
      attendance: {},
      status: 'upcoming'
    }
  ]);

  // State
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [studentRegistrations, setStudentRegistrations] = useState<StudentRegistration[]>([
    { eventId: '1', status: 'confirmed', registrationDate: '2024-12-01', responseDate: '2024-12-02' },
    { eventId: '2', status: 'confirmed', registrationDate: '2024-11-28', responseDate: '2024-11-29' },
    { eventId: '3', status: 'pending', registrationDate: '2024-12-03' }
  ]);

  const [notifications, setNotifications] = useState<StudentNotification[]>([
    {
      id: '1',
      title: 'Trip לירושלים Approved',
      message: 'הרשמתך לטיול לירושלים אושרה. הטיול יתקיים ב-15/12/2024 בTime 09:00',
      type: 'success',
      date: '2024-12-02',
      read: false
    },
    {
      id: '2',
      title: 'Payment Reminder',
      message: 'יש לך חיוב פתוח של 150 ש"ח עבור אי הגעה לסיור במוזיאון הטבע',
      type: 'warning',
      date: '2024-12-11',
      read: false
    },
    {
      id: '3',
      title: 'New trip available',
      message: 'נפתח Trip חדש לחיפה והכרמל. Limited seats - Register now!',
      type: 'info',
      date: '2024-12-03',
      read: true
    }
  ]);

  // Effects
  useEffect(() => {
    // Load current student from localStorage or default to first student
    const savedStudentId = localStorage.getItem('currentStudentId');
    if (savedStudentId) {
      const student = students.find(s => s.id === savedStudentId);
      if (student) {
        setCurrentStudent(student);
      }
    }
  }, [students]);

  // Handlers
  const handleStudentLogin = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setCurrentStudent(student);
      localStorage.setItem('currentStudentId', studentId);
      toast.success(`Hello ${student.name}!`);
    }
  };

  const handleEventRegistration = (eventId: string, action: 'register' | 'cancel') => {
    if (!currentStudent) return;

    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (action === 'register') {
      // Check if event is full
      if (event.maxParticipants && event.registrations.length >= event.maxParticipants) {
        toast.error('Trip is full – no seats available');
        return;
      }

      // Add registration
      const newRegistration: StudentRegistration = {
        eventId,
        status: 'pending',
        registrationDate: new Date().toISOString(),
      };

      setStudentRegistrations(prev => [...prev, newRegistration]);
      toast.success(`נרשמת בהצלחה ל-${event.title}`);

      // Add notification
      const newNotification: StudentNotification = {
        id: Date.now().toString(),
        title: 'Trip registration',
        message: `נרשמת בהצלחה ל-${event.title}. Pending לConfirm המחלקה.`,
        type: 'info',
        date: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [newNotification, ...prev]);

    } else {
      // Cancel registration
      const registration = studentRegistrations.find(r => r.eventId === eventId);
      if (!registration) return;

      const eventDate = new Date(event.date);
      const twoDaysBefore = new Date(eventDate.getTime() - (2 * 24 * 60 * 60 * 1000));
      const now = new Date();

      if (now >= twoDaysBefore) {
        toast.error('לא ניתן לבטל פחות מיומיים לפני הטיול. תחויב במלוא הסכום.');
        return;
      }

      setStudentRegistrations(prev => 
        prev.map(r => 
          r.eventId === eventId 
            ? { ...r, status: 'cancelled' as const, responseDate: new Date().toISOString() }
            : r
        )
      );
      toast.success(`הרשמתך ל-${event.title} בוטלה בהצלחה`);
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  // Utility functions
  const getStudentRegistration = (eventId: string): StudentRegistration | undefined => {
    return studentRegistrations.find(r => r.eventId === eventId);
  };

  const getEventStatusForStudent = (event: Event) => {
    if (!currentStudent) return null;
    
    const registration = getStudentRegistration(event.id);
    const daysUntilEvent = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const canCancel = daysUntilEvent >= 2;
    
    return {
      registration,
      daysUntilEvent,
      canCancel,
      isRegistered: !!registration && registration.status !== 'cancelled',
      isFull: event.maxParticipants ? event.registrations.length >= event.maxParticipants : false
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return price > 0 ? `${formatCurrency(price)}` : 'Free';
  };

  const formatBalance = (balance: number) => {
    if (balance === 0) return '0 ₪';
    return balance > 0 ? `+${formatCurrency(balance)}` : `${formatCurrency(balance)}`;
  };

  const getStatusBadge = (registration?: StudentRegistration) => {
    if (!registration) return null;
    
    switch (registration.status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 ml-1" />
            Approved
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 ml-1" />
            Cancelled
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 ml-1" />
            Pending לConfirm
          </Badge>
        );
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const myUpcomingTrips = upcomingEvents.filter(e => {
    const registration = getStudentRegistration(e.id);
    return registration && registration.status !== 'cancelled';
  }).length;

  // If no student is selected, show login screen
  if (!currentStudent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <LogIn className="h-6 w-6" />
              Enter למערכת
            </CardTitle>
            <p className="text-muted-foreground">
              Trips System – International School
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select student:</label>
                <Select onValueChange={handleStudentLogin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select את שמך" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                במערכת אמיתית תתחבר עם Name משתמש וסיסמה
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="flex items-center gap-2 md:gap-3 text-lg md:text-2xl">
                <User className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                <span>Hello {currentStudent.name}</span>
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                Trips System – International School
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStudent(null);
                localStorage.removeItem('currentStudentId');
              }}
              className="w-full sm:w-auto"
            >
              Switch user
            </Button>
          </div>
        </div>

        {/* Notifications Alert */}
        {unreadNotifications > 0 && (
          <Alert className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <Bell className="h-4 w-4" />
            <AlertDescription>
              יש לך {unreadNotifications} Messages חדשות. לחץ על הלשונית "Messages" לקרא אותן.
            </AlertDescription>
          </Alert>
        )}

        {/* Balance Alert */}
        {currentStudent.balance < 0 && (
          <Alert className="mb-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              יש לך חוב של {Math.abs(currentStudent.balance).toLocaleString()} ₪. אנא פנה למחלקה ליישוב החוב.
            </AlertDescription>
          </Alert>
        )}

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm flex items-center gap-1 md:gap-2">
                <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">My trips</span>
                <span className="sm:hidden">טיולים</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl md:text-2xl text-blue-600">{myUpcomingTrips}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm flex items-center gap-1 md:gap-2">
                <UserCheck className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">טיולים Available</span>
                <span className="sm:hidden">Available</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl md:text-2xl text-green-600">{upcomingEvents.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm flex items-center gap-1 md:gap-2">
                <Bell className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Messages</span>
                <span className="sm:hidden">Messages</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl md:text-2xl text-orange-600">
                {unreadNotifications}
                <span className="text-sm text-muted-foreground">/{notifications.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm flex items-center gap-1 md:gap-2">
                <CreditCard className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Balance (₪)</span>
                <span className="sm:hidden">Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={`text-xl md:text-2xl ${
                currentStudent.balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatBalance(currentStudent.balance)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            <TabsTrigger value="events" className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3">
              <Calendar className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">טיולים</span>
            </TabsTrigger>
            <TabsTrigger value="my-trips" className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3">
              <UserCheck className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">My trips</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3 relative">
              <Bell className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Messages</span>
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="balance" className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3">
              <CreditCard className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Balance</span>
            </TabsTrigger>
          </TabsList>

          {/* Available Events Tab */}
          <TabsContent value="events" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-lg md:text-xl">טיולים Available</h2>
              {upcomingEvents.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No trips available
                  </CardContent>
                </Card>
              ) : (
                upcomingEvents.map(event => {
                  const eventStatus = getEventStatusForStudent(event);
                  return (
                    <Card key={event.id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1">
                            <CardTitle className="text-base md:text-lg flex flex-wrap items-center gap-2 mb-2">
                              {event.title}
                              {eventStatus?.registration && getStatusBadge(eventStatus.registration)}
                              {eventStatus?.isFull && !eventStatus.isRegistered && (
                                <Badge variant="secondary">Full</Badge>
                              )}
                            </CardTitle>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm mb-4">
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
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>
                              {event.registrations.length}
                              {event.maxParticipants && ` / ${event.maxParticipants}`}
                              {' registered'}
                            </span>
                          </div>
                        </div>

                        {eventStatus?.daysUntilEvent && eventStatus.daysUntilEvent < 2 && eventStatus.isRegistered && (
                          <Alert className="mb-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              left פחות מיומיים לטיול. Cancel מהיום יחויב במלוא הסכום ({formatPrice(event.price)})
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="flex gap-2">
                          {!eventStatus?.isRegistered ? (
                            <Button 
                              onClick={() => handleEventRegistration(event.id, 'register')}
                              disabled={eventStatus?.isFull}
                              className="flex-1"
                            >
                              {eventStatus?.isFull ? 'הטיול Full' : 'Register now'}
                            </Button>
                          ) : (
                            <Button 
                              variant="destructive"
                              onClick={() => handleEventRegistration(event.id, 'cancel')}
                              disabled={!eventStatus?.canCancel}
                              className="flex-1"
                            >
                              {!eventStatus?.canCancel ? 'לא ניתן לבטל' : 'Cancel Registration'}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* My Trips Tab */}
          <TabsContent value="my-trips" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-lg md:text-xl">My trips</h2>
              {studentRegistrations.filter(r => r.status !== 'cancelled').length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    אתה לא רשום לאף Trip כרגע
                  </CardContent>
                </Card>
              ) : (
                studentRegistrations
                  .filter(registration => registration.status !== 'cancelled')
                  .map(registration => {
                    const event = events.find(e => e.id === registration.eventId);
                    if (!event) return null;

                    return (
                      <Card key={registration.eventId}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="text-base md:text-lg">{event.title}</span>
                            {getStatusBadge(registration)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm mb-4">
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
                              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span>נרשמת ב-{new Date(registration.registrationDate).toLocaleDateString('en-IL')}</span>
                            </div>
                          </div>

                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                          )}

                          {event.status === 'completed' && event.attendance && (
                            <Alert className={`${
                              event.attendance[currentStudent.id] 
                                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                            }`}>
                              <AlertDescription>
                                {event.attendance[currentStudent.id] ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 inline ml-1 text-green-600" />
                                    השתתפת בטיול זה
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 inline ml-1 text-red-600" />
                                    לא השתתפת בטיול זה - חויבת במלוא הסכום
                                  </>
                                )}
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
              )}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-lg md:text-xl">Messages ({unreadNotifications} חדשות)</h2>
              {notifications.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No notifications
                  </CardContent>
                </Card>
              ) : (
                notifications.map(notification => (
                  <Card 
                    key={notification.id} 
                    className={`cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : ''}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                          notification.type === 'success' ? 'bg-green-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          notification.type === 'error' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium">{notification.title}</h4>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-muted-foreground">
                                {new Date(notification.date).toLocaleDateString('en-IL')}
                              </span>
                              {!notification.read && (
                                <Badge variant="secondary" className="text-xs">חדש</Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Balance Tab */}
          <TabsContent value="balance" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-lg md:text-xl">Balance וחיובים</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Balance נוכחית</span>
                    <Badge variant={currentStudent.balance >= 0 ? 'default' : 'destructive'} className="text-lg px-3 py-1">
                      {formatBalance(currentStudent.balance)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentStudent.balance < 0 ? (
                    <Alert className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        יש לך חוב של {Math.abs(currentStudent.balance).toLocaleString()} ₪.
                        אנא פנה למחלקת הלימודים הבינלאומיים ליישוב החוב.
                        <br />
                        <strong>Phone:</strong> 04-8240111 | <strong>Email:</strong> international@univ.haifa.ac.il
                      </AlertDescription>
                    </Alert>
                  ) : currentStudent.balance > 0 ? (
                    <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        יש לך זכות של {currentStudent.balance.toLocaleString()} ₪.
                        הזכות תנוכה מהטיולים הבאים או שניתן לקבל החזר.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <p className="text-muted-foreground">Your balance is settled.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Trip history
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events
                      .filter(event => {
                        const registration = getStudentRegistration(event.id);
                        return registration && registration.status === 'confirmed';
                      })
                      .map(event => (
                        <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(event.date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`font-medium ${
                              event.status === 'completed' && event.attendance && !event.attendance[currentStudent.id]
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}>
                              {event.status === 'completed' && event.attendance && !event.attendance[currentStudent.id]
                                ? `-${formatCurrency(event.price)}`
                                : event.status === 'completed'
                                ? `✓ ${formatPrice(event.price)}`
                                : 'Pending'
                              }
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {event.status === 'completed' 
                                ? event.attendance && event.attendance[currentStudent.id] 
                                  ? 'השתתפת'
                                  : 'לא השתתפת'
                                : 'Trip עתידי'
                              }
                            </div>
                          </div>
                        </div>
                      ))
                    }
                    
                    {events.filter(event => {
                      const registration = getStudentRegistration(event.id);
                      return registration && registration.status === 'confirmed';
                    }).length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No trip history
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Toaster position="bottom-right" />
    </div>
  );
}