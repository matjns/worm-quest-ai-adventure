import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Heart, MessageCircle, GitFork, Star, AtSign,
  Check, Trash2, CheckCheck, X, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotificationsData, Notification } from "@/hooks/useNotificationsData";
import { useMentionsInbox } from "@/hooks/useMentionsInbox";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { MentionsInbox } from "./MentionsInbox";

const notificationIcons: Record<string, typeof Heart> = {
  like: Heart,
  comment: MessageCircle,
  fork: GitFork,
  feature: Star,
  mention: AtSign,
  reply: MessageCircle,
};

const notificationColors: Record<string, string> = {
  like: "text-pink-500",
  comment: "text-blue-500",
  fork: "text-green-500",
  feature: "text-yellow-500",
  mention: "text-primary",
  reply: "text-purple-500",
};

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = notificationIcons[notification.type];
  const colorClass = notificationColors[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-3 border-b border-border hover:bg-muted/50 transition-colors ${
        !notification.read ? "bg-primary/5" : ""
      }`}
    >
      <div className="flex gap-3">
        <div className={`mt-0.5 ${colorClass}`}>
          <Icon className={`w-5 h-5 ${notification.type === "like" ? "fill-current" : ""}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notification.read ? "font-semibold" : ""}`}>
            {notification.title}
          </p>
          {notification.message && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {notification.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              title="Mark as read"
            >
              <Check className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function NotificationCenter() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationsData();
  const { mentions } = useMentionsInbox();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"notifications" | "mentions">("notifications");

  if (!isAuthenticated) return null;

  const handleNavigateToCircuit = (circuitId: string) => {
    setOpen(false);
    navigate(`/community?circuit=${circuitId}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "notifications" | "mentions")}>
          <div className="flex items-center justify-between p-3 border-b border-border">
            <TabsList className="h-8">
              <TabsTrigger value="notifications" className="text-xs gap-1 px-2">
                <Bell className="w-3 h-3" />
                Activity
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="mentions" className="text-xs gap-1 px-2">
                <AtSign className="w-3 h-3" />
                Mentions
                {mentions.length > 0 && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                    {mentions.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            {activeTab === "notifications" && (
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={markAllAsRead}
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3 h-3" />
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                    onClick={clearAll}
                    title="Clear all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          <TabsContent value="notifications" className="m-0">
            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Bell className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll be notified when someone interacts with your circuits
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </AnimatePresence>
              )}
            </ScrollArea>

            {notifications.length > 0 && (
              <div className="p-2 border-t border-border">
                <Link to="/community" onClick={() => setOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View all activity in Community
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="mentions" className="m-0">
            <MentionsInbox onNavigateToCircuit={handleNavigateToCircuit} />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
