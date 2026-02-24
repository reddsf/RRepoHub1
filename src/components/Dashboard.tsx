import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import { Link2, Plus, LogOut, Copy, Check, Users, Activity, AlertTriangle, Trash2, ExternalLink, Github } from 'lucide-react';
import { clsx } from 'clsx';

interface LinkItem {
  id: string;
  name: string;
  url: string;
  date: string;
}

interface DashboardProps {
  isAdmin: boolean;
  onLogout: () => void;
}

export default function Dashboard({ isAdmin, onLogout }: DashboardProps) {
  const { t, language } = useLanguage();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminPasskey, setAdminPasskey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [adding, setAdding] = useState(false);

  const [activeUsers, setActiveUsers] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    fetchData();
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    if (isAdmin) {
      fetchPasskey();
    }
    return () => clearInterval(interval);
  }, [isAdmin]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setActiveUsers(data.activeUsers);
        setLastUpdated(new Date(data.lastUpdated).toLocaleTimeString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data/links');
      if (res.ok) setLinks(await res.json());
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPasskey = async () => {
    try {
      const res = await fetch('/api/admin/passkey');
      if (res.ok) {
        const data = await res.json();
        setAdminPasskey(data.passkey);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrl) return;

    setAdding(true);
    try {
      const res = await fetch('/api/data/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, url: newUrl }),
      });
      
      if (res.ok) {
        setNewName('');
        setNewUrl('');
        fetchData();
      } else {
        alert('Failed to add link');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    try {
      const res = await fetch(`/api/data/links/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = async () => {
    if (adminPasskey) {
      try {
        await navigator.clipboard.writeText(adminPasskey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Copy failed', err);
        alert('Clipboard access denied. Please copy manually.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5] font-mono selection:bg-white selection:text-black relative overflow-hidden">
      {/* Grid Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20 z-0" />

      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white flex items-center justify-center">
              <span className="font-bold text-black text-xs">R</span>
            </div>
            <span className="font-bold tracking-tighter uppercase text-sm">RRepoHub</span>
          </div>
          
          <div className="flex items-center gap-6">
            {isAdmin && (
              <span className="text-[10px] uppercase tracking-widest text-[#666] border border-[#333] px-2 py-1">
                ADMIN_MODE
              </span>
            )}
            <button 
              onClick={onLogout}
              className="text-xs uppercase tracking-widest hover:text-white text-[#666] transition-colors flex items-center gap-2"
            >
              {t('logout')} <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        
        {/* Repo Stats Bar */}
        <div className="flex flex-wrap gap-6 mb-8 border-b border-[#1a1a1a] pb-6 text-[10px] uppercase tracking-widest text-[#666] font-mono">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span>REPO_STATUS: ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={12} />
            <span>ACTIVE_USERS: {activeUsers}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={12} />
            <span>LAST_SYNC: {lastUpdated}</span>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mb-12 border border-red-900/20 bg-red-900/5 p-4 text-[10px] text-red-500/80 uppercase tracking-wide font-mono">
          <strong className="block mb-1 text-red-500 flex items-center gap-2">
            <AlertTriangle size={12} /> {t('disclaimerTitle')}
          </strong>
          {t('disclaimerText')}
        </div>
        
        {/* Admin Panel */}
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 border border-[#333] bg-[#0a0a0a]/90 backdrop-blur-sm p-6"
          >
            <h2 className="text-xs font-bold uppercase tracking-widest mb-6 text-[#888] flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {t('adminPanel')}
            </h2>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Passkey Section */}
              <div className="flex-1 w-full">
                <label className="text-[10px] uppercase tracking-widest text-[#666] block mb-2">
                  {t('currentPasskey')}
                </label>
                <div className="flex gap-4">
                  <div className="bg-black border border-[#333] px-4 py-3 text-xl tracking-[0.5em] font-mono min-w-[200px] text-center select-all">
                    {adminPasskey || '......'}
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="border border-[#333] hover:bg-[#222] px-4 transition-colors flex items-center justify-center"
                    title="Copy"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-[#444] mt-2 uppercase tracking-widest">
                  * Universal Access Key
                </p>
              </div>

              {/* Add Link Section */}
              <div className="flex-1 w-full">
                 <label className="text-[10px] uppercase tracking-widest text-[#666] block mb-2">
                  {t('upload')}
                </label>
                <form onSubmit={handleAddLink} className="space-y-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={t('namePlaceholder')}
                    className="w-full bg-[#111] border border-[#333] px-4 py-2 text-sm focus:outline-none focus:border-white transition-colors"
                  />
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder={t('urlPlaceholder')}
                    className="w-full bg-[#111] border border-[#333] px-4 py-2 text-sm focus:outline-none focus:border-white transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={adding || !newName || !newUrl}
                    className="w-full bg-white text-black py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#ccc] transition-colors flex items-center justify-center gap-2"
                  >
                    {adding ? 'ADDING...' : <><Plus size={14} /> {t('addLink')}</>}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}

        {/* Links List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6 border-b border-[#1a1a1a] pb-4">
            <h2 className="text-xl font-bold uppercase tracking-tighter">
              {t('manifests')}
            </h2>
            <span className="text-[10px] font-mono text-[#444]">
              TOTAL: {links.length}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-[#333] text-xs uppercase tracking-widest animate-pulse">
              Loading Data...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {links.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-[#222] text-[#444] text-xs uppercase tracking-widest">
                  Repository Empty
                </div>
              ) : (
                links.map((link) => (
                  <div key={link.id} className="group border border-[#222] bg-[#0a0a0a]/80 backdrop-blur-sm p-4 hover:border-[#444] transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-10 h-10 bg-[#111] flex items-center justify-center border border-[#222]">
                        {link.url.includes('github') ? <Github size={20} className="text-white" /> : <Link2 size={20} className="text-[#666]" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-mono text-sm text-[#e5e5e5] truncate group-hover:text-white transition-colors">
                          {link.name}
                        </div>
                        <div className="text-[10px] text-[#444] mt-0.5 uppercase tracking-widest truncate">
                          {link.url}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#111] border border-[#333] text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center gap-2"
                      >
                        {t('open')} <ExternalLink size={12} />
                      </a>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-2 text-red-500 hover:bg-red-900/20 border border-transparent hover:border-red-900/30 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] mt-auto py-8 bg-[#050505] relative z-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-[10px] font-mono text-[#444] uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              SYSTEM_READY
            </span>
            <span>NODE: RREPO-01</span>
          </div>
          <div className="mt-2 md:mt-0 flex flex-col md:flex-row items-end md:items-center gap-4">
            <span>RRepoHub &copy; {new Date().getFullYear()}</span>
            <span className="text-[#666] font-bold">Powered by ReddTweaks</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
