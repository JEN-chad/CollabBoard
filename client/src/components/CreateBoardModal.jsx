import React, { useState } from 'react';
import { useBoards } from '../hooks/useBoards';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';

const CreateBoardModal = ({ isOpen, onClose }) => {
  const { createBoard } = useBoards();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Board title is required');
      return;
    }

    setIsSubmitting(true);
    const result = await createBoard({
      title: title.trim(),
      description: description.trim(),
    });
    setIsSubmitting(false);

    if (result.success) {
      setTitle('');
      setDescription('');
      onClose();
    } else {
      setFormError(result.error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Board"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="rounded-lg bg-danger/10 border border-danger/30 p-3 text-xs font-medium text-danger animate-fade-in">
            {formError}
          </div>
        )}

        <Input
          label="Board Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Q3 Project Board, Launch Sync"
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
            placeholder="Provide a brief description of what this board is for"
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-textPrimary placeholder-gray-600 outline-none transition-all duration-200 focus:border-primary/80 focus:ring-1 focus:ring-primary/20 resize-none disabled:opacity-50 min-h-[80px]"
            disabled={isSubmitting}
          />
        </div>

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
          >
            Create Board
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateBoardModal;
