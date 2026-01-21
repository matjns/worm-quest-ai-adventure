import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SupportTicketForm } from "@/components/SupportTicketForm";
import { useAdminControls, SupportTicket } from "@/hooks/useAdminControls";
import { useAuth } from "@/hooks/useAuth";
import { 
  HelpCircle, MessageSquare, Clock, CheckCircle2, Circle, 
  BookOpen, Mail, ExternalLink 
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Help() {
  const { user, isAuthenticated } = useAuth();
  const { fetchMyTickets } = useAdminControls();
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    const loadTickets = async () => {
      const tickets = await fetchMyTickets();
      setMyTickets(tickets);
    };
    if (user) {
      loadTickets();
    }
  }, [user, fetchMyTickets]);

  const handleTicketCreated = async () => {
    const tickets = await fetchMyTickets();
    setMyTickets(tickets);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <Circle className="w-3 h-3 text-blue-500" />;
      case "in_progress": return <Clock className="w-3 h-3 text-amber-500" />;
      case "resolved": return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge variant="outline" className="mb-4">
            <HelpCircle className="w-3 h-3 mr-1" />
            Help & Support
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            How can we help?
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions or submit a support ticket
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Quick Links</h2>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Link to="/learn" className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Learning Center</div>
                    <div className="text-sm text-muted-foreground">Tutorials and guides</div>
                  </div>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Link to="/community" className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-medium">Community</div>
                    <div className="text-sm text-muted-foreground">Connect with other users</div>
                  </div>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <a 
                  href="mailto:support@neuroquest.edu" 
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Email Support</div>
                    <div className="text-sm text-muted-foreground">support@neuroquest.edu</div>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
                </a>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Frequently Asked</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium">How do I reset my password?</div>
                  <div className="text-muted-foreground">Visit the login page and click "Forgot password"</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">How do I earn XP?</div>
                  <div className="text-muted-foreground">Complete missions, quizzes, and daily challenges</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Can I use this for my classroom?</div>
                  <div className="text-muted-foreground">Yes! Check out our Teacher Dashboard</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="new" className="space-y-6">
              <TabsList>
                <TabsTrigger value="new">New Ticket</TabsTrigger>
                <TabsTrigger value="my-tickets">
                  My Tickets
                  {myTickets.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {myTickets.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="new">
                {isAuthenticated ? (
                  <SupportTicketForm onSuccess={handleTicketCreated} />
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Sign in to submit a ticket</h3>
                      <p className="text-muted-foreground mb-4">
                        You need to be logged in to submit a support ticket
                      </p>
                      <Link to="/auth">
                        <Badge variant="outline" className="cursor-pointer">
                          Sign In
                        </Badge>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="my-tickets">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Support Tickets</CardTitle>
                    <CardDescription>
                      Track the status of your submitted tickets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {myTickets.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>You haven't submitted any tickets yet</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-4">
                          {myTickets.map((ticket) => (
                            <div 
                              key={ticket.id}
                              className="p-4 border rounded-lg space-y-2"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{ticket.subject}</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {ticket.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(ticket.status)}
                                  <span className="text-sm capitalize">
                                    {ticket.status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Created: {formatDate(ticket.created_at)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {ticket.category.replace('_', ' ')}
                                </Badge>
                              </div>
                              {ticket.resolution_notes && (
                                <div className="bg-green-500/10 p-3 rounded-lg mt-2">
                                  <div className="text-sm font-medium text-green-600 mb-1">
                                    Resolution:
                                  </div>
                                  <div className="text-sm">{ticket.resolution_notes}</div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
