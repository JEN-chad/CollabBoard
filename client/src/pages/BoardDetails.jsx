import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBoards } from '../hooks/useBoards';
import { 
  ArrowLeft, 
  Settings, 
  Trash2, 
  Plus, 
  X, 
  History,
  Search,
  UserPlus
} from 'lucide-react';
import EditBoardModal from '../components/EditBoardModal';
import KanbanBoard from '../components/KanbanBoard';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import socket from '../socket';
import { useToast } from '../context/ToastContext';
import ErrorBoundary from '../components/ErrorBoundary';
import ActivityFeed from '../components/ActivityFeed';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Skeleton from '../components/ui/Skeleton';

const BoardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentBoard, loading, error, fetchBoardById, deleteBoard, setCurrentBoard } = useBoards();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  // Presence & Filtering States
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');

  // Task Card Modals & Conflict States
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskColId, setCreateTaskColId] = useState('todo');
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [selectedTaskCard, setSelectedTaskCard] = useState(null);
  const { addToast } = useToast();

  const handleOpenAddTask = (columnId) => {
    setCreateTaskColId(columnId);
    setIsCreateTaskOpen(true);
  };

  const handleOpenEditTask = (card) => {
    setSelectedTaskCard(card);
    setIsEditTaskOpen(true);
  };

  useEffect(() => {
    fetchBoardById(id);

    // Socket.io initialization & room subscription
    console.log('[Socket] Connecting and joining room:', id);
    const token = localStorage.getItem('collabboard_token');
    socket.auth = { token };
    socket.connect();
    socket.emit('board:join', id);

    // Listen to real-time events
    socket.on('card:create', (newCard) => {
      console.log('[Socket] Card created:', newCard._id);
      setCurrentBoard((prev) => {
        if (!prev || prev._id !== newCard.boardId) return prev;
        if (prev.cards.some(c => c._id === newCard._id)) return prev;
        return {
          ...prev,
          cards: [...(prev.cards || []), newCard]
        };
      });
    });

    socket.on('card:update', (updatedCard) => {
      console.log('[Socket] Card updated:', updatedCard._id);
      setCurrentBoard((prev) => {
        if (!prev || prev._id !== updatedCard.boardId) return prev;
        return {
          ...prev,
          cards: prev.cards.map((c) => (c._id === updatedCard._id ? updatedCard : c))
        };
      });
    });

    socket.on('card:delete', ({ cardId }) => {
      console.log('[Socket] Card deleted:', cardId);
      setCurrentBoard((prev) => {
        if (!prev) return prev;
        const removedCard = prev.cards.find((c) => c._id === cardId);
        if (!removedCard) return prev;

        const remainingCards = prev.cards.filter((c) => c._id !== cardId);
        const updatedCards = remainingCards.map((c) => {
          if (c.columnId === removedCard.columnId && c.position > removedCard.position) {
            return { ...c, position: c.position - 1 };
          }
          return c;
        });

        return {
          ...prev,
          cards: updatedCards
        };
      });
    });

    socket.on('card:move', ({ cardId, sourceCol, destCol, sourceIndex, destIndex, version }) => {
      console.log('[Socket] Card moved:', cardId);
      setCurrentBoard((prev) => {
        if (!prev) return prev;

        const dragCard = prev.cards.find(c => c._id === cardId);
        if (!dragCard) return prev;

        const otherCards = prev.cards.filter(c => c._id !== cardId);

        let updatedCards = [];
        if (sourceCol === destCol) {
          const colCards = otherCards.filter(c => c.columnId === sourceCol).sort((a, b) => a.position - b.position);
          colCards.splice(destIndex, 0, { ...dragCard, version });
          colCards.forEach((c, idx) => {
            c.position = idx;
          });

          updatedCards = [
            ...otherCards.filter(c => c.columnId !== sourceCol),
            ...colCards
          ];
        } else {
          const sourceColCards = otherCards.filter(c => c.columnId === sourceCol).sort((a, b) => a.position - b.position);
          const destColCards = otherCards.filter(c => c.columnId === destCol).sort((a, b) => a.position - b.position);

          sourceColCards.forEach((c, idx) => {
            c.position = idx;
          });

          destColCards.splice(destIndex, 0, { ...dragCard, columnId: destCol, version });
          destColCards.forEach((c, idx) => {
            c.position = idx;
          });

          updatedCards = [
            ...otherCards.filter(c => c.columnId !== sourceCol && c.columnId !== destCol),
            ...sourceColCards,
            ...destColCards
          ];
        }

        updatedCards.sort((a, b) => {
          if (a.columnId !== b.columnId) return a.columnId.localeCompare(b.columnId);
          return a.position - b.position;
        });

        return {
          ...prev,
          cards: updatedCards
        };
      });
    });

    socket.on('card:conflict', ({ message, cardId, card }) => {
      console.warn('[Socket] Card conflict detected:', cardId, message);
      
      // 1. Show conflict toast
      addToast(message || 'Conflict detected: This card has been modified by another user.', 'conflict');
      
      // 2. Replace stale card state
      setCurrentBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          cards: prev.cards.map((c) => (c._id === cardId ? card : c))
        };
      });

      // 3. Sync board automatically
      fetchBoardById(id);
    });

    // Real-time online presence update
    socket.on('presence:update', ({ boardId, users }) => {
      if (boardId === id) {
        console.log('[Socket Presence] Online users updated:', users);
        setOnlineUsers(users);
      }
    });

    // Cleanup on unmount/id change
    return () => {
      console.log('[Socket] Cleaning up listeners and leaving room:', id);
      socket.emit('board:leave', id);
      socket.off('card:create');
      socket.off('card:update');
      socket.off('card:delete');
      socket.off('card:move');
      socket.off('card:conflict');
      socket.off('presence:update');
      socket.disconnect();
      setCurrentBoard(null);
    };
  }, [id, fetchBoardById, setCurrentBoard]);

  if (loading && !currentBoard) {
    return (
      <div className="min-h-screen bg-background text-textPrimary flex flex-col font-sans">
        <Navbar />
        {/* Header Skeleton */}
        <div className="border-b border-border bg-surface/35 px-4 py-4 sm:px-6 lg:px-8 flex-shrink-0 animate-pulse">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton variant="circular" width="w-9" height="h-9" />
              <div className="space-y-2">
                <Skeleton variant="text" width="w-40" height="h-5" />
                <Skeleton variant="text" width="w-60" height="h-3.5" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width="w-20" height="h-6" className="rounded-full" />
              <Skeleton variant="rectangular" width="w-24" height="h-9" />
              <Skeleton variant="rectangular" width="w-24" height="h-9" />
            </div>
          </div>
        </div>
        
        {/* Filter Bar Skeleton */}
        <div className="p-4 border-b border-border bg-surface/15">
          <div className="mx-auto max-w-7xl flex flex-wrap gap-3">
            <Skeleton variant="rectangular" width="w-48" height="h-9" />
            <Skeleton variant="rectangular" width="w-32" height="h-9" />
            <Skeleton variant="rectangular" width="w-32" height="h-9" />
          </div>
        </div>

        {/* Board Columns Skeleton */}
        <div className="flex-1 overflow-x-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
            {[1, 2, 3, 4].map((colIdx) => (
              <div key={colIdx} className="rounded-xl border border-border bg-surface/10 p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <Skeleton variant="text" width="w-16" height="h-4" />
                  <Skeleton variant="circular" width="w-5" height="h-5" />
                </div>
                <div className="space-y-3">
                  {[1, 2].map((cardIdx) => (
                    <div key={cardIdx} className="border border-border bg-surface/30 p-3.5 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <Skeleton variant="text" width="w-12" height="h-3" />
                        <Skeleton variant="text" width="w-6" height="h-3" />
                      </div>
                      <Skeleton variant="text" width="w-full" height="h-4.5" />
                      <Skeleton variant="text" width="w-3/4" height="h-3" />
                      <div className="flex justify-between items-center pt-2 border-t border-border/20">
                        <Skeleton variant="text" width="w-20" height="h-3" />
                        <Skeleton variant="circular" width="w-5" height="h-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background px-4 font-sans text-textPrimary">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger mb-4">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold">Access Denied</h3>
        <p className="mt-2 text-sm text-textSecondary text-center max-w-md">
          {error || 'We could not find this board or you do not have permission to view it.'}
        </p>
        <Link
          to="/"
          className="mt-6 flex items-center gap-2 rounded-lg bg-surface border border-border px-4 py-2 text-sm font-semibold text-white hover:bg-elevated transition-colors min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  if (!currentBoard) return null;

  const isOwner = currentBoard.ownerId?._id === user?._id || currentBoard.ownerId === user?._id;
  
  // Find current user's role on this board
  const getUserRole = () => {
    if (isOwner) return 'Owner';
    const memberObj = currentBoard.members?.find((m) => (m.user?._id || m.user) === user?._id);
    return memberObj?.role || 'Editor';
  };

  const currentRole = getUserRole();

  const handleDeleteBoard = async () => {
    if (window.confirm('Are you sure you want to delete this board? This will permanently delete all data.')) {
      const result = await deleteBoard(currentBoard._id);
      if (result.success) {
        navigate('/');
      }
    }
  };

  // Compile list of unique collaborators to show in header
  const getCollaborators = () => {
    const list = [];
    if (currentBoard.ownerId) {
      list.push({
        _id: currentBoard.ownerId._id || currentBoard.ownerId,
        name: currentBoard.ownerId.name || 'Owner',
        email: currentBoard.ownerId.email || '',
        isOwner: true,
      });
    }
    currentBoard.members?.forEach(m => {
      if (m.user && m.user._id !== currentBoard.ownerId?._id) {
        list.push({
          _id: m.user._id,
          name: m.user.name || 'Member',
          email: m.user.email || '',
          isOwner: false,
        });
      }
    });
    return list;
  };

  const collaborators = getCollaborators();

  const isUserOnline = (userId) => {
    return onlineUsers.some(ou => ou._id?.toString() === userId?.toString());
  };

  const onlineCollaboratorsCount = collaborators.filter(c => isUserOnline(c._id)).length;

  // Filter cards based on search and filters
  const getFilteredCards = () => {
    if (!currentBoard.cards) return [];
    
    return currentBoard.cards.filter((card) => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = card.title?.toLowerCase().includes(q);
        const descMatch = card.description?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch) return false;
      }
      
      // 2. Priority Filter
      if (selectedPriority !== 'all') {
        if (card.priority !== selectedPriority) return false;
      }
      
      // 3. Assignee Filter
      if (selectedAssignee !== 'all') {
        if (selectedAssignee === 'unassigned') {
          if (card.assignee) return false;
        } else {
          const cardAssigneeId = card.assignee?._id || card.assignee;
          if (cardAssigneeId?.toString() !== selectedAssignee) return false;
        }
      }
      
      return true;
    });
  };

  const filteredCards = getFilteredCards();

  // Progress metrics
  const taskCount = currentBoard.cards?.length || 0;
  const completedCount = currentBoard.cards?.filter(c => c.columnId === 'done').length || 0;
  const completionPercentage = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-textPrimary flex flex-col font-sans">
      <Navbar />

      {/* Subheader / Navigation */}
      <header className="border-b border-border bg-surface/30 px-4 py-4 sm:px-6 lg:px-8 flex-shrink-0">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2.5 rounded-lg border border-border bg-surface text-textSecondary hover:text-white hover:bg-elevated transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-white tracking-tight truncate">{currentBoard.title}</h1>
                <Badge variant={currentRole === 'Owner' ? 'primary' : 'neutral'}>
                  {currentRole}
                </Badge>
                {onlineCollaboratorsCount > 0 && (
                  <Badge variant="success">
                    {onlineCollaboratorsCount} Online
                  </Badge>
                )}
              </div>
              <p className="text-xs text-textSecondary mt-1 line-clamp-1 max-w-lg">
                {currentBoard.description || 'No description provided.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Collaborators Stack with Presence Indicators */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5 overflow-hidden">
                {collaborators.map((collab) => (
                  <div key={collab._id} className="relative group hover:translate-y-[-2px] transition-transform">
                    <Avatar 
                      name={collab.name} 
                      size="sm" 
                      className="ring-2 ring-background" 
                      showPresence={true} 
                      isOnline={isUserOnline(collab._id)} 
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Board Progress indicator */}
            <div className="hidden sm:flex flex-col text-right pr-2">
              <span className="text-[9px] text-textSecondary uppercase font-bold tracking-wider">Progress</span>
              <span className="text-xs font-semibold text-white mt-0.5">{completedCount}/{taskCount} tasks ({completionPercentage}%)</span>
            </div>

            {/* Toggle Activity Feed */}
            <Button
              onClick={() => setIsActivityOpen(!isActivityOpen)}
              variant={isActivityOpen ? 'solid' : 'outline'}
              size="sm"
              icon={History}
              className="min-h-[44px]"
            >
              <span>Activity</span>
            </Button>

            {/* Owner Settings Actions */}
            {isOwner && (
              <div className="flex items-center gap-1.5 border-l border-border pl-3">
                <Button
                  onClick={() => setIsEditOpen(true)}
                  variant="outline"
                  size="sm"
                  icon={Settings}
                  className="min-h-[44px]"
                >
                  <span>Settings</span>
                </Button>
                <Button
                  onClick={handleDeleteBoard}
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  className="min-h-[44px]"
                >
                  <span>Delete</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Action and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b border-border bg-surface/10">
        {/* Search & Filter Inputs */}
        <div className="flex flex-wrap items-center gap-2.5 flex-grow sm:max-w-2xl">
          <div className="relative flex-grow sm:max-w-xs">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border text-xs px-3.5 py-2.5 pl-9 rounded-lg focus:border-primary/80 focus:ring-1 focus:ring-primary/20 text-white placeholder-gray-600 outline-none transition-all min-h-[44px]"
            />
            <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-textSecondary pointer-events-none" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3.5 text-textSecondary hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Priority filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-background border border-border text-xs px-3.5 py-2.5 rounded-lg text-textSecondary outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/20 min-h-[44px] cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Assignee filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="bg-background border border-border text-xs px-3.5 py-2.5 rounded-lg text-textSecondary outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/20 max-w-[150px] min-h-[44px] cursor-pointer"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            <option value={currentBoard.ownerId?._id}>{currentBoard.ownerId?.name} (Owner)</option>
            {currentBoard.members?.map((m) => m.user && (
              <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
            ))}
          </select>

          {/* Reset Filters button */}
          {(searchQuery || selectedPriority !== 'all' || selectedAssignee !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPriority('all');
                setSelectedAssignee('all');
              }}
              className="text-xs text-primary hover:text-indigo-400 hover:underline font-semibold"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Create task / invite member buttons */}
        {currentRole !== 'Viewer' && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleOpenAddTask('todo')}
              variant="solid"
              size="sm"
              icon={Plus}
              className="min-h-[44px]"
            >
              <span>Add Task</span>
            </Button>
            {isOwner && (
              <Button
                onClick={() => setIsEditOpen(true)}
                variant="outline"
                size="sm"
                icon={UserPlus}
                className="min-h-[44px]"
              >
                <span>Invite</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area: Board + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Kanban Board Container */}
        <main className="flex-1 overflow-x-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl h-full flex flex-col">
            <ErrorBoundary>
              <KanbanBoard
                cards={filteredCards}
                userRole={currentRole}
                onAddTaskClick={handleOpenAddTask}
                onEditCardClick={handleOpenEditTask}
                onConflict={(msg) => addToast(msg, 'conflict')}
              />
            </ErrorBoundary>
          </div>
        </main>

        {/* Activity Feed Sidebar */}
        {isActivityOpen && (
          <ActivityFeed
            boardId={currentBoard._id}
            onClose={() => setIsActivityOpen(false)}
          />
        )}
      </div>

      {/* Edit Board Settings Modal */}
      <EditBoardModal
        isOpen={isEditOpen}
        board={currentBoard}
        onClose={() => setIsEditOpen(false)}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        columnId={createTaskColId}
        onClose={() => setIsCreateTaskOpen(false)}
      />

      {/* Edit/Delete Task Modal */}
      <EditTaskModal
        isOpen={isEditTaskOpen}
        card={selectedTaskCard}
        onClose={() => {
          setIsEditTaskOpen(false);
          setSelectedTaskCard(null);
        }}
      />
    </div>
  );
};

export default BoardDetails;
