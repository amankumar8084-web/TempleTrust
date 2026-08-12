import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar.jsx';
import { Menu } from 'lucide-react';

const AdminPageLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 font-spiritual">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — desktop fixed, mobile drawer */}
            <div
                className={`
          fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:z-auto md:flex md:flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <AdminSidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Top Bar */}
                <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-20 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition"
                        aria-label="Open sidebar"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-gray-800 dark:text-white tracking-wide">BrahamBaba</span>
                        <span className="text-[9px] bg-saffron-600 text-white font-bold px-1.5 py-0.5 rounded uppercase">Admin</span>
                    </div>
                </div>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-4 md:p-8 space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminPageLayout;
