import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { 
  Check, 
  X, 
  FileText, 
  Mail, 
  Download,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Send,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as XLSX from 'xlsx';
import type { Event } from './EventManagement';
import type { Student } from './StudentManagement';

interface AttendanceRecord {
  studentId: string;
  attended: boolean;
  charge: number;
}

interface AttendanceManagementProps {
  event: Event;
  students: Student[];
  onUpdateAttendance: (eventId: string, attendance: Record<string, boolean>) => void;
  onChargeStudent: (studentId: string, amount: number, reason: string) => void;
  onSendReport: (eventId: string, report: AttendanceRecord[], email: string) => void;
  onSendAbsenteeMessage: (eventId: string, absentStudents: Student[], message: string) => void;
}

export default function AttendanceManagement({
  event,
  students,
  onUpdateAttendance,
  onChargeStudent,
  onSendReport,
  onSendAbsenteeMessage
}: AttendanceManagementProps) {
  const [attendance, setAttendance] = useState<Record<string, boolean>>(
    event.attendance || {}
  );
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isAbsenteeMessageDialogOpen, setIsAbsenteeMessageDialogOpen] = useState(false);
  const [reportEmail, setReportEmail] = useState('');
  const [absenteeMessage, setAbsenteeMessage] = useState('');

  const registeredStudents = students.filter(student => 
    event.registrations.includes(student.id)
  );

  const handleAttendanceChange = (studentId: string, attended: boolean) => {
    const newAttendance = { ...attendance, [studentId]: attended };
    setAttendance(newAttendance);
    onUpdateAttendance(event.id, newAttendance);
  };

  const calculateCharges = (): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    
    registeredStudents.forEach(student => {
      const attended = attendance[student.id] || false;
      let charge = 0;
      
      if (!attended) {
        // Check if student cancelled more than 2 days before
        const eventDate = new Date(event.date);
        const twoDaysBefore = new Date(eventDate.getTime() - (2 * 24 * 60 * 60 * 1000));
        const now = new Date();
        
        // For demo purposes, assume all no-shows need to pay
        // In real implementation, check cancellation date
        charge = event.price;
      }
      
      records.push({
        studentId: student.id,
        attended,
        charge
      });
    });
    
    return records;
  };

  const handleProcessCharges = () => {
    const records = calculateCharges();
    const chargeRecords = records.filter(r => r.charge > 0);
    
    if (chargeRecords.length === 0) {
      toast.info('No charges to process');
      return;
    }

    chargeRecords.forEach(record => {
      onChargeStudent(
        record.studentId, 
        -record.charge, 
        `אי הגעה לאירוע: ${event.title}`
      );
    });

    toast.success(`${chargeRecords.length} Students חויבו בהצלחה`);
  };

  const handleSendReport = () => {
    if (!reportEmail) {
      toast.error('נדרש להזין כתובת Email');
      return;
    }

    const reportData = generateReportData();
    
    // Create a detailed report object
    const detailedReport = {
      event: {
        title: event.title,
        date: formatDate(event.date),
        location: event.location,
        price: event.price
      },
      summary: {
        attendedCount: reportData.attendedCount,
        absentCount: reportData.absentCount,
        totalCharges: reportData.totalCharges
      },
      absentStudents: reportData.absentStudents.map(record => ({
        name: record.student?.name,
        email: record.student?.email,
        phone: record.student?.phone,
        charge: record.charge
      })),
      attendedStudents: reportData.attendedStudents.map(record => ({
        name: record.student?.name,
        email: record.student?.email,
        phone: record.student?.phone
      }))
    };

    onSendReport(event.id, detailedReport, reportEmail);
    setIsReportDialogOpen(false);
    setReportEmail('');
    toast.success('דוח מפורט נSend בהצלחה');
  };

  const generateReportData = () => {
    const records = calculateCharges();
    const attendedCount = records.filter(r => r.attended).length;
    const absentCount = records.filter(r => !r.attended).length;
    const totalCharges = records.reduce((sum, r) => sum + r.charge, 0);
    
    const absentStudents = records
      .filter(r => !r.attended)
      .map(r => {
        const student = students.find(s => s.id === r.studentId);
        return {
          ...r,
          student
        };
      });

    const attendedStudents = records
      .filter(r => r.attended)
      .map(r => {
        const student = students.find(s => s.id === r.studentId);
        return {
          ...r,
          student
        };
      });

    return {
      records,
      attendedCount,
      absentCount,
      totalCharges,
      absentStudents,
      attendedStudents
    };
  };

  const handleSendAbsenteeMessage = () => {
    if (!absenteeMessage.trim()) {
      toast.error('נדרש להזין Message');
      return;
    }

    const reportData = generateReportData();
    const absentStudents = reportData.absentStudents
      .map(record => record.student)
      .filter(student => student !== undefined) as Student[];

    if (absentStudents.length === 0) {
      toast.info('No Students שNo-showו');
      return;
    }

    onSendAbsenteeMessage(event.id, absentStudents, absenteeMessage);
    setIsAbsenteeMessageDialogOpen(false);
    setAbsenteeMessage('');
    toast.success(`Message נSendה ל-${absentStudents.length} Students שNo-showו`);
  };

  const handleDownloadExcel = () => {
    const reportData = generateReportData();
    
    // Create Excel data
    const excelData = [
      // Headers
      ['Name', 'Email', 'Phone', 'Attendance', 'חיוב (₪)', 'הערות'],
      
      // Data rows
      ...reportData.records.map(record => {
        const student = students.find(s => s.id === record.studentId);
        return [
          student?.name || '',
          student?.email || '',
          student?.phone || '',
          record.attended ? 'Arrived' : 'No-show',
          record.charge || 0,
          record.attended ? '' : (record.charge > 0 ? 'Will be charged due to no-show' : '')
        ];
      })
    ];

    // Add summary at the bottom
    excelData.push([]);
    excelData.push(['סיכום Attendance', '', '', '', '', '']);
    excelData.push(['Event:', event.title, '', '', '', '']);
    excelData.push(['Date:', formatDate(event.date), '', '', '', '']);
    excelData.push(['Location:', event.location, '', '', '', '']);
    excelData.push(['Price:', `${formatCurrency(event.price)}`, '', '', '', '']);
    excelData.push([]);
    excelData.push(['סה"כ registered:', registeredStudents.length, '', '', '', '']);
    excelData.push(['Arrivedו:', reportData.attendedCount, '', '', '', '']);
    excelData.push(['No-showו:', reportData.absentCount, '', '', '', '']);
    excelData.push(['סה"כ חיובים:', `${formatCurrency(reportData.totalCharges)}`, '', '', '', '']);

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'דוח Attendance');

    // Generate filename with event title and date
    const eventDate = new Date(event.date).toISOString().split('T')[0];
    const filename = `דוח_Attendance_${event.title.replace(/[^\w\s]/gi, '')}_${eventDate}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);
    toast.success('קובץ Excel Download בהצלחה');
  };

  const getDefaultAbsenteeMessage = () => {
    return `Hello,

