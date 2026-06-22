import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Trash2, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Card from './ui/Card';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';

const BoardCard = ({ board, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isOwner = board.ownerId?._id === user?._id || board.ownerId === user?._id;
  const ownerName = board.ownerId?.name || 'Unknown';

  const handleCardClick = () => {
    navigate(`/boards/${board._id}`);
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
      if (diffDays === 1) return 'yesterday';
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  const taskCount = board.taskCount || 0;
  const completedCount = board.completedCount || 0;
  const completionPercentage = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  // Compile list of unique collaborators to show in avatars
  const collaborators = [];
  if (board.ownerId) {
    collaborators.push({
      _id: board.ownerId._id || board.ownerId,
      name: board.ownerId.name,
      email: board.ownerId.email,
      isOwner: true,
    });
  }
  board.members?.forEach(m => {
    if (m.user && m.user._id !== board.ownerId?._id) {
      collaborators.push({
        _id: m.user._id,
        name: m.user.name,
        email: m.user.email,
        isOwner: false,
      });
    }
  });

  return (
    <Card 
      onClick={handleCardClick}
      variant="glass"
      rounded="xl"
      hover={true}
      className="p-6 flex flex-col justify-between min-h-[220px] cursor-pointer"
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 
            className="text-base font-bold text-white tracking-tight group-hover:text-primary transition-colors line-clamp-1 flex-1"
          >
            {board.title}
          </h3>
          <div className="flex items-center gap-2">
            {isOwner && (
              <Badge variant="primary" icon={Shield}>
                Owner
              </Badge>
            )}
            
            {/* Quick settings/edit buttons */}
            {isOwner && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(board);
                  }}
                  className="p-1.5 rounded-lg bg-surface text-textSecondary hover:text-white hover:bg-elevated transition-colors border border-border min-h-[28px] min-w-[28px] flex items-center justify-center"
                  title="Edit Board"
                >
                  <Edit3 className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(board._id);
                  }}
                  className="p-1.5 rounded-lg bg-danger/10 text-danger hover:text-red-300 hover:bg-danger/20 transition-colors border border-danger/15 min-h-[28px] min-w-[28px] flex items-center justify-center"
                  title="Delete Board"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Board Description */}
        <p className="text-xs text-textSecondary line-clamp-2 mb-4 leading-relaxed">
          {board.description || 'No description provided.'}
        </p>

        {/* Board Progress Bar */}
        <div className="space-y-1.5 mt-4">
          <div className="flex items-center justify-between text-[11px] text-textSecondary">
            <span className="font-semibold text-slate-300">{taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}</span>
            <span>{completedCount} Completed ({completionPercentage})</span>
          </div>
          <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border/40">
            <div 
              className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="border-t border-border/50 pt-4 flex items-center justify-between mt-5">
        {/* Members Avatars Stack */}
        <div className="flex -space-x-1.5 overflow-hidden">
          {collaborators.slice(0, 4).map((collab) => (
            <div key={collab._id} className="relative group hover:translate-y-[-2px] transition-transform">
              <Avatar name={collab.name} size="sm" className="ring-2 ring-background" />
            </div>
          ))}
          {collaborators.length > 4 && (
            <div
              className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-elevated text-textSecondary flex items-center justify-center text-[9px] font-bold select-none"
              title={`${collaborators.length - 4} more`}
            >
              +{collaborators.length - 4}
            </div>
          )}
        </div>

        {/* Updated timestamp */}
        <span className="text-[10px] text-textSecondary font-medium">
          Updated {formatRelativeTime(board.lastUpdated || board.updatedAt)}
        </span>
      </div>
    </Card>
  );
};

export default BoardCard;
