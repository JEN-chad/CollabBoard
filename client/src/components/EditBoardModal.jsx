import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Shield, ShieldCheck } from 'lucide-react';
import { useBoards } from '../hooks/useBoards';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Avatar from './ui/Avatar';

const EditBoardModal = ({ isOpen, board, onClose }) => {
  const { updateBoard } = useBoards();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Member invite inputs
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Editor');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [memberActionLoading, setMemberActionLoading] = useState(null); // stores user ID for action indicator

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync state with board prop
  useEffect(() => {
    if (board) {
      setTitle(board.title || '');
      setDescription(board.description || '');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [board, isOpen]);

  if (!isOpen || !board) return null;

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim()) {
      setErrorMsg('Board title is required');
      return;
    }

    setIsSubmitting(true);
    const result = await updateBoard(board._id, {
      title: title.trim(),
      description: description.trim()
    });
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg('Board details updated successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(result.error);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!inviteEmail.trim()) {
      setErrorMsg('Please enter an email address to invite');
      return;
    }

    setIsInviting(true);
    const result = await updateBoard(board._id, {
      inviteEmail: inviteEmail.trim(),
      inviteRole
    });
    setIsInviting(false);

    if (result.success) {
      setInviteEmail('');
      setSuccessMsg('Member invited successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(result.error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setErrorMsg('');
    setSuccessMsg('');
    setMemberActionLoading(userId);

    const result = await updateBoard(board._id, {
      updateUserId: userId,
      updateRole: newRole
    });
    setMemberActionLoading(null);

    if (result.success) {
      setSuccessMsg('Member role updated');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(result.error);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    setErrorMsg('');
    setSuccessMsg('');
    setMemberActionLoading(userId);

    const result = await updateBoard(board._id, {
      removeUserId: userId
    });
    setMemberActionLoading(null);

    if (result.success) {
      setSuccessMsg('Member removed');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Board Settings"
      size="lg"
    >
      {/* Messages */}
      {(errorMsg || successMsg) && (
        <div className="mb-4">
          {errorMsg && (
            <div className="rounded-lg bg-danger/10 border border-danger/30 p-3.5 text-xs font-medium text-danger animate-fade-in">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="rounded-lg bg-success/10 border border-success/30 p-3.5 text-xs font-medium text-success animate-fade-in">
              {successMsg}
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        {/* Section 1: Board Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-white border-b border-border/80 pb-2 uppercase tracking-wider">
            Board Details
          </h4>
          <form onSubmit={handleUpdateDetails} className="space-y-4">
            <Input
              label="Board Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary select-none">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-textPrimary placeholder-gray-600 outline-none transition-all duration-200 focus:border-primary/80 focus:ring-1 focus:ring-primary/20 resize-none disabled:opacity-50 min-h-[60px]"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                size="sm"
                className="min-h-[44px]"
              >
                Save Details
              </Button>
            </div>
          </form>
        </div>

        {/* Section 2: Invite Members */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold text-white border-b border-border/80 pb-2 uppercase tracking-wider">
            Invite Members
          </h4>
          <form onSubmit={handleInviteMember} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow">
              <Input
                type="email"
                placeholder="Invite user by email..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={isInviting}
              />
            </div>
            <div className="w-full sm:w-36">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-textPrimary focus:border-primary/80 focus:outline-none min-h-[44px] cursor-pointer"
                disabled={isInviting}
              >
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
            <Button
              type="submit"
              disabled={isInviting}
              loading={isInviting}
              icon={UserPlus}
              className="min-h-[44px]"
            >
              <span>Invite</span>
            </Button>
          </form>
        </div>

        {/* Section 3: Collaborators List */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold text-white border-b border-border/80 pb-2 uppercase tracking-wider">
            Collaborators ({board.members?.length + 1 || 1})
          </h4>
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {/* Owner */}
            <div className="flex items-center justify-between rounded-xl bg-[#161a27]/30 border border-border/40 p-3.5">
              <div className="flex items-center gap-3">
                <Avatar name={board.ownerId?.name} size="sm" />
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{board.ownerId?.name} (You)</p>
                  <p className="text-[10px] text-textSecondary mt-0.5">{board.ownerId?.email}</p>
                </div>
              </div>
              <Badge variant="primary" icon={ShieldCheck}>
                Owner
              </Badge>
            </div>

            {/* Members */}
            {board.members && board.members.map((member) => {
              const isUserLoading = memberActionLoading === member.user?._id;
              return (
                <div 
                  key={member.user?._id} 
                  className="flex items-center justify-between rounded-xl bg-background/20 border border-border/40 p-3.5 hover:bg-surface/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={member.user?.name} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{member.user?.name}</p>
                      <p className="text-[10px] text-textSecondary mt-0.5">{member.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isUserLoading ? (
                      <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                    ) : (
                      <>
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-textSecondary focus:border-primary/80 focus:outline-none min-h-[36px] cursor-pointer"
                        >
                          <option value="Editor">Editor</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                        <Button
                          onClick={() => handleRemoveMember(member.user._id)}
                          variant="ghost"
                          size="sm"
                          icon={UserMinus}
                          className="text-textSecondary hover:text-danger min-h-[36px] min-w-[36px] p-0"
                          title="Remove Member"
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditBoardModal;
