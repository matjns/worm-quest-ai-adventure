import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Heart, 
  Copy, 
  Plus, 
  Trash2, 
  Check, 
  RefreshCw, 
  Users, 
  Mail,
  Link2,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ParentInvite {
  id: string;
  student_id: string;
  student_name: string;
  invite_code: string | null;
  verified: boolean;
  relationship: string;
  created_at: string;
}

interface Props {
  classrooms: Array<{ id: string; name: string }>;
  students: Array<{ id: string; display_name: string; classroom_id: string }>;
}

export function ParentInviteManager({ classrooms, students }: Props) {
  const { user } = useAuth();
  const [invites, setInvites] = useState<ParentInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchInvites();
    }
  }, [user]);

  async function fetchInvites() {
    if (!user) return;

    setLoading(true);
    try {
      // Get all students for this teacher's classrooms
      const studentIds = students.map(s => s.id);
      
      if (studentIds.length === 0) {
        setInvites([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('parent_student_links')
        .select('*')
        .in('student_id', studentIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map invites with student names
      const invitesWithNames: ParentInvite[] = (data || []).map(invite => {
        const student = students.find(s => s.id === invite.student_id);
        return {
          id: invite.id,
          student_id: invite.student_id,
          student_name: student?.display_name || 'Unknown Student',
          invite_code: invite.invite_code,
          verified: invite.verified,
          relationship: invite.relationship,
          created_at: invite.created_at
        };
      });

      setInvites(invitesWithNames);
    } catch (error) {
      console.error('Error fetching invites:', error);
      toast.error('Failed to load parent invites');
    } finally {
      setLoading(false);
    }
  }

  async function createInvite() {
    if (!user || !selectedStudent) return;

    setCreating(true);
    try {
      // Generate invite code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_parent_invite_code');

      if (codeError) throw codeError;

      const inviteCode = codeData as string;

      // Create the invite link
      const { error: insertError } = await supabase
        .from('parent_student_links')
        .insert({
          student_id: selectedStudent,
          parent_id: user.id, // Temporary - will be replaced when parent claims
          invite_code: inviteCode,
          verified: false,
          relationship: 'parent'
        });

      if (insertError) throw insertError;

      toast.success('Parent invite created!');
      setCreateDialogOpen(false);
      setSelectedStudent('');
      setSelectedClassroom('');
      await fetchInvites();
    } catch (error) {
      console.error('Error creating invite:', error);
      toast.error('Failed to create invite');
    } finally {
      setCreating(false);
    }
  }

  async function deleteInvite(inviteId: string) {
    try {
      const { error } = await supabase
        .from('parent_student_links')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;

      toast.success('Invite deleted');
      setInvites(prev => prev.filter(i => i.id !== inviteId));
    } catch (error) {
      console.error('Error deleting invite:', error);
      toast.error('Failed to delete invite');
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Invite code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  }

  const filteredStudents = selectedClassroom
    ? students.filter(s => s.classroom_id === selectedClassroom)
    : students;

  // Group invites by classroom
  const invitesByClassroom = invites.reduce((acc, invite) => {
    const student = students.find(s => s.id === invite.student_id);
    const classroom = classrooms.find(c => c.id === student?.classroom_id);
    const classroomName = classroom?.name || 'Unknown Classroom';
    
    if (!acc[classroomName]) {
      acc[classroomName] = [];
    }
    acc[classroomName].push(invite);
    return acc;
  }, {} as Record<string, ParentInvite[]>);

  const pendingCount = invites.filter(i => !i.verified && i.invite_code).length;
  const linkedCount = invites.filter(i => i.verified).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{invites.length}</div>
                <div className="text-sm text-muted-foreground">Total Invites</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{linkedCount}</div>
                <div className="text-sm text-muted-foreground">Linked</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Parent Invites</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchInvites} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Create Parent Invite
                </DialogTitle>
                <DialogDescription>
                  Generate an invite code for a parent to link to their child's account.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Classroom</Label>
                  <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a classroom" />
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Student</Label>
                  <Select 
                    value={selectedStudent} 
                    onValueChange={setSelectedStudent}
                    disabled={!selectedClassroom}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedClassroom ? "Select a student" : "Select classroom first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredStudents.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.display_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={createInvite} 
                  className="w-full" 
                  disabled={creating || !selectedStudent}
                >
                  {creating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      Generate Invite Code
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Invites List */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading invites...</p>
          </CardContent>
        </Card>
      ) : invites.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No Parent Invites Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create invite codes for parents to view their child's progress.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Invite
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-6">
            {Object.entries(invitesByClassroom).map(([classroomName, classroomInvites]) => (
              <Card key={classroomName}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {classroomName}
                  </CardTitle>
                  <CardDescription>
                    {classroomInvites.length} invite{classroomInvites.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {classroomInvites.map(invite => (
                      <div
                        key={invite.id}
                        className={`p-4 rounded-lg border ${
                          invite.verified 
                            ? 'bg-green-500/5 border-green-500/20' 
                            : 'bg-card'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              invite.verified 
                                ? 'bg-green-500/10' 
                                : 'bg-muted'
                            }`}>
                              {invite.verified ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Heart className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{invite.student_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {invite.verified ? (
                                  <span className="text-green-600">Parent linked</span>
                                ) : invite.invite_code ? (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Pending
                                  </span>
                                ) : (
                                  'No code generated'
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {invite.invite_code && !invite.verified && (
                              <div className="flex items-center gap-2">
                                <code className="bg-muted px-3 py-1 rounded font-mono text-sm font-bold tracking-widest">
                                  {invite.invite_code}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => copyCode(invite.invite_code!)}
                                >
                                  {copiedCode === invite.invite_code ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            )}
                            
                            {!invite.verified && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => deleteInvite(invite.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-muted-foreground">
                          Created {format(new Date(invite.created_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Instructions */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            How Parent Linking Works
          </h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Generate an invite code for a student</li>
            <li>Share the code with the parent (via email, note, etc.)</li>
            <li>Parent creates an account and enters the code at the Parent Portal</li>
            <li>Once linked, parents can view intervention plans and progress</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}