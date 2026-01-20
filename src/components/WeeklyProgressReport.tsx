import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Download,
  Mail,
  Printer,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Zap,
  Brain,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  User,
  School
} from 'lucide-react';
import { toast } from 'sonner';

export interface StudentReportData {
  id: string;
  display_name: string;
  classroom_name: string;
  grade_level: string;
  school_name?: string;
  progress_data: {
    missions_completed: number;
    total_xp: number;
    accuracy: number;
    strengths: string[];
    weaknesses: string[];
  };
  weekly_stats?: {
    xp_gained: number;
    missions_this_week: number;
    accuracy_change: number;
    level_ups: number;
  };
  ai_summary?: string;
  ai_recommendations?: string[];
}

interface WeeklyProgressReportProps {
  student: StudentReportData;
  weekNumber?: number;
  onSendEmail?: (email: string, message: string) => Promise<boolean>;
  loading?: boolean;
}

export function WeeklyProgressReport({ 
  student, 
  weekNumber = 1,
  onSendEmail,
  loading = false
}: WeeklyProgressReportProps) {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [sending, setSending] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const level = Math.floor(student.progress_data.total_xp / 100) + 1;
  const xpInLevel = student.progress_data.total_xp % 100;

  const handlePrint = () => {
    const printContent = reportRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print the report');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Progress Report - ${student.display_name}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              color: #1a1a1a;
            }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
            .student-name { font-size: 28px; margin: 10px 0; }
            .meta { color: #666; font-size: 14px; }
            .section { margin: 25px 0; }
            .section-title { font-size: 18px; font-weight: 600; color: #6366f1; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
            .stat-box { background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #1a1a1a; }
            .stat-label { font-size: 12px; color: #666; margin-top: 4px; }
            .badge { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin: 2px; }
            .summary { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .recommendation { padding: 8px 0; border-bottom: 1px solid #eee; }
            .progress-bar { background: #e5e7eb; height: 10px; border-radius: 5px; overflow: hidden; }
            .progress-fill { background: #6366f1; height: 100%; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🧠 NeuroQuest</div>
            <div class="student-name">${student.display_name}</div>
            <div class="meta">
              ${student.classroom_name} • ${student.grade_level} • Week ${weekNumber} Progress Report
              ${student.school_name ? ` • ${student.school_name}` : ''}
            </div>
          </div>

          <div class="section">
            <div class="section-title">📊 Performance Overview</div>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-value">${student.progress_data.total_xp}</div>
                <div class="stat-label">Total XP</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${level}</div>
                <div class="stat-label">Current Level</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${student.progress_data.missions_completed}</div>
                <div class="stat-label">Missions Completed</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${student.progress_data.accuracy.toFixed(0)}%</div>
                <div class="stat-label">Accuracy</div>
              </div>
            </div>
          </div>

          ${student.weekly_stats ? `
          <div class="section">
            <div class="section-title">📈 This Week's Progress</div>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-value">+${student.weekly_stats.xp_gained}</div>
                <div class="stat-label">XP Gained</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${student.weekly_stats.missions_this_week}</div>
                <div class="stat-label">Missions</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${student.weekly_stats.accuracy_change >= 0 ? '+' : ''}${student.weekly_stats.accuracy_change.toFixed(1)}%</div>
                <div class="stat-label">Accuracy Change</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${student.weekly_stats.level_ups}</div>
                <div class="stat-label">Level Ups</div>
              </div>
            </div>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">⭐ Strengths</div>
            ${student.progress_data.strengths.length > 0 
              ? student.progress_data.strengths.map(s => `<span class="badge">${s}</span>`).join('')
              : '<p style="color:#666">Still discovering strengths through missions...</p>'
            }
          </div>

          <div class="section">
            <div class="section-title">🎯 Areas for Growth</div>
            ${student.progress_data.weaknesses.length > 0 
              ? student.progress_data.weaknesses.map(w => `<span class="badge" style="background:#fee2e2;color:#dc2626">${w}</span>`).join('')
              : '<p style="color:#666">No specific areas identified yet.</p>'
            }
          </div>

          ${student.ai_summary ? `
          <div class="section">
            <div class="section-title">🤖 AI Learning Summary</div>
            <div class="summary">${student.ai_summary}</div>
          </div>
          ` : ''}

          ${student.ai_recommendations && student.ai_recommendations.length > 0 ? `
          <div class="section">
            <div class="section-title">💡 Recommendations for Home</div>
            ${student.ai_recommendations.map(r => `<div class="recommendation">• ${r}</div>`).join('')}
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">🚀 Level Progress</div>
            <p>Level ${level} → Level ${level + 1}</p>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${xpInLevel}%"></div>
            </div>
            <p style="font-size:12px;color:#666;margin-top:5px">${xpInLevel}/100 XP to next level</p>
          </div>

          <div class="footer">
            <p>Generated by NeuroQuest AI Learning Platform</p>
            <p>Report Date: ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportPDF = () => {
    // Use print dialog with "Save as PDF" option
    handlePrint();
    toast.info('Use "Save as PDF" in the print dialog to export');
  };

  const handleSendEmail = async () => {
    if (!parentEmail || !onSendEmail) return;
    
    setSending(true);
    try {
      const success = await onSendEmail(parentEmail, personalMessage);
      if (success) {
        toast.success('Report sent successfully!');
        setEmailDialogOpen(false);
        setParentEmail('');
        setPersonalMessage('');
      }
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Generating AI progress report...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">{student.display_name}</CardTitle>
              <Badge variant="secondary">Level {level}</Badge>
            </div>
            <CardDescription className="flex items-center gap-2">
              <School className="w-3 h-3" />
              {student.classroom_name} • {student.grade_level}
              {student.school_name && ` • ${student.school_name}`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            Week {weekNumber}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6" ref={reportRef}>
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <p className="text-lg font-bold">{student.progress_data.total_xp}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <p className="text-lg font-bold">{student.progress_data.missions_completed}</p>
            <p className="text-xs text-muted-foreground">Missions</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Target className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-bold">{student.progress_data.accuracy.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Award className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <p className="text-lg font-bold">{level}</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
        </div>

        {/* Weekly Stats */}
        {student.weekly_stats && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                This Week's Progress
              </h4>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded text-center">
                  <p className="font-semibold text-green-600">+{student.weekly_stats.xp_gained}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-center">
                  <p className="font-semibold text-blue-600">{student.weekly_stats.missions_this_week}</p>
                  <p className="text-xs text-muted-foreground">Missions</p>
                </div>
                <div className={`p-2 rounded text-center ${student.weekly_stats.accuracy_change >= 0 ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
                  <p className={`font-semibold ${student.weekly_stats.accuracy_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {student.weekly_stats.accuracy_change >= 0 ? '+' : ''}{student.weekly_stats.accuracy_change.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded text-center">
                  <p className="font-semibold text-purple-600">{student.weekly_stats.level_ups}</p>
                  <p className="text-xs text-muted-foreground">Level Ups</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-600">
              <Award className="w-4 h-4" />
              Strengths
            </h4>
            <div className="flex flex-wrap gap-1">
              {student.progress_data.strengths.length > 0 ? (
                student.progress_data.strengths.map((strength, i) => (
                  <Badge key={i} variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {strength}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Discovering through missions...</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-600">
              <Target className="w-4 h-4" />
              Areas for Growth
            </h4>
            <div className="flex flex-wrap gap-1">
              {student.progress_data.weaknesses.length > 0 ? (
                student.progress_data.weaknesses.map((weakness, i) => (
                  <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {weakness}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No areas identified yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Summary */}
        {student.ai_summary && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                AI Learning Summary
              </h4>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {student.ai_summary}
              </p>
            </div>
          </>
        )}

        {/* AI Recommendations */}
        {student.ai_recommendations && student.ai_recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              Recommendations for Home
            </h4>
            <ul className="space-y-1">
              {student.ai_recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Level Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Level {level} Progress</span>
            <span className="text-muted-foreground">{xpInLevel}/100 XP</span>
          </div>
          <Progress value={xpInLevel} className="h-2" />
        </div>
      </CardContent>

      {/* Action Buttons */}
      <div className="px-6 pb-6 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={handleExportPDF}>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex-1">
              <Mail className="w-4 h-4 mr-2" />
              Email Parent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Progress Report</DialogTitle>
              <DialogDescription>
                Email this weekly progress report to {student.display_name}'s parent/guardian.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Parent/Guardian Email</Label>
                <Input
                  type="email"
                  placeholder="parent@email.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Personal Message (optional)</Label>
                <Textarea
                  placeholder="Add a personal note to accompany the report..."
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleSendEmail} 
                className="w-full" 
                disabled={!parentEmail || sending}
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Send Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
