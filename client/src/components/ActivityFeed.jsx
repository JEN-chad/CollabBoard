import React, { useEffect, useState } from 'react';
import { Users, PlusCircle, Edit, Trash2, ArrowRightLeft, History, X } from 'lucide-react';
import api from '../services/api';
import socket from '../socket';

const formatRelativeTime = (dateString) => {
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
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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

const ActivityFeed = ({ boardId, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/boards/${boardId}/activities`);
        setActivities(response.data);
      } catch (err) {
        console.error('Failed to fetch board activities:', err);
        setError('Failed to load activity log');
      } finally {
        setLoading(false);
      }
    };

    if (boardId) {
      fetchActivities();
    }

    // Connect socket listener for real-time updates
    const handleNewActivity = (activity) => {
      if (activity && activity.boardId === boardId) {
        setActivities((prev) => {
          // Prevent duplicates if already fetched/added
          if (prev.some((a) => a._id === activity._id)) return prev;
          return [activity, ...prev];
        });
      }
    };

    socket.on('activity:new', handleNewActivity);

    return () => {
      socket.off('activity:new', handleNewActivity);
    };
  }, [boardId]);

  const renderActivityText = (act) => {
    const userName = <span className="font-bold text-white text-xs">{act.user?.name || 'Someone'}</span>;
    const cardTitle = <span className="text-brand-400 font-semibold text-xs font-mono bg-brand-500/5 px-1.5 py-0.5 rounded border border-brand-500/10">"{act.cardTitle}"</span>;

    switch (act.action) {
      case 'joined':
        return <span>{userName} joined the board workspace</span>;
      case 'created':
        return <span>{userName} created task {cardTitle}</span>;
      case 'updated':
        return <span>{userName} updated details of {cardTitle}</span>;
      case 'deleted':
        return <span>{userName} deleted task {cardTitle}</span>;
      case 'moved':
        const from = getColumnLabel(act.details?.fromCol);
        const to = getColumnLabel(act.details?.toCol);
        return (
          <span>
            {userName} moved {cardTitle} from <span className="text-gray-300 font-semibold">{from}</span> to <span className="text-gray-300 font-semibold">{to}</span>
          </span>
        );
      default:
        return <span>{userName} performed an action</span>;
    }
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case 'joined':
        return { icon: Users, classes: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
      case 'created':
        return { icon: PlusCircle, classes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
      case 'updated':
        return { icon: Edit, classes: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
      case 'deleted':
        return { icon: Trash2, classes: 'bg-red-500/10 text-red-400 border border-red-500/20' };
      case 'moved':
        return { icon: ArrowRightLeft, classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
      default:
        return { icon: History, classes: 'bg-gray-500/10 text-gray-400 border border-gray-500/20' };
    }
  };

  return (
    <div className="w-80 md:w-90 border-l border-gray-800/80 bg-[#10141f]/95 backdrop-blur-md flex flex-col h-full flex-shrink-0 animate-slide-left z-20 shadow-2xl">
      {/* Sidebar Header */}
      <div className="px-4 py-4 border-b border-gray-800/80 flex items-center justify-between bg-[#131724]/40">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-brand-400" />
          <h3 className="font-bold text-white tracking-tight text-sm uppercase">Activity Feed</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Sidebar Body */}
      <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-thin">
        {loading ? (
          /* Pulse Skeleton Loader */
          <div className="flex flex-col gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-7 w-7 rounded-full bg-gray-800 flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 w-3/4 bg-gray-800 rounded" />
                  <div className="h-2.5 w-1/4 bg-gray-850 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-400 text-xs font-semibold">{error}</div>
        ) : activities.length > 0 ? (
          <div className="flex flex-col gap-5 border-l border-gray-800/60 ml-3.5 pl-5 relative">
            {activities.map((act) => {
              const { icon: Icon, classes } = getActivityIcon(act.action);
              return (
                <div key={act._id} className="relative group flex gap-3 text-xs text-gray-400">
                  {/* Bullet Node Icon */}
                  <div className={`absolute -left-[30px] top-0 h-6 w-6 rounded-full flex items-center justify-center ${classes}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="leading-relaxed break-words pr-2">{renderActivityText(act)}</p>
                    <span className="text-[10px] text-gray-500 font-medium mt-1 block">
                      {formatRelativeTime(act.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-12 w-12 rounded-full bg-gray-800/40 border border-gray-800 flex items-center justify-center text-gray-500 mb-4">
              <History className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-gray-300">No activity logged</h4>
            <p className="text-[11px] text-gray-500 mt-2 max-w-[180px]">
              Collaboration activity will stream here in real-time as tasks are created or moved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
