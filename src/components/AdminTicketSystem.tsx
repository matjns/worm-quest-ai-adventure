import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminControls, SupportTicket } from "@/hooks/useAdminControls";
import { 
  Ticket, Search, RefreshCw, MessageSquare, Clock, AlertTriangle, 
  CheckCircle2, Circle, User, Calendar, Filter
} from "lucide-react";

const CATEGORIES = ["general", "technical", "billing", "feature_request", "bug_report"];
const PRIORITIES = ["low", "normal", "high", "urgent"];
const STATUSES = ["open", "in_progress", "waiting", "resolved", "closed"];

export function AdminTicketSystem() {
  const { tickets, fetchTickets, updateTicket, isAdmin } = useAdminControls();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchTickets();
    }
  }, [isAdmin, fetchTickets]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTickets();
    setIsRefreshing(false);
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    await updateTicket(ticketId, { status: newStatus });
  };

  const handlePriorityChange = async (ticketId: string, newPriority: string) => {
    await updateTicket(ticketId, { priority: newPriority });
  };

  const handleResolve = async () => {
    if (!selectedTicket) return;
    
    await updateTicket(selectedTicket.id, {
      status: 'resolved',
      resolution_notes: resolutionNotes,
    });
    setSelectedTicket(null);
    setResolutionNotes("");
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <Circle className="w-3 h-3 text-blue-500" />;
      case "in_progress": return <Clock className="w-3 h-3 text-amber-500" />;
      case "waiting": return <AlertTriangle className="w-3 h-3 text-orange-500" />;
      case "resolved": return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case "closed": return <CheckCircle2 className="w-3 h-3 text-muted-foreground" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-500/10 text-gray-500",
      normal: "bg-blue-500/10 text-blue-500",
      high: "bg-amber-500/10 text-amber-500",
      urgent: "bg-red-500/10 text-red-500",
    };
    return colors[priority] || colors.normal;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ticketCounts = {
    all: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Support Tickets
            </CardTitle>
            <CardDescription>
              Manage user support requests and track resolution
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{ticketCounts.all}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{ticketCounts.open}</div>
            <div className="text-sm text-muted-foreground">Open</div>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-amber-500">{ticketCounts.in_progress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{ticketCounts.resolved}</div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map(s => (
                <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {PRIORITIES.map(p => (
                <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tickets Table */}
        <ScrollArea className="h-[400px] border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <span className="text-sm capitalize">{ticket.status.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium max-w-[200px] truncate" title={ticket.subject}>
                      {ticket.subject}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="w-3 h-3" />
                      {ticket.user_email || "Anonymous"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityBadge(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize text-sm">
                    {ticket.category.replace('_', ' ')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(ticket.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Ticket Details</DialogTitle>
                        </DialogHeader>
                        {selectedTicket && (
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <Select 
                                  value={selectedTicket.status}
                                  onValueChange={(v) => handleStatusChange(selectedTicket.id, v)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STATUSES.map(s => (
                                      <SelectItem key={s} value={s} className="capitalize">
                                        {s.replace('_', ' ')}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Priority</label>
                                <Select 
                                  value={selectedTicket.priority}
                                  onValueChange={(v) => handlePriorityChange(selectedTicket.id, v)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PRIORITIES.map(p => (
                                      <SelectItem key={p} value={p} className="capitalize">
                                        {p}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Subject</label>
                              <div className="p-3 bg-muted rounded-lg mt-1">
                                {selectedTicket.subject}
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Description</label>
                              <div className="p-3 bg-muted rounded-lg mt-1 whitespace-pre-wrap">
                                {selectedTicket.description}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">User: </span>
                                {selectedTicket.user_email || "Anonymous"}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Created: </span>
                                {formatDate(selectedTicket.created_at)}
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Resolution Notes</label>
                              <Textarea
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                placeholder="Add resolution notes..."
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                            Close
                          </Button>
                          <Button onClick={handleResolve}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Mark Resolved
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {searchQuery || statusFilter !== "all" || priorityFilter !== "all" 
                      ? "No tickets match your filters" 
                      : "No support tickets yet"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
