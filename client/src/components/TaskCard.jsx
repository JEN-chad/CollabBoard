import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { ArrowUp, AlertCircle, ArrowDown, User, Calendar } from 'lucide-react';
import Badge from './ui/Badge';
import Avatar from './ui/Avatar';

const TaskCard = ({ card, index, onEditClick }) => {
  // Priority indicator helper
  const renderPriority = () => {
    switch (card.priority) {
      case 'high':
        return (
          <Badge variant="danger" icon={ArrowUp}>
            High
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="neutral" icon={ArrowDown}>
            Low
          </Badge>
        );
      case 'medium':
      default:
        return (
          <Badge variant="warning" icon={AlertCircle}>
            Medium
          </Badge>
        );
    }
  };

  // Due date formatter
  const getDueDateInfo = () => {
    if (!card.dueDate) return null;
    const d = new Date(card.dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const isOverdue = d < now && card.columnId !== 'done';
    
    return {
      text: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      isOverdue
    };
  };

  const dueDateInfo = getDueDateInfo();

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEditClick(card)}
          className={`group relative rounded-xl border p-4 bg-surface/80 hover:bg-elevated transition-all duration-200 cursor-pointer shadow-sm select-none min-h-[110px] md:min-h-[44px]
            ${snapshot.isDragging
              ? 'border-primary/60 bg-elevated/90 shadow-xl ring-2 ring-primary/10'
              : 'border-border hover:border-gray-600'
            }`}
          id={`task-card-${card._id}`}
        >
          {/* Top Metadata Row: Priority & Version Tag */}
          <div className="flex items-center justify-between mb-2.5">
            {renderPriority()}
            <span 
              className="text-[9px] font-mono text-textSecondary bg-background px-2 py-0.5 rounded border border-border/60"
              title={`Card version: ${card.version}`}
            >
              v{card.version}
            </span>
          </div>

          {/* Card Title */}
          <h4 className="text-xs font-semibold text-white tracking-tight leading-snug group-hover:text-primary transition-colors">
            {card.title}
          </h4>

          {/* Description */}
          {card.description && (
            <p className="mt-1.5 text-[11px] text-textSecondary line-clamp-2 leading-relaxed">
              {card.description}
            </p>
          )}

          {/* Card Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
            {/* Due Date Indicator */}
            {dueDateInfo ? (
              <span className={`flex items-center gap-1.5 text-[10px] font-medium ${
                dueDateInfo.isOverdue ? 'text-danger bg-danger/10 px-2 py-0.5 rounded border border-danger/15' : 'text-textSecondary'
              }`}>
                <Calendar className="h-3 w-3" />
                <span>{dueDateInfo.text}</span>
              </span>
            ) : (
              <span className="text-[10px] text-textSecondary/50">No due date</span>
            )}

            {/* Assignee Avatar */}
            {card.assignee ? (
              <div className="relative" title={`Assigned to: ${card.assignee.name} (${card.assignee.email})`}>
                <Avatar name={card.assignee.name} size="sm" className="ring-1 ring-background" />
              </div>
            ) : (
              <div
                className="h-6 w-6 rounded-full bg-background text-textSecondary/40 flex items-center justify-center border border-border"
                title="Unassigned"
              >
                <User className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