Message בנוגע לטיול: ${event.title}
Date: ${formatDate(event.date)}

מצטערים לציין שלא נרשמה הגעתך לטיול.

בהתאם למדיניות המחלקה, בגין אי הגעה לטיול ללא Cancel מוקדם, חשבונך יחויב בסך של ${formatCurrency(event.price)}.

${event.price > 0 ? 'ניתן לפנות למחלקת הלימודים הבינלאומיים בנוגע לערעור על החיוב תוך 7 days מהיום.' : ''}

בברכה,
מחלקת הלימודים הבינלאומיים
אוניברסיטת Haifa`;
  };

  const reportData = generateReportData();

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Attendance - {event.title}</span>
            <Badge variant={event.status === 'ongoing' ? 'default' : 'secondary'}>
              {event.status === 'ongoing' ? 'מתרחש כעת' : event.status}
            </Badge>
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
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{registeredStudents.length} registered</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{formatPrice(event.price)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>רשימת participants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {registeredStudents.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No Students רשומים לאירוע זה
              </p>
            ) : (
              registeredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Checkbox
                      checked={attendance[student.id] || false}
                      onCheckedChange={(checked) =>
                        handleAttendanceChange(student.id, checked as boolean)
                      }
                      className="flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{student.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {attendance[student.id] ? (
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 ml-1" />
                        <span className="hidden sm:inline">Arrived</span>
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <X className="h-3 w-3 ml-1" />
                        <span className="hidden sm:inline">No-show</span>
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>סיכום Attendance</span>
            {reportData.absentCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {reportData.absentCount} No-showו
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl md:text-2xl text-green-600">{reportData.attendedCount}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Arrivedו</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl text-red-600">{reportData.absentCount}</div>
              <div className="text-xs md:text-sm text-muted-foreground">No-showו</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl text-blue-600">{reportData.totalCharges.toLocaleString()} ₪</div>
              <div className="text-xs md:text-sm text-muted-foreground">סה"כ חיובים</div>
            </div>
          </div>

          {/* רשימת מי שNo-show */}
          {reportData.absentStudents.length > 0 && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-3">
                Students שNo-showו ({reportData.absentStudents.length}):
              </h4>
              <div className="space-y-2">
                {reportData.absentStudents.map((record) => (
                  <div key={record.studentId} className="flex justify-between items-center text-sm">
                    <div className="flex-1">
                      <span className="font-medium text-red-900 dark:text-red-100">
                        {record.student?.name}
                      </span>
                      <span className="text-red-700 dark:text-red-300 mx-2">-</span>
                      <span className="text-red-700 dark:text-red-300">
                        {record.student?.email}
                      </span>
                    </div>
                    {record.charge > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        יחויב {record.charge.toLocaleString()} ₪
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* רשימת מי שArrived */}
          {reportData.attendedStudents.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">
                Students שArrivedו ({reportData.attendedStudents.length}):
              </h4>
              <div className="space-y-1">
                {reportData.attendedStudents.map((record) => (
                  <div key={record.studentId} className="text-sm">
                    <span className="font-medium text-green-900 dark:text-green-100">
                      {record.student?.name}
                    </span>
                    <span className="text-green-700 dark:text-green-300 mx-2">-</span>
                    <span className="text-green-700 dark:text-green-300">
                      {record.student?.email}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {/* First row - charges and email report */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleProcessCharges}
                disabled={reportData.totalCharges === 0}
                className="flex-1"
              >
                <DollarSign className="ml-2 h-4 w-4" />
                <span className="hidden sm:inline">עבד חיובים ({reportData.totalCharges.toLocaleString()} ₪)</span>
                <span className="sm:hidden">חיובים ({reportData.totalCharges.toLocaleString()} ₪)</span>
              </Button>
              
              <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Mail className="ml-2 h-4 w-4" />
                    <span className="hidden sm:inline">Send דוח בEmail</span>
                    <span className="sm:hidden">Send דוח</span>
                  </Button>
                </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg">שליחת דוח Attendance</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reportEmail">כתובת Email לשליחת הדוח</Label>
                    <Input
                      id="reportEmail"
                      type="email"
                      value={reportEmail}
                      onChange={(e) => setReportEmail(e.target.value)}
                      placeholder="Enter email address"
                    />
                    {reportData.absentCount > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        הדוח יכלול פרטים מלאים של {reportData.absentCount} Students שNo-showו
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                    <h4 className="mb-3 font-medium">תצוגה מקדימה של הדוח:</h4>
                    <div className="text-sm space-y-2">
                      <div className="border-b pb-2">
                        <p><strong>Event:</strong> {event.title}</p>
                        <p><strong>Date:</strong> {formatDate(event.date)}</p>
                        <p><strong>Location:</strong> {event.location}</p>
                      </div>
                      
                      <div className="border-b pb-2">
                        <p><strong>סיכום:</strong></p>
                        <p>• Arrivedו: {reportData.attendedCount} Students</p>
                        <p>• No-showו: {reportData.absentCount} Students</p>
                        <p>• סה"כ חיובים: {reportData.totalCharges.toLocaleString()} ₪</p>
                      </div>

                      {reportData.absentStudents.length > 0 && (
                        <div className="border-b pb-2">
                          <p><strong>Students שNo-showו:</strong></p>
                          {reportData.absentStudents.map((record, index) => (
                            <p key={record.studentId} className="mr-2">
                              {index + 1}. {record.student?.name} - {record.student?.email}
                              {record.charge > 0 && ` (יחויב ${formatCurrency(record.charge)})`}
                            </p>
                          ))}
                        </div>
                      )}

                      {reportData.attendedStudents.length > 0 && (
                        <div>
                          <p><strong>Students שArrivedו:</strong></p>
                          {reportData.attendedStudents.map((record, index) => (
                            <p key={record.studentId} className="mr-2">
                              {index + 1}. {record.student?.name} - {record.student?.email}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleSendReport} className="flex-1 order-2 sm:order-1">
                      Send דוח
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsReportDialogOpen(false)}
                      className="flex-1 order-1 sm:order-2"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>

            {/* Second row - absent message and Excel download */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Dialog open={isAbsenteeMessageDialogOpen} onOpenChange={setIsAbsenteeMessageDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    disabled={reportData.absentCount === 0}
                    onClick={() => setAbsenteeMessage(getDefaultAbsenteeMessage())}
                  >
                    <Send className="ml-2 h-4 w-4" />
                    <span className="hidden sm:inline">Message למי שNo-show ({reportData.absentCount})</span>
                    <span className="sm:hidden">Message ({reportData.absentCount})</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg">שליחת Message לStudents שNo-showו</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                      <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                        Message תיSend ל-{reportData.absentCount} Students שNo-showו לטיול
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="absenteeMessage">Message:</Label>
                      <Textarea
                        id="absenteeMessage"
                        value={absenteeMessage}
                        onChange={(e) => setAbsenteeMessage(e.target.value)}
                        rows={12}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={handleSendAbsenteeMessage} 
                        className="flex-1 order-2 sm:order-1"
                        disabled={!absenteeMessage.trim()}
                      >
                        <Send className="ml-2 h-4 w-4" />
                        Send Message ({reportData.absentCount})
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAbsenteeMessageDialogOpen(false)}
                        className="flex-1 order-1 sm:order-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                onClick={handleDownloadExcel}
                className="flex-1"
              >
                <FileSpreadsheet className="ml-2 h-4 w-4" />
                <span className="hidden sm:inline">Download Excel</span>
                <span className="sm:hidden">Excel</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}