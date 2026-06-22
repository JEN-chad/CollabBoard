import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useOptimisticCards } from '../hooks/useOptimisticCards';
import Column from './Column';

const KanbanBoard = ({ cards = [], userRole, onAddTaskClick, onEditCardClick, onConflict }) => {
  const { moveCardOptimistic } = useOptimisticCards(onConflict);

  const columns = [
    { id: 'todo', title: 'Todo' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' },
  ];

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Invalid drop
    if (!destination) return;

    // No position change
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Viewer cannot drag cards
    if (userRole === 'Viewer') {
      onConflict('Access Denied: Viewers cannot move task cards.');
      return;
    }

    // Optimistically update positions and columns
    const response = await moveCardOptimistic(
      draggableId,
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );

    if (response && response.conflict) {
      onConflict(
        `Conflict: This task was moved or modified by another session. Board has been synced to the latest database state.`
      );
    } else if (response && !response.success) {
      onConflict(response.error || 'An error occurred while moving the task.');
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div 
        className="flex flex-row overflow-x-auto snap-x snap-mandatory md:snap-none md:grid md:grid-cols-4 gap-6 items-stretch h-full pb-4 scrollbar-thin select-none"
        id="kanban-board-wrapper"
        style={{
          WebkitOverflowScrolling: 'touch', // Fluid touch scrolling on iOS
        }}
      >
        {columns.map((column) => {
          // Filter and sort cards for this specific column
          const columnCards = cards
            .filter((c) => c.columnId === column.id)
            .sort((a, b) => a.position - b.position);

          return (
            <Column
              key={column.id}
              column={column}
              cards={columnCards}
              userRole={userRole}
              onAddTaskClick={onAddTaskClick}
              onEditCardClick={onEditCardClick}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
