import React, { useState, useEffect } from 'react';
import { useBoards } from '../hooks/useBoards';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';

const CreateTaskModal = ({ isOpen, onClose, columnId }) => {
  const { currentBoard, addCard } = useBoards();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Reset fields when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAssignee('');
      setDueDate('');
      setFormError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Gather possible assignees: Board Owner and members
  const getAssignees = () => {
    if (!currentBoard) return [];
    const list = [];
    if (currentBoard.ownerId) {
      list.push({
        _id: currentBoard.ownerId._id || currentBoard.ownerId,
        name: currentBoard.ownerId.name || 'Owner',
        email: currentBoard.ownerId.email || '',
        role: 'Owner'
      });
    }
    currentBoard.members?.forEach(member => {
      if (member.user) {
        list.push({
          _id: member.user._id || member.user,
          name: member.user.name || 'Member',
          email: member.user.email || '',
          role: member.role
        });
      }
    });
    return list;
  };

  const assigneesList = getAssignees();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Task title is required');
      return;
    }

    setIsSubmitting(true);
    const result = await addCard({
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee: assignee || null,
      dueDate: dueDate || null,
      boardId: currentBoard._id,
      columnId,
    });
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setFormError(result.error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Create New Task (${columnId.replace('-', ' ')})`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="rounded-lg bg-danger/10 border border-danger/30 p-3.5 text-xs font-medium text-danger animate-fade-in">
            {formError}
          </div>
        )}

        <Input
          label="Task Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Design database schema"
          disabled={isSubmitting}
          autoFocus
        />

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary select-none">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide a detailed description of the work needed"
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-textPrimary placeholder-gray-600 outline-none transition-all duration-200 focus:border-primary/80 focus:ring-1 focus:ring-primary/20 resize-none disabled:opacity-50 min-h-[80px]"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary select-none">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-textPrimary focus:border-primary/80 focus:outline-none min-h-[44px] cursor-pointer"
              disabled={isSubmitting}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary select-none">
              Assignee
            </label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-textPrimary focus:border-primary/80 focus:outline-none min-h-[44px] cursor-pointer"
              disabled={isSubmitting}
            >
              <option value="">Unassigned</option>
              {assigneesList.map((person) => (
                <option key={person._id} value={person._id}>
                  {person.name} ({person.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={isSubmitting}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            className="min-h-[44px]"
            id="submit-create-task-btn"
          >
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
