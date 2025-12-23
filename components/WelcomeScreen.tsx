
import React, { useState, useRef } from 'react';
import { 
  Plus, 
  FolderOpen, 
  Clock, 
  Star, 
  ArrowRight, 
  Zap, 
  Gamepad2,
  Box,
  X,
  HardDrive
} from 'lucide-react';

interface WelcomeScreenProps {
  onOpenProject: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onOpenProject }) => {
  const [showNewProjectMenu, setShowNewProjectMenu] = useState(false);
  const [projectName, setProjectName] = useState('MyHyperGame');
  const [projectPath, setProjectPath] = useState('~/Documents/ForgeProjects/');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recentProjects = [
    { name: 'Neon Runner', path: '~/Documents/ForgeProjects/NeonRunner', lastOpened: '2 hours ago' },
    { name: 'Stack Master', path: '~/Documents/ForgeProjects/StackMaster', lastOpened: 'Yesterday' },
    { name: 'Puzzle Rush', path: '~/Documents/ForgeProjects/PuzzleRush', lastOpened: '3 days ago' },
  ];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd handle filesystem creation here
    onOpenProject();
  };

  const handleBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // In a browser, we can't get the full local path for security reasons,
      // so we simulate a path based on the selected folder/file name
      const simulatedPath = `~/Desktop/${files[0].webkitRelativePath.split('/')[0] || 'SelectedFolder'}/`;
      setProjectPath(simulatedPath);
    } else {
      // If user cancelled or picked nothing, we update to a mock "Desktop" location
      // to visually confirm that the picker interaction occurred.
      setProjectPath('~/Desktop/GameProjects/');
    }
  };

  return (
    <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-300 select-none overflow-hidden animate-in fade-in duration-700">
      
      {/* Hidden input for directory/file browsing simulation */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
        // @ts-ignore: non-standard attributes for directory selection in browsers
        webkitdirectory="" 
        directory="" 
      />

      {/* NEW PROJECT MODAL OVERLAY */}
      {showNewProjectMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <h2 className="text-xl font-bold text-white flex items-center space-x-3">
                <Plus className="text-blue-500" size={20} />
                <span>Create New Project</span>
              </h2>
              <button 
                onClick={() => setShowNewProjectMenu(false)}
                className="p-1 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Project Name</label>
                <input 
                  type="text" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white font-medium"
                  placeholder="Enter project name..."
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Location</label>
                <div className="flex space-x-2">
                  <div className="relative flex-grow">
                    <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <input 
                      type="text" 
                      value={projectPath + (projectName || '')}
                      readOnly
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-xs text-zinc-500 font-mono overflow-hidden whitespace-nowrap text-ellipsis"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleBrowse}
                    className="px-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold transition-colors border border-zinc-700 active:scale-95 hover:text-white"
                  >
                    Browse
                  </button>
                </div>
              </div>

              <div className="pt-4 flex flex-col space-y-3">
                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2"
                >
                  <Zap size={18} fill="currentColor" />
                  <span>FORGE PROJECT</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setShowNewProjectMenu(false)}
                  className="w-full py-3 text-zinc-500 hover:text-zinc-300 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Go Back
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        
        {/* LEFT COLUMN: HERO & ACTIONS */}
        <div className="md:col-span-7 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
                <Zap size={40} fill="currentColor" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">HyperCasual Forge</h1>
                <p className="text-zinc-500 font-medium">Native Mobile Game IDE • v1.0.4 Beta</p>
              </div>
            </div>
            <p className="text-zinc-400 leading-relaxed text-lg max-w-md">
              The professional workflow for crafting high-performance, chart-topping hyper-casual games for Android and iOS.
            </p>
          </div>

          <div className="flex flex-col space-y-4 max-w-xs">
            <button 
              onClick={() => setShowNewProjectMenu(true)}
              className="group flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/10"
            >
              <div className="flex items-center space-x-3">
                <Plus size={24} />
                <span className="text-lg">New Project</span>
              </div>
              <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button 
              onClick={onOpenProject}
              className="group flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95"
            >
              <div className="flex items-center space-x-3">
                <FolderOpen size={24} className="text-zinc-500" />
                <span className="text-lg">Open Project</span>
              </div>
              <span className="text-[10px] text-zinc-600 uppercase font-bold bg-zinc-800 px-2 py-1 rounded">Cmd+O</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: RECENT PROJECTS */}
        <div className="md:col-span-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden h-[480px]">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80 backdrop-blur-sm sticky top-0">
            <div className="flex items-center space-x-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
              <Clock size={14} />
              <span>Recent Projects</span>
            </div>
            <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <Star size={14} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-2 space-y-1">
            {recentProjects.map((project, idx) => (
              <div 
                key={idx}
                onClick={onOpenProject}
                className="group flex flex-col p-4 rounded-xl hover:bg-blue-600/10 cursor-pointer border border-transparent hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-zinc-800 group-hover:bg-blue-600/20 rounded-lg flex items-center justify-center text-zinc-500 group-hover:text-blue-400 transition-colors">
                      <Gamepad2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-200 group-hover:text-white transition-colors">{project.name}</h3>
                      <p className="text-[10px] text-zinc-600 font-mono group-hover:text-zinc-500 transition-colors">{project.path}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <span className="text-[10px] text-zinc-700 font-bold uppercase tracking-tighter">{project.lastOpened}</span>
                </div>
              </div>
            ))}

            <div className="p-8 text-center space-y-2 opacity-20">
              <Box size={40} className="mx-auto text-zinc-600" />
              <p className="text-xs uppercase tracking-tighter font-bold">More Projects Await...</p>
            </div>
          </div>

          <div className="p-4 border-t border-zinc-800 text-center">
            <button className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors">
              Clear Recent Projects
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER TIPS */}
      <div className="mt-16 text-center space-y-4 max-w-xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          <Star size={10} className="text-yellow-500 fill-yellow-500" />
          <span>Pro Tip: Use the 'Hot Reload' feature for instant script testing</span>
        </div>
        <div className="flex justify-center space-x-6 text-[11px] text-zinc-600 font-medium">
          <a href="#" className="hover:text-zinc-400 transition-colors">Documentation</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Community Discord</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Release Notes</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Pricing & License</a>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
