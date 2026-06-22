import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBoards } from '../hooks/useBoards';
import { Menu, X, LayoutGrid, LogOut, User, FolderKanban } from 'lucide-react';
import Avatar from './ui/Avatar';
import Button from './ui/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { boards, fetchBoards } = useBoards();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch boards if not already loaded (e.g. if arriving directly on details page)
  useEffect(() => {
    if (boards.length === 0) {
      fetchBoards();
    }
  }, [boards.length, fetchBoards]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="border-b border-border bg-[#0c101b]/60 backdrop-blur-md sticky top-0 z-40 w-full">
      <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo & Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity select-none">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-purple-650 text-white shadow-md shadow-primary/10">
              <svg
                className="h-4.5 w-4.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
                <line x1="3" y1="9" x2="21" y2="9" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-white">CollabBoard</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-textSecondary">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                isActive('/') 
                  ? 'text-white bg-[#1e293b]/45 border border-border' 
                  : 'hover:text-white border border-transparent'
              }`}
            >
              Dashboard
            </Link>
          </nav>
        </div>

        {/* Desktop User Menu */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs select-none">
            <Avatar name={user?.name} size="sm" />
            <span className="text-textSecondary font-semibold">{user?.name}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            icon={LogOut}
            className="text-textSecondary hover:text-danger min-h-[36px]"
          >
            <span>Log Out</span>
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg border border-border bg-[#0c101b] text-textSecondary hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Slide Panel) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop overlay */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in" 
            onClick={() => setIsOpen(false)}
          />

          {/* Sliding panel content */}
          <div className="relative w-full max-w-xs bg-surface border-l border-border h-full flex flex-col p-6 shadow-2xl z-10 animate-slide-left justify-between">
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-purple-650 text-white">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                      <line x1="15" y1="3" x2="15" y2="21" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-white">CollabBoard</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-textSecondary hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Profile Info section */}
              <div className="flex items-center gap-3 border border-border rounded-xl p-3 bg-[#090d16]/30 mb-6">
                <Avatar name={user?.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-textSecondary truncate mt-0.5">{user?.email}</p>
                </div>
              </div>

              {/* Drawer Links */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-textSecondary uppercase tracking-wider pl-2 mb-2">
                  Navigation
                </h4>
                <Link
                  to="/"
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive('/') 
                      ? 'text-white bg-primary/10 border border-primary/20' 
                      : 'text-textSecondary hover:text-white hover:bg-surface border border-transparent'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4 text-primary" />
                  <span>Dashboard</span>
                </Link>

                {/* Boards quick-access list */}
                <div className="pt-6">
                  <div className="flex items-center justify-between pl-2 mb-2">
                    <h4 className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">
                      My Project Boards
                    </h4>
                    <span className="text-[9px] font-bold bg-[#1e293b] text-textSecondary px-1.5 py-0.5 rounded-full border border-border">
                      {boards.length}
                    </span>
                  </div>
                  <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                    {boards.map((b) => (
                      <Link
                        key={b._id}
                        to={`/boards/${b._id}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all truncate ${
                          isActive(`/boards/${b._id}`)
                            ? 'text-white bg-[#1e293b] border border-border'
                            : 'text-textSecondary hover:text-white hover:bg-surface border border-transparent'
                        }`}
                      >
                        <FolderKanban className="h-3.5 w-3.5 text-textSecondary shrink-0" />
                        <span className="truncate">{b.title}</span>
                      </Link>
                    ))}
                    {boards.length === 0 && (
                      <p className="text-[11px] text-textSecondary/70 italic pl-2 py-1">
                        No boards created.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Logout button at bottom of drawer */}
            <div className="border-t border-border pt-4">
              <Button
                variant="danger"
                fullWidth
                onClick={handleLogout}
                icon={LogOut}
                className="text-xs min-h-[44px]"
              >
                Log Out
              </Button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
