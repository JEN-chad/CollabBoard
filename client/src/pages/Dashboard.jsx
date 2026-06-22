import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useBoards } from '../hooks/useBoards';
import { 
  LayoutGrid, 
  Users, 
  CheckSquare, 
  Plus, 
  RefreshCw, 
  History, 
  ClipboardList, 
  ArrowRight,
  UserCheck,
  TrendingUp,
  Clock
} from 'lucide-react';
import BoardCard from '../components/BoardCard';
import CreateBoardModal from '../components/CreateBoardModal';
import EditBoardModal from '../components/EditBoardModal';
import api from '../services/api';
import Navbar from '../components/Navbar';
import PageContainer from '../components/ui/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const Dashboard = () => {
  const { user } = useAuth();
  const { boards, loading, error, fetchBoards, deleteBoard } = useBoards();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState(null);

  // Activities state
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const fetchWorkspaceActivities = async () => {
    setActivitiesLoading(true);
    try {
      const response = await api.get('/boards/activities/recent');
      setActivities(response.data);
    } catch (err) {
      console.error('Failed to fetch workspace activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleRefreshAll = () => {
    fetchBoards();
    fetchWorkspaceActivities();
  };

  useEffect(() => {
    fetchBoards();
    fetchWorkspaceActivities();
  }, [fetchBoards]);

  // Calculate unique collaborators across all boards (including owner and members)
  const getUniqueCollaborators = () => {
    const userMap = new Map();
    boards.forEach((board) => {
      if (board.ownerId) {
        userMap.set(board.ownerId._id || board.ownerId, board.ownerId);
      }
      board.members?.forEach((m) => {
        if (m.user) {
          userMap.set(m.user._id || m.user, m.user);
        }
      });
    });
    return Array.from(userMap.values());
  };

  const uniqueCollaborators = getUniqueCollaborators();
  const activeMembersCount = uniqueCollaborators.length;

  // Calculate stats
  const totalBoards = boards.length;
  let totalTasks = 0;
  let completedTasks = 0;
  const assignedTasks = [];

  boards.forEach((board) => {
    totalTasks += board.taskCount || 0;
    completedTasks += board.completedCount || 0;

    // Collect tasks assigned to current user
    if (board.cards && Array.isArray(board.cards)) {
      board.cards.forEach((card) => {
        const assigneeId = card.assignee?._id || card.assignee;
        if (assigneeId && assigneeId.toString() === user?._id?.toString()) {
          assignedTasks.push({
            ...card,
            boardTitle: board.title,
            boardId: board._id
          });
        }
      });
    }
  });

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleEditClick = (board) => {
    setBoardToEdit(board);
    setIsEditOpen(true);
  };

  const handleDeleteClick = async (boardId) => {
    if (window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      await deleteBoard(boardId);
      fetchWorkspaceActivities();
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHr / 24);

      if (isNaN(date.getTime())) return '';
      if (diffSec < 15) return 'just now';
      if (diffSec < 60) return `${diffSec}s ago`;
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHr < 24) return `${diffHr}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  const getColumnLabel = (colId) => {
    const map = {
      'todo': 'Todo',
      'in-progress': 'In Progress',
      'review': 'Review',
      'done': 'Done'
    };
    return map[colId] || colId;
  };

  return (
    <div className="min-h-screen bg-[#030712] text-textPrimary flex flex-col font-sans">
      <Navbar />

      <PageContainer className="flex-grow w-full flex flex-col py-6 sm:py-8">
        
        {/* Workspace Header */}
        <SectionHeader
          title="Workspace Overview"
          description="Cross-project tracking, member presence, and activity streams"
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefreshAll}
                className="p-2.5 rounded-lg border border-border bg-surface text-textSecondary hover:text-white hover:bg-[#1e293b]/40 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Refresh Workspace"
                disabled={loading || activitiesLoading}
              >
                <RefreshCw className={`h-4.5 w-4.5 ${(loading || activitiesLoading) ? 'animate-spin' : ''}`} />
              </button>
              <Button
                onClick={() => setIsCreateOpen(true)}
                variant="solid"
                size="md"
                icon={Plus}
              >
                <span>Create Board</span>
              </Button>
            </div>
          }
        />

        {/* 5-Column Stats Grid (Responsive: 1-col mobile, 2-col tablet, 5-col desktop) */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <StatCard label="Total Boards" value={totalBoards} icon={LayoutGrid} variant="primary" />
          <StatCard label="Total Tasks" value={totalTasks} icon={ClipboardList} variant="warning" />
          <StatCard label="Completed Tasks" value={completedTasks} icon={CheckSquare} variant="success" />
          <StatCard label="Completion Rate" value={`${completionRate}%`} icon={TrendingUp} variant="primary" />
          <StatCard label="Active Members" value={activeMembersCount} icon={Users} variant="neutral" />
        </div>

        {/* Workspace Panel Layout (Responsive: 1-col on mobile/tablet, 3-col on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Columns: Projects & Assigned Tasks */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Boards Grid */}
            <div>
              <div className="flex items-center justify-between mb-4 pl-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-primary" />
                  <span>Project Boards ({totalBoards})</span>
                </h3>
              </div>

              {loading && boards.length === 0 ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} variant="elevated" rounded="xl" className="p-6 h-52 flex flex-col justify-between">
                      <div className="space-y-3">
                        <Skeleton variant="text" width="w-1/3" height="h-5" />
                        <Skeleton variant="text" width="w-3/4" height="h-4" />
                        <Skeleton variant="text" width="w-1/2" height="h-4" />
                      </div>
                      <Skeleton variant="rectangular" width="w-full" height="h-8" />
                    </Card>
                  ))}
                </div>
              ) : boards.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {boards.map((board) => (
                    <BoardCard
                      key={board._id}
                      board={board}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No boards yet"
                  description="Create your first collaborative Kanban board to start managing tasks with your team in real time."
                  actionText="Create Board"
                  onActionClick={() => setIsCreateOpen(true)}
                  icon={LayoutGrid}
                />
              )}
            </div>

            {/* Assigned to Me Section */}
            <div>
              <div className="flex items-center justify-between mb-4 pl-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  <span>Assigned to me ({assignedTasks.length})</span>
                </h3>
              </div>

              {assignedTasks.length > 0 ? (
                <Card variant="default" rounded="lg" className="overflow-hidden bg-surface/30">
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                      <thead>
                        <tr className="border-b border-border bg-[#121624]/40 text-textSecondary font-bold">
                          <th className="p-4">Task Title</th>
                          <th className="p-4">Board</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Priority</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {assignedTasks.map((task) => (
                          <tr key={task._id} className="hover:bg-[#121624]/20 transition-colors text-slate-300">
                            <td className="p-4 font-semibold text-white max-w-[200px] truncate">{task.title}</td>
                            <td className="p-4 text-textSecondary">{task.boardTitle}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-background border border-border text-textSecondary capitalize">
                                {getColumnLabel(task.columnId)}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border capitalize ${
                                task.priority === 'high' 
                                  ? 'text-danger bg-danger/10 border-danger/15' 
                                  : task.priority === 'low'
                                  ? 'text-blue-400 bg-blue-500/10 border-blue-500/15'
                                  : 'text-warning bg-warning/10 border-warning/15'
                              }`}>
                                {task.priority}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <a 
                                href={`/boards/${task.boardId}`}
                                className="text-primary hover:text-indigo-400 font-bold inline-flex items-center gap-1 hover:underline min-h-[32px]"
                              >
                                <span>Go to Board</span>
                                <ArrowRight className="h-3 w-3" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-8 text-center bg-surface/10">
                  <UserCheck className="h-7 w-7 text-textSecondary/40 mx-auto mb-2.5" />
                  <p className="text-xs text-textSecondary font-medium">No tasks assigned to you in this workspace.</p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Collaborators & Workspace Activity */}
          <div className="space-y-8">
            
            {/* Active Collaborators Panel */}
            <Card variant="elevated" rounded="xl" className="p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400" />
                <span>Workspace Collaborators ({uniqueCollaborators.length})</span>
              </h3>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                {uniqueCollaborators.map((member) => (
                  <div key={member._id} className="flex items-center gap-3 border border-border/40 rounded-lg p-2 bg-background/30 hover:bg-[#121624]/20 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-650 text-white flex items-center justify-center text-[10px] font-bold uppercase ring-1 ring-border">
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">{member.name}</p>
                      <p className="text-[10px] text-textSecondary truncate">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Global Recent Activity Feed */}
            <Card variant="elevated" rounded="xl" className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  <span>Workspace Activity</span>
                </h3>
              </div>

              {activitiesLoading && activities.length === 0 ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-border flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 w-3/4 bg-border rounded" />
                        <div className="h-2 w-1/4 bg-border rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length > 0 ? (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                  {activities.map((act) => (
                    <div key={act._id} className="flex gap-3 text-[11px] text-textSecondary items-start border-l border-border pl-3 ml-2.5 relative">
                      <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary border border-background shadow-sm shadow-primary/20" />
                      <div className="flex-1 min-w-0">
                        <p className="leading-normal">
                          <span className="font-bold text-white">{act.user?.name || 'Someone'}</span>{' '}
                          {act.action === 'created' && 'created task'}{' '}
                          {act.action === 'updated' && 'updated'}{' '}
                          {act.action === 'deleted' && 'deleted task'}{' '}
                          {act.action === 'moved' && 'moved'}{' '}
                          {act.action === 'joined' && 'joined'}{' '}
                          {act.cardTitle && (
                            <span className="font-mono text-primary bg-primary/5 px-1 py-0.5 rounded border border-primary/10 font-medium">
                              "{act.cardTitle}"
                            </span>
                          )}
                          {act.action === 'moved' && act.details && (
                            <>
                              {' '}
                              from <span className="font-semibold text-gray-350">{getColumnLabel(act.details.fromCol)}</span> to{' '}
                              <span className="font-semibold text-gray-350">{getColumnLabel(act.details.toCol)}</span>
                            </>
                          )}
                          {act.action === 'joined' && ' board workspace'}
                        </p>
                        <span className="text-[9px] text-textSecondary/60 flex items-center gap-1 mt-1 font-medium">
                          <Clock className="h-2.5 w-2.5" />
                          {formatRelativeTime(act.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-textSecondary text-xs">
                  No activity logged in this workspace yet.
                </div>
              )}
            </Card>

          </div>

        </div>
      </PageContainer>

      {/* Footer */}
      <footer className="border-t border-border bg-[#02050c] py-6 text-center text-xs text-textSecondary mt-auto">
        <p>&copy; {new Date().getFullYear()} CollabBoard. Real-time collaborative workspace.</p>
      </footer>

      {/* Modals */}
      <CreateBoardModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditBoardModal
        isOpen={isEditOpen}
        board={boardToEdit}
        onClose={() => {
          setIsEditOpen(false);
          setBoardToEdit(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
