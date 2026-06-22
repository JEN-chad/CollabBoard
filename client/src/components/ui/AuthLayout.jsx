import React from 'react';

const AuthLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen flex bg-background text-textPrimary overflow-hidden font-sans">
      
      {/* Left Branding Side (Desktop & Tablet only) */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%] bg-[#080d1a] border-r border-border relative flex-col justify-between p-8 lg:p-12 overflow-hidden select-none">
        
        {/* Subtle Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] h-[350px] w-[350px] rounded-full bg-primary/10 blur-[80px]"></div>
        <div className="absolute bottom-[10%] right-[-10%] h-[350px] w-[350px] rounded-full bg-purple-500/10 blur-[80px]"></div>
        
        {/* Logo / Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-purple-650 text-white shadow-md shadow-primary/20">
            <svg
              className="h-5 w-5"
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
          <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-350">
            CollabBoard
          </span>
        </div>

        {/* Content & Taglines */}
        <div className="relative z-10 my-auto py-12 max-w-md">
          <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight text-white tracking-tight">
            Real-time collaboration for <span className="text-gradient">modern teams</span>.
          </h1>
          <p className="mt-4 text-sm text-textSecondary leading-relaxed">
            Plan, track, and deliver projects with confidence. Make collaboration instant, conflict-free, and delightful.
          </p>

          {/* Features list */}
          <div className="mt-8 space-y-3.5">
            {[
              'Real-time collaboration',
              'Conflict resolution & synchronization',
              'Team member management',
              'Live activity tracking',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs font-semibold text-slate-350">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/10 text-success border border-success/15 shrink-0">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Mini Mockup Preview */}
          <div className="mt-12 relative animate-fade-in duration-500">
            <div className="absolute inset-0 bg-primary/5 blur-[50px] rounded-full"></div>
            <div className="relative rounded-2xl border border-border bg-surface/80 p-4 shadow-2xl backdrop-blur-sm scale-95 border-primary/10 max-w-sm">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-danger/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-success/70" />
                  <span className="text-[10px] text-textSecondary font-bold ml-2">CollabBoard Workspace</span>
                </div>
                <div className="flex -space-x-1 overflow-hidden">
                  <div className="h-4.5 w-4.5 rounded-full bg-primary text-[8px] font-bold text-white flex items-center justify-center">J</div>
                  <div className="h-4.5 w-4.5 rounded-full bg-purple-500 text-[8px] font-bold text-white flex items-center justify-center ring-1 ring-surface">A</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-background/40 p-2 rounded-lg border border-border">
                  <div className="h-1.5 w-8 bg-textSecondary/20 rounded mb-3" />
                  <div className="bg-surface p-1.5 rounded-md border border-border mb-2 shadow-sm">
                    <div className="h-1.5 w-10 bg-primary/20 rounded mb-1.5" />
                    <div className="h-1.5 w-14 bg-textSecondary/35 rounded" />
                  </div>
                  <div className="bg-surface p-1.5 rounded-md border border-border shadow-sm">
                    <div className="h-1.5 w-8 bg-success/20 rounded mb-1.5" />
                    <div className="h-1.5 w-12 bg-textSecondary/35 rounded" />
                  </div>
                </div>
                <div className="bg-background/40 p-2 rounded-lg border border-border">
                  <div className="h-1.5 w-10 bg-textSecondary/20 rounded mb-3" />
                  <div className="bg-surface p-1.5 rounded-md border border-border shadow-sm">
                    <div className="h-1.5 w-8 bg-warning/20 rounded mb-1.5" />
                    <div className="h-1.5 w-16 bg-textSecondary/35 rounded" />
                  </div>
                </div>
                <div className="bg-background/40 p-2 rounded-lg border border-border">
                  <div className="h-1.5 w-6 bg-textSecondary/20 rounded mb-3" />
                  <div className="bg-surface p-1.5 rounded-md border border-border shadow-sm opacity-50">
                    <div className="h-1.5 w-14 bg-textSecondary/35 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-textSecondary/80">
          &copy; {new Date().getFullYear()} CollabBoard Inc. All rights reserved.
        </div>
      </div>

      {/* Right Form Card Side */}
      <div className="w-full md:w-[55%] lg:w-[50%] flex items-center justify-center p-6 md:p-10 lg:p-14 relative overflow-y-auto">
        {/* Background Gradients for Mobile viewports */}
        <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[90px] md:hidden"></div>
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[90px] md:hidden"></div>
        
        <div className="w-full max-w-md relative z-10 flex flex-col items-center">
          
          {/* Logo above form for mobile viewports only */}
          <div className="flex md:hidden flex-col items-center mb-8 select-none">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-purple-650 text-white shadow-md shadow-primary/20">
              <svg
                className="h-5.5 w-5.5"
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
            <span className="mt-3 text-lg font-bold tracking-tight text-white">
              CollabBoard
            </span>
          </div>

          {/* Children: Login or Register form components */}
          {children}

        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
