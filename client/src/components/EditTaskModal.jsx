import React, { useState, useEffect } from 'react';
import { Trash2, AlertOctagon, RefreshCw } from 'lucide-react';
import { useBoards } from '../hooks/useBoards';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';

const EditTaskModal = ({ isOpen, onClose, card }) => {
  const { currentBoard, updateCardDetails, removeCard } = useBoards();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Conflict handling states
  const [conflictDetected, setConflictDetected] = useState(false);
  const [serverCardState, setServerCardState] = useState(null);

  // Initialize fields on open
  useEffect(() => {
    if (isOpen && card) {
      setTitle(card.title || '');
      setDescription(card.description || '');
      setPriority(card.priority || 'medium');
      setAssignee(card.assignee?._id || card.assignee || '');
      
      let formattedDate = '';
      if (card.dueDate) {
        formattedDate = new Date(card.dueDate).toISOString().split('T')[0];
      }
      setDueDate(formattedDate);
      
      setFormError('');
      setConflictDetected(false);
      setServerCardState(null);
    }
  }, [isOpen, card]);

  if (!isOpen || !card) return null;

  // Gather board members
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

  const handleUpdate = async (e, forceOverwriteVersion = null) => {
    if (e) e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Task title is required');
      return;
    }

    setIsSubmitting(true);
    
    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee: assignee || null,
      dueDate: dueDate || null,
    };

    if (forceOverwriteVersion !== null) {
      payload.version = forceOverwriteVersion;
    }

    const result = await updateCardDetails(card._id, payload);
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else if (result.conflict) {
      setConflictDetected(true);
      setServerCardState(result.latestCard);
      setFormError('Conflict Detected: This card has been updated by another user.');
    } else {
      setFormError(result.error || 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      const result = await removeCard(card._id);
      setIsDeleting(false);

      if (result.success) {
        onClose();
      } else {
        setFormError(result.error || 'Failed to delete task');
      }
    }
  };

  const handleSyncWithServer = () => {
    if (serverCardState) {
      setTitle(serverCardState.title || '');
      setDescription(serverCardState.description || '');
      setPriority(serverCardState.priority || 'medium');
      setAssignee(serverCardState.assignee?._id || serverCardState.assignee || '');
      
      let formattedDate = '';
      if (serverCardState.dueDate) {
        formattedDate = new Date(serverCardState.dueDate).toISOString().split('T')[0];
      }
      setDueDate(formattedDate);
      
      setConflictDetected(false);
      setFormError('');
      setServerCardState(null);
    }
  };

  const handleOverwrite = () => {
    if (serverCardState) {
      handleUpdate(null, serverCardState.version);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Task Details"
      size="sm"
    >
      <div className="text-[10px] text-textSecondary uppercase tracking-wider pl-1 mb-4 select-none">
        Task ID: <span className="font-mono text-[9px] text-[#9fbafd]/75">{card._id}</span> • Version: <span className="font-semibold text-primary">v{card.version}</span>
      </div>

      {/* Conflict UI Banner */}
      {conflictDetected && serverCardState && (
        <div className="mb-5 rounded-xl border border-warning/30 bg-warning/10 p-4 text-xs text-warning animate-fade-in">
          <div className="flex items-start gap-2.5">
            <AlertOctagon className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white">Simultaneous Edit Conflict</h4>
              <p className="text-[11px] text-textSecondary mt-1 leading-relaxed">
                Another user has edited this task. Database version is now <strong className="text-white">v{serverCardState.version}</strong> (your version is <strong className="text-white">v{card.version}</strong>).
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2.5">
                <Button
                  onClick={handleSyncWithServer}
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                  className="min-h-[36px]"
                >
                  <span>Sync & Review</span>
                </Button>
                <Button
                  onClick={handleOverwrite}
                  variant="danger"
                  size="sm"
                  className="min-h-[36px]"
                >
                  Force Overwrite
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={(e) => handleUpdate(e)} className="space-y-4">
        {formError && !conflictDetected && (
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
          disabled={isSubmitting || conflictDetected}
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
            className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-textPrimary placeholder-gray-600 outline-none transition-all duration-200 resize-none disabled:opacity-50 min-h-[80px]
              ${conflictDetected ? 'border-warning focus:border-warning/80 focus:ring-1 focus:ring-warning/20' : 'border-border focus:border-primary/80 focus:ring-1 focus:ring-primary/20'}`}
            disabled={isSubmitting || conflictDetected}
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
              disabled={isSubmitting || conflictDetected}
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
              disabled={isSubmitting || conflictDetected}
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
          disabled={isSubmitting || conflictDetected}
        />

        <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
          {/* Delete button */}
          <Button
            type="button"
            onClick={handleDelete}
            variant="danger"
            size="sm"
            icon={Trash2}
            className="min-h-[44px]"
            disabled={isDeleting || isSubmitting}
            id="delete-task-btn"
          >
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isDeleting || conflictDetected}
              loading={isSubmitting}
              className="min-h-[44px]"
              id="submit-edit-task-btn"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditTaskModal;
