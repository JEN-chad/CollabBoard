import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import Badge from './ui/Badge';

const Column = ({ column, cards, userRole, onAddTaskClick, onEditCardClick }) => {
  const canModify = userRole !== 'Viewer';

  // Map column colors for borders
  const borderColors = {
    todo: 'border-t-slate-500',
    'in-progress': 'border-t-primary',
    review: 'border-t-purple-500',
    done: 'border-t-success',
  };

  const badgeVariants = {
    todo: 'neutral',
    'in-progress': 'primary',
    review: 'warning',
    done: 'success',
  };

  return (
    <div
      className={`rounded-xl border border-border bg-surface/20 border-t-4 ${borderColors[column.id] || 'border-t-border'} p-4 flex flex-col w-[85vw] sm:w-[320px] md:w-full shrink-0 snap-center h-[calc(100vh-270px)] md:h-full select-none`}
      id={`kanban-column-${column.id}`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-tight text-sm">
            {column.title}
          </span>
          <Badge variant={badgeVariants[column.id] || 'neutral'}>
            {cards.length}
          </Badge>
        </div>
        
        {canModify && (
          <button
            onClick={() => onAddTaskClick(column.id)}
            className="p-1.5 rounded-lg text-textSecondary hover:text-white hover:bg-elevated transition-colors border border-transparent hover:border-border min-h-[32px] min-w-[32px] flex items-center justify-center"
            title={`Add task to ${column.title}`}
            id={`add-task-btn-${column.id}`}
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Droppable Card Container */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto space-y-3 rounded-lg p-1 transition-colors duration-200 min-h-[150px] scrollbar-thin ${
              snapshot.isDraggingOver ? 'bg-primary/5' : 'bg-transparent'
            }`}
          >
            {cards.length > 0 ? (
              cards.map((card, index) => (
                <TaskCard
                  key={card._id}
                  card={card}
                  index={index}
                  onEditClick={onEditCardClick}
                />
              ))
            ) : (
              // Empty Column Placeholder
              <div className="h-full flex flex-col justify-center items-center rounded-xl border-2 border-dashed border-border/50 p-6 text-center select-none py-12 bg-background/10">
                <p className="text-xs text-textSecondary max-w-[150px]">
                  No tasks. Click + to add.
                </p>
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
