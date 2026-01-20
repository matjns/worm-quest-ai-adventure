import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isPast, isToday, isTomorrow, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  BookOpen,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PREK_MODULES,
  K5_MODULES,
  MIDDLE_MODULES,
  HIGH_MODULES,
  PUBLIC_MODULES,
  getModuleById,
} from "@/data/educationModules";
import type { AssignmentWithProgress } from "@/hooks/useModuleAssignments";

const allModules = [
  ...PREK_MODULES,
  ...K5_MODULES,
  ...MIDDLE_MODULES,
  ...HIGH_MODULES,
  ...PUBLIC_MODULES,
];

interface ModuleAssignmentManagerProps {
  classroomId: string;
  assignments: AssignmentWithProgress[];
  loading: boolean;
  onCreateAssignment: (
    moduleId: string,
    title: string,
    description?: string,
    dueDate?: Date
  ) => Promise<{ success: boolean }>;
  onDeleteAssignment: (assignmentId: string) => Promise<{ success: boolean }>;
}

export function ModuleAssignmentManager({
  classroomId,
  assignments,
  loading,
  onCreateAssignment,
  onDeleteAssignment,
}: ModuleAssignmentManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState<AssignmentWithProgress | null>(null);

  const handleCreate = async () => {
    if (!selectedModuleId || !title.trim()) return;

    setIsSubmitting(true);
    const result = await onCreateAssignment(
      selectedModuleId,
      title.trim(),
      description.trim() || undefined,
      dueDate
    );

    if (result.success) {
      setIsCreateOpen(false);
      setSelectedModuleId("");
      setTitle("");
      setDescription("");
      setDueDate(undefined);
    }
    setIsSubmitting(false);
  };

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    const module = getModuleById(moduleId);
    if (module && !title) {
      setTitle(module.title);
    }
  };

  const getDueDateStatus = (dueDate: string | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) return "overdue";
    if (isToday(date)) return "today";
    if (isTomorrow(date)) return "tomorrow";
    const daysUntil = differenceInDays(date, new Date());
    if (daysUntil <= 3) return "soon";
    return "upcoming";
  };

  const getDueDateBadge = (dueDate: string | null) => {
    const status = getDueDateStatus(dueDate);
    if (!status || !dueDate) return null;

    const date = new Date(dueDate);
    const formattedDate = format(date, "MMM d");

    switch (status) {
      case "overdue":
        return <Badge variant="destructive">Overdue - {formattedDate}</Badge>;
      case "today":
        return <Badge className="bg-amber-500">Due Today</Badge>;
      case "tomorrow":
        return <Badge className="bg-amber-500/80">Due Tomorrow</Badge>;
      case "soon":
        return <Badge variant="secondary">Due {formattedDate}</Badge>;
      default:
        return <Badge variant="outline">Due {formattedDate}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Module Assignments</h2>
          <p className="text-muted-foreground">
            Assign modules to your students and track their progress
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Module Assignment</DialogTitle>
              <DialogDescription>
                Assign a module to all students in this classroom
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Module</label>
                <Select value={selectedModuleId} onValueChange={handleModuleSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a module..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {allModules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase text-muted-foreground">
                            {module.gradeLevel}
                          </span>
                          <span>{module.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assignment Title</label>
                <Input
                  placeholder="e.g., Week 3: Brain Builder Challenge"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  placeholder="Add instructions or context for students..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date (Optional)</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!selectedModuleId || !title.trim() || isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No assignments yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Create your first assignment to start tracking student progress on modules
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Assignment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {assignments.map((assignment) => {
              const module = getModuleById(assignment.module_id);
              const completionRate = assignment.stats.total > 0
                ? (assignment.stats.completed / assignment.stats.total) * 100
                : 0;

              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg truncate">
                              {assignment.title}
                            </h3>
                            {getDueDateBadge(assignment.due_date)}
                          </div>
                          
                          {module && (
                            <Badge variant="outline" className="mb-2">
                              {module.gradeLevel.toUpperCase()} • {module.title}
                            </Badge>
                          )}

                          {assignment.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {assignment.description}
                            </p>
                          )}

                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {assignment.stats.total} students
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              {assignment.stats.completed} completed
                            </div>
                            {assignment.stats.inProgress > 0 && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-amber-500" />
                                {assignment.stats.inProgress} in progress
                              </div>
                            )}
                            {assignment.stats.pending > 0 && (
                              <div className="flex items-center gap-1">
                                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                {assignment.stats.pending} pending
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingAssignment(assignment)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Progress
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => onDeleteAssignment(assignment.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="w-32">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>{Math.round(completionRate)}%</span>
                              <span className="text-muted-foreground">Complete</span>
                            </div>
                            <Progress value={completionRate} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Progress Detail Dialog */}
      <Dialog open={!!viewingAssignment} onOpenChange={() => setViewingAssignment(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingAssignment?.title}</DialogTitle>
            <DialogDescription>
              Student progress for this assignment
            </DialogDescription>
          </DialogHeader>

          {viewingAssignment && (
            <div className="space-y-4">
              {/* Stats Summary */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{viewingAssignment.stats.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {viewingAssignment.stats.completed}
                    </div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-amber-500">
                      {viewingAssignment.stats.inProgress}
                    </div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{viewingAssignment.stats.avgScore}</div>
                    <div className="text-xs text-muted-foreground">Avg Score</div>
                  </CardContent>
                </Card>
              </div>

              {/* Student Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Time Spent</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewingAssignment.progress.map((progress) => (
                    <TableRow key={progress.id}>
                      <TableCell className="font-medium">
                        {progress.student?.display_name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            progress.status === "completed"
                              ? "default"
                              : progress.status === "in_progress"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {progress.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {progress.score > 0 ? `${progress.score} pts` : "-"}
                      </TableCell>
                      <TableCell>
                        {progress.time_spent_seconds > 0
                          ? `${Math.round(progress.time_spent_seconds / 60)} min`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {progress.completed_at
                          ? format(new Date(progress.completed_at), "MMM d, h:mm a")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
