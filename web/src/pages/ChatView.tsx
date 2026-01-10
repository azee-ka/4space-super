// Space Chat View - Chat + Space Context & Insights
// web/src/pages/SpaceChatView.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faSearch, faEllipsisV, faPhone, faVideo,
  faCircle, faPaperclip, faSmile, faPaperPlane,
  faFile, faFolder, faCheckCircle, faCalendar, faChartBar,
  faUsers, faClock, faBolt, faArrowTrendUp, faLink,
  faTasks, faImage, faFileAlt, faStar, faComments,
  faRocket, faShieldAlt, faInbox
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Space, Message, User } from '@4space/shared';

interface SpaceMember extends User {
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joined_at: string;
  last_active?: string;
  message_count?: number;
}

interface QuickFile {
  id: string;
  name: string;
  size: number;
  uploaded_by: string;
  uploaded_at: string;
  type: string;
}

interface SpaceTask {
  id: string;
  title: string;
  due_date?: string;
  completed: boolean;
  assigned_to?: string;
}

interface SpaceEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
}

export function SpaceChatView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [space, setSpace] = useState<Space | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [recentFiles, setRecentFiles] = useState<QuickFile[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<SpaceTask[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<SpaceEvent[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadSpaceData();
      loadMessages();
      loadMembers();
      loadSpaceContext();
    }
  }, [id]);

  const loadSpaceData = async () => {
    const { data } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) setSpace(data);
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('space_id', id)
      .order('created_at', { ascending: true })
      .limit(50);
    
    if (data) setMessages(data);
    setLoading(false);
  };

  const loadMembers = async () => {
    // Mock data - replace with actual query
    const mockMembers: SpaceMember[] = [
      {
        id: '1',
        username: 'alice',
        display_name: 'Alice Johnson',
        avatar_url: undefined,
        public_key: '',
        created_at: '',
        role: 'owner',
        joined_at: '2024-01-01',
        last_active: new Date().toISOString(),
        message_count: 247
      },
      {
        id: '2',
        username: 'bob',
        display_name: 'Bob Smith',
        avatar_url: undefined,
        public_key: '',
        created_at: '',
        role: 'admin',
        joined_at: '2024-01-05',
        last_active: new Date(Date.now() - 3600000).toISOString(),
        message_count: 183
      },
      {
        id: '3',
        username: 'charlie',
        display_name: 'Charlie Davis',
        avatar_url: undefined,
        public_key: '',
        created_at: '',
        role: 'editor',
        joined_at: '2024-01-10',
        last_active: new Date(Date.now() - 86400000).toISOString(),
        message_count: 92
      }
    ];
    setMembers(mockMembers);
  };

  const loadSpaceContext = () => {
    // Mock data - replace with actual queries
    setRecentFiles([
      { id: '1', name: 'Q4_Report.pdf', size: 2400000, uploaded_by: 'Alice', uploaded_at: '2 hours ago', type: 'pdf' },
      { id: '2', name: 'Design_Mockups.fig', size: 15600000, uploaded_by: 'Bob', uploaded_at: '5 hours ago', type: 'figma' },
      { id: '3', name: 'Meeting_Notes.md', size: 45000, uploaded_by: 'Charlie', uploaded_at: '1 day ago', type: 'markdown' }
    ]);

    setUpcomingTasks([
      { id: '1', title: 'Review design mockups', due_date: '2024-01-15', completed: false, assigned_to: 'You' },
      { id: '2', title: 'Prepare Q4 presentation', due_date: '2024-01-16', completed: false, assigned_to: 'Alice' },
      { id: '3', title: 'Update documentation', due_date: '2024-01-18', completed: false, assigned_to: 'Bob' }
    ]);

    setUpcomingEvents([
      { id: '1', title: 'Team Standup', date: 'Today', time: '2:00 PM' },
      { id: '2', title: 'Design Review', date: 'Tomorrow', time: '10:00 AM' },
      { id: '3', title: 'Sprint Planning', date: 'Friday', time: '3:00 PM' }
    ]);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user || !id) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      space_id: id,
      sender_id: user.id,
      encrypted_content: messageText,
      content: messageText,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');

    // TODO: Actually save to database
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return faFile;
      case 'image': return faImage;
      case 'figma': return faLink;
      default: return faFileAlt;
    }
  };

  const onlineMembers = members.filter(m => {
    if (!m.last_active) return false;
    const diff = Date.now() - new Date(m.last_active).getTime();
    return diff < 300000; // 5 minutes
  });

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/5 via-black to-purple-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/spaces/${id}`)}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-500"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-gray-400" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: space?.color || 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}
              >
                <FontAwesomeIcon icon={faRocket} className="text-white text-xl" />
              </div>
              
              <div>
                <h2 className="font-bold text-lg text-white">{space?.name}</h2>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <FontAwesomeIcon icon={faUsers} />
                  <span>{members.length} members</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faCircle} className="text-green-400 text-[6px]" />
                    {onlineMembers.length} online
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-500">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-500">
              <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-500">
              <FontAwesomeIcon icon={faVideo} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Space Context */}
        <div className="w-80 border-l border-white/10 flex flex-col overflow-y-auto custom-scrollbar bg-gradient-to-b from-cyan-500/5 via-black to-purple-500/5">
          <div className="p-4 space-y-4">
            {/* Active Members */}
            <div className="relative rounded-xl p-4 border border-cyan-500/10 bg-gradient-to-br from-cyan-500/5 via-black to-purple-500/5">
              <div className="flex items-center gap-2 mb-3">
                <FontAwesomeIcon icon={faBolt} className="text-cyan-400 text-sm" />
                <h3 className="text-sm font-bold text-white">Active Now</h3>
                <span className="ml-auto text-xs text-gray-400">{onlineMembers.length}/{members.length}</span>
              </div>
              <div className="space-y-2">
                {onlineMembers.map((member) => (
                  <div key={member.id} className="group flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-all duration-500">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{member.display_name[0]}</span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{member.display_name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                    <span className="text-xs text-cyan-400 font-semibold">{member.message_count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="relative rounded-xl p-4 border border-purple-500/10 bg-gradient-to-br from-purple-500/5 via-black to-cyan-500/5">
              <div className="flex items-center gap-2 mb-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-purple-400 text-sm" />
                <h3 className="text-sm font-bold text-white">Upcoming Tasks</h3>
                <button className="ml-auto text-xs text-cyan-400 hover:text-cyan-300">View all</button>
              </div>
              <div className="space-y-2">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="group p-2 rounded-lg hover:bg-white/5 transition-all duration-500">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded border-2 border-purple-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{task.due_date}</span>
                          {task.assigned_to && (
                            <>
                              <span className="text-xs text-gray-600">•</span>
                              <span className="text-xs text-cyan-400">{task.assigned_to}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="relative rounded-xl p-4 border border-cyan-500/10 bg-gradient-to-br from-cyan-500/5 via-black to-purple-500/5">
              <div className="flex items-center gap-2 mb-3">
                <FontAwesomeIcon icon={faCalendar} className="text-cyan-400 text-sm" />
                <h3 className="text-sm font-bold text-white">Upcoming</h3>
                <button className="ml-auto text-xs text-cyan-400 hover:text-cyan-300">View all</button>
              </div>
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="group p-2 rounded-lg hover:bg-white/5 transition-all duration-500">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={faCalendar} className="text-cyan-400 text-xs" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.date} • {event.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Files */}
            <div className="relative rounded-xl p-4 border border-purple-500/10 bg-gradient-to-br from-purple-500/5 via-black to-cyan-500/5">
              <div className="flex items-center gap-2 mb-3">
                <FontAwesomeIcon icon={faFolder} className="text-purple-400 text-sm" />
                <h3 className="text-sm font-bold text-white">Recent Files</h3>
                <button className="ml-auto text-xs text-cyan-400 hover:text-cyan-300">View all</button>
              </div>
              <div className="space-y-2">
                {recentFiles.map((file) => (
                  <button key={file.id} className="group w-full text-left p-2 rounded-lg hover:bg-white/5 transition-all duration-500">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={getFileIcon(file.type)} className="text-purple-400 text-xs" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)} • {file.uploaded_at}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => navigate(`/spaces/${id}/files`)}
                className="p-3 rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 hover:from-cyan-500/10 hover:to-purple-500/10 transition-all duration-700 text-center"
              >
                <FontAwesomeIcon icon={faFolder} className="text-cyan-400 mb-1" />
                <p className="text-xs font-semibold text-white">Files</p>
              </button>
              <button 
                onClick={() => navigate(`/spaces/${id}/tasks`)}
                className="p-3 rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 hover:from-purple-500/10 hover:to-cyan-500/10 transition-all duration-700 text-center"
              >
                <FontAwesomeIcon icon={faCheckCircle} className="text-purple-400 mb-1" />
                <p className="text-xs font-semibold text-white">Tasks</p>
              </button>
              <button 
                onClick={() => navigate(`/spaces/${id}/calendar`)}
                className="p-3 rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 hover:from-cyan-500/10 hover:to-purple-500/10 transition-all duration-700 text-center"
              >
                <FontAwesomeIcon icon={faCalendar} className="text-cyan-400 mb-1" />
                <p className="text-xs font-semibold text-white">Calendar</p>
              </button>
              <button 
                onClick={() => navigate(`/spaces/${id}/notes`)}
                className="p-3 rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 hover:from-purple-500/10 hover:to-cyan-500/10 transition-all duration-700 text-center"
              >
                <FontAwesomeIcon icon={faFileAlt} className="text-purple-400 mb-1" />
                <p className="text-xs font-semibold text-white">Notes</p>
              </button>
            </div>
          </div>
        </div>
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex items-center justify-center mb-4">
                  <FontAwesomeIcon icon={faComments} className="text-4xl text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Start the conversation</h3>
                <p className="text-gray-400 text-center max-w-md">
                  This is the beginning of your space chat. Share updates, collaborate, and stay connected with your team.
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg.id} className="mb-4">
                    <div className={`flex items-start gap-3 ${msg.sender_id === user?.id ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <div className={`max-w-lg ${msg.sender_id === user?.id ? 'ml-auto' : ''}`}>
                        <div className={`px-4 py-2 rounded-2xl ${
                          msg.sender_id === user?.id
                            ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white'
                            : 'bg-white/5 border border-white/10 text-white'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-500">
                <FontAwesomeIcon icon={faPaperclip} className="text-gray-400" />
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-500/50 transition-all duration-500 text-white placeholder-gray-500"
                />
              </div>

              <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-500">
                <FontAwesomeIcon icon={faSmile} className="text-gray-400" />
              </button>

              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-500 shadow-lg shadow-purple-500/30"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}