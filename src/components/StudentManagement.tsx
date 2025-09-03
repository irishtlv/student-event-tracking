import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Trash2, UserPlus, Mail, Phone, Edit, Upload, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as XLSX from 'xlsx';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
}

interface StudentManagementProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onUpdateStudent: (id: string, student: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
}

export default function StudentManagement({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent
}: StudentManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    balance: 0
  });
  const [uploadPreview, setUploadPreview] = useState<Omit<Student, 'id'>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Name וEmail הם שדות חובה');
      return;
    }

    if (editingStudent) {
      onUpdateStudent(editingStudent.id, formData);
      toast.success('Student details updated successfully');
    } else {
      onAddStudent(formData);
      toast.success('Student added successfully');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', balance: 0 });
    setEditingStudent(null);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      balance: student.balance
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (student: Student) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את ${student.name}?`)) {
      onDeleteStudent(student.id);
      toast.success('student נDelete בהצלחה');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file only (.xlsx or .xls)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row and process data
        const studentsData = (jsonData as any[]).slice(1).map((row: any[]) => {
          return {
            name: row[0] || '',
            email: row[1] || '',
            phone: row[2] || '',
            balance: Number(row[3]) || 0
          };
        }).filter(student => student.name && student.email);

        setUploadPreview(studentsData);
        setIsUploadDialogOpen(true);
        toast.success(`Found ${studentsData.length} Students בקובץ`);
      } catch (error) {
        toast.error('שגיאה בקריאת הקובץ. אנא ודא שהקובץ תקין');
        console.error('Error reading Excel file:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmUpload = () => {
    let addedCount = 0;
    
    uploadPreview.forEach(studentData => {
      // Check if student already exists (by email)
      const existingStudent = students.find(s => s.email === studentData.email);
      if (!existingStudent && studentData.name && studentData.email) {
        onAddStudent(studentData);
        addedCount++;
      }
    });

    setUploadPreview([]);
    setIsUploadDialogOpen(false);
    toast.success(`${addedCount} Students נוספו בהצלחה`);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatBalance = (balance: number) => {
    if (balance === 0) return '0 ₪';
    return balance > 0 ? `+${formatCurrency(balance)}` : `${formatCurrency(balance)}`;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg md:text-xl">ניהול Students</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto">
                <UserPlus className="ml-2 h-4 w-4" />
                <span className="hidden sm:inline">הוסף student</span>
                <span className="sm:hidden">הוסף</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle className="text-lg">
                  {editingStudent ? 'עריכת student' : 'הוספת student חדש'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="balance">Balance (ILS)</Label>
                  <Input
                    id="balance"
                    type="number"
                    value={formData.balance}
                    onChange={(e) => setFormData(prev => ({ ...prev, balance: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" className="flex-1 order-2 sm:order-1">
                    {editingStudent ? 'עדכן' : 'הוסף'}
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
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto"
            >
              <Upload className="ml-2 h-4 w-4" />
              <span className="hidden sm:inline">Upload Excel</span>
              <span className="sm:hidden">Upload</span>
            </Button>
          </div>
        </div>

        {/* Excel Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                תצוגה מקדימה - העלאת Students מ-Excel
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Required file format:
                </h4>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p>עמודה A: Full name</p>
                  <p>עמודה B: כתובת Email</p>
                  <p>עמודה C: מספר Phone (אופציונלי)</p>
                  <p>עמודה D: Balance בשקלים חדשים (אופציונלי)</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">
                  Found {uploadPreview.length} students in file:
                </h4>
                <div className="max-h-96 overflow-y-auto border rounded-lg">
                  <div className="grid grid-cols-1 gap-2 p-4">
                    {uploadPreview.map((student, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded bg-card">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="font-medium truncate">{student.name}</span>
                            <Badge variant={student.balance >= 0 ? "default" : "destructive"} className="self-start sm:self-auto">
                              {formatBalance(student.balance)}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-muted-foreground text-sm">
                            <div className="flex items-center gap-1 min-w-0">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{student.email}</span>
                            </div>
                            {student.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{student.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {students.some(s => s.email === student.email) && (
                          <Badge variant="outline" className="mt-2 sm:mt-0">
                            Already exists
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleConfirmUpload} className="flex-1 order-2 sm:order-1">
                  <Upload className="ml-2 h-4 w-4" />
                  Confirm והוסף Students
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsUploadDialogOpen(false)}
                  className="flex-1 order-1 sm:order-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {students.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No Students במערכת. הוסף את הסטודנט הראשון.
            </CardContent>
          </Card>
        ) : (
          students.map((student) => (
            <Card key={student.id}>
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="truncate">{student.name}</span>
                      <Badge variant={student.balance >= 0 ? "default" : "destructive"} className="self-start sm:self-auto">
                        {formatBalance(student.balance)}
                      </Badge>
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-muted-foreground text-sm">
                      <div className="flex items-center gap-1 min-w-0">
                        <Mail className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                        <span className="truncate">{student.email}</span>
                      </div>
                      {student.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(student)}
                      className="flex-1 sm:flex-none"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="ml-1 sm:hidden">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(student)}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-1 sm:hidden">מחיקה</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}