import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Settings, User, ArrowRight } from 'lucide-react';
import MainApp from './MainApp';
import StudentApp from './StudentApp';

type AppType = 'selector' | 'admin' | 'student';

export default function AppSelector() {
  const [currentApp, setCurrentApp] = useState<AppType>('selector');

  if (currentApp === 'admin') {
    return (
      <div>
        <div className="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800 p-2 text-center">
          <span className="text-sm text-blue-800 dark:text-blue-200">
            Admin Mode
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentApp('selector')}
            className="ml-2"
          >
            Back to selection
          </Button>
        </div>
        <MainApp />
      </div>
    );
  }

  if (currentApp === 'student') {
    return (
      <div>
        <div className="bg-green-50 dark:bg-green-950/20 border-b border-green-200 dark:border-green-800 p-2 text-center">
          <span className="text-sm text-green-800 dark:text-green-200">
            מצב student
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentApp('selector')}
            className="ml-2"
          >
            Back to selection
          </Button>
        </div>
        <StudentApp />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            מערכת ניהול טיולים
          </h1>
          <p className="text-muted-foreground">
            University of Haifa – International School
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Settings className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl">אפליקציית המנהל</CardTitle>
              <Badge variant="secondary" className="mx-auto">
                לצוות המחלקה
              </Badge>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                ניהול Full של המערכת: Students, Events, Registrations וAttendance
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>ניהול Students</span>
                  <Badge variant="outline">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>יצירת Events</span>
                  <Badge variant="outline">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>ניהול Registrations</span>
                  <Badge variant="outline">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>מעקב Attendance</span>
                  <Badge variant="outline">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reports ותשלומים</span>
                  <Badge variant="outline">✓</Badge>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentApp('admin')}
                className="w-full group-hover:bg-blue-600"
              >
                Enter למערכת ניהול
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <User className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl">אפליקציית הסטודנט</CardTitle>
              <Badge variant="secondary" className="mx-auto">
                לStudents
              </Badge>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                רישום לטיולים, מעקב אחר Balance ותזכורות אישיות
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>צפייה בטיולים Available</span>
                  <Badge variant="outline">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Registration וCancel</span>
                  <Badge variant="outline">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>מעקב Balance</span>
                  <Badge variant="outline">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Messages והתראות</span>
                  <Badge variant="outline">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Trip history</span>
                  <Badge variant="outline">✓</Badge>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentApp('student')}
                variant="outline"
                className="w-full group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600"
              >
                Enter כסטודנט
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>הדגמה:</strong> שתי האפליקציות משתמשות באותם נתוני דמו. 
            במערכת אמיתית הן יתחברו לאותה מסד נתונים ויעבדו בסינכרון Full.
          </p>
        </div>
      </div>
    </div>
  );
}