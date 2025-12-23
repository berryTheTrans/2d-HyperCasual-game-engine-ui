
import React, { useState, useRef, useEffect } from 'react';
/* Added Activity to the imports to fix the 'Cannot find name Activity' error */
import { 
  Box, 
  Layers, 
  Play, 
  Settings, 
  Cpu, 
  FileCode, 
  Package, 
  Plus, 
  Search,
  Monitor,
  ChevronDown,
  MousePointer2,
  Move,
  RotateCw,
  Maximize2,
  Trash2,
  Grid,
  Lock,
  Eye,
  Copy,
  Layout,
  Zap,
  Type,
  Circle,
  Image as ImageIcon,
  Video,
  Music,
  Sun,
  Lightbulb,
  Pointer,
  Square,
  CheckSquare,
  Sliders,
  ChevronDownSquare,
  Keyboard,
  Maximize,
  FileText,
  Upload,
  FolderOpen,
  MoreVertical,
  FolderPlus,
  ArrowLeft,
  ChevronRight,
  SquarePlay,
  StopCircle,
  RefreshCcw,
  Activity,
  Save,
  LogOut,
  Info,
  ExternalLink,
  MessageCircle,
  Undo2,
  Redo2,
  Scissors
} from 'lucide-react';
import { EditorTab, GameObject, Asset } from './types.ts';
import ArchitectureViewer from './components/ArchitectureViewer.tsx';
import WelcomeScreen from './components/WelcomeScreen.tsx';

const App: React.FC = () => {
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>(EditorTab.Scene);
  const [transformMode, setTransformMode] = useState<'select' | 'move' | 'rotate' | 'scale'>('move');
  const [showGrid, setShowGrid] = useState(true);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationFrameRef = useRef<number>(null);
  const prevTimeRef = useRef<number>(0);
  const initialSceneRef = useRef<GameObject[]>([]);

  // Assets Management State
  const [assets, setAssets] = useState<Asset[]>([
    { id: '1', name: 'SFX', type: 'folder', size: '--', parentId: null },
    { id: '2', name: 'Textures', type: 'folder', size: '--', parentId: null },
    { id: '3', name: 'Background.png', type: 'image', size: '4.5 MB', parentId: null },
    { id: '4', name: 'PlayerJump.wav', type: 'audio', size: '1.2 MB', parentId: '1' },
    { id: '5', name: 'PlayerController.js', type: 'script', size: '12 KB', parentId: null }
  ]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
      }
      if (menuBarRef.current && !menuBarRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // GAME ENGINE LOOP
  useEffect(() => {
    if (!isSimulating) {
      if (simulationFrameRef.current) cancelAnimationFrame(simulationFrameRef.current);
      return;
    }

    const loop = (time: number) => {
      const dt = (time - prevTimeRef.current) / 1000;
      prevTimeRef.current = time;

      if (dt > 0.1) { // Cap delta time to prevent large jumps on lag
        simulationFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      setGameObjects(prev => prev.map(obj => {
        if (!obj.runtime) return obj;

        let { vx, vy, vr } = obj.runtime;
        let { x, y } = obj.position;
        let rotation = obj.rotation;

        // Apply Gravity if Dynamic Rigidbody
        if (obj.components.rigidbody?.isDynamic) {
          vy += (9.8 * (obj.components.rigidbody.gravityScale || 1)) * dt * 10; 
        }

        // Simple Script Simulation
        if (obj.components.script) {
          vr += Math.sin(time / 500) * 2;
          vx += Math.cos(time / 1000) * 0.5;
        }

        // Apply Velocities
        x += vx * dt;
        y += vy * dt;
        rotation += vr * dt;

        // Simple Bounds Collision (Ground at 90%)
        if (y > 90 && obj.components.rigidbody?.isDynamic) {
          y = 90;
          vy *= -0.4; // Bounce
        }

        return {
          ...obj,
          position: { x, y },
          rotation,
          runtime: { vx, vy, vr }
        };
      }));

      simulationFrameRef.current = requestAnimationFrame(loop);
    };

    prevTimeRef.current = performance.now();
    simulationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (simulationFrameRef.current) cancelAnimationFrame(simulationFrameRef.current);
    };
  }, [isSimulating]);

  const toggleSimulation = () => {
    if (!isSimulating) {
      initialSceneRef.current = JSON.parse(JSON.stringify(gameObjects));
      setGameObjects(prev => prev.map(o => ({
        ...o,
        runtime: { vx: 0, vy: 0, vr: 0 }
      })));
      setIsSimulating(true);
    } else {
      setIsSimulating(false);
      setGameObjects(initialSceneRef.current);
    }
  };

  const addObject = (type: string, category: string) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newObj: GameObject = {
      id: newId,
      name: `${type}_${gameObjects.length + 1}`,
      type: type,
      position: { x: 50, y: 50 },
      rotation: 0,
      scale: { x: 1, y: 1 },
      zIndex: gameObjects.length,
      color: category === 'UI' ? '#27272a' : (category === 'Light' ? '#fef08a' : '#3b82f6'),
      components: {}
    };

    if (type === 'Box') {
      newObj.components.collider = { width: 64, height: 64, isTrigger: false, shape: 'box' };
      newObj.components.rigidbody = { mass: 1, gravityScale: 1, isDynamic: true };
    }
    if (type === 'Circle') {
      newObj.components.collider = { width: 64, height: 64, isTrigger: false, shape: 'circle' };
      newObj.components.rigidbody = { mass: 1, gravityScale: 1, isDynamic: true };
    }
    if (type === 'Text') newObj.components.text = { content: 'New Text', fontSize: 24 };
    if (category === 'Light') newObj.components.light = { intensity: 1.0, range: 100, type: type.toLowerCase() as any };
    if (type === 'Audio Placeholder') newObj.components.audio = { clip: 'ambient.wav', volume: 0.5, playOnAwake: true };

    setGameObjects([...gameObjects, newObj]);
    setSelectedId(newId);
    setIsAddMenuOpen(false);
  };

  const createFolder = () => {
    const folderName = prompt("Folder Name:", "New Folder");
    if (!folderName) return;
    const newFolder: Asset = {
      id: Math.random().toString(36).substr(2, 9),
      name: folderName,
      type: 'folder',
      size: '--',
      parentId: currentFolderId
    };
    setAssets([...assets, newFolder]);
  };

  const handleImportAsset = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAssets: Asset[] = Array.from(files).map(file => {
      let type: Asset['type'] = 'image';
      if (file.type.startsWith('audio/')) type = 'audio';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.name.endsWith('.pdf')) type = 'pdf';
      else if (file.name.endsWith('.js')) type = 'script';
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: type,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        parentId: currentFolderId
      };
    });

    setAssets([...assets, ...newAssets]);
  };

  const startBuild = () => {
    setIsBuilding(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setBuildProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsBuilding(false);
          setBuildProgress(0);
          alert("Build Succeeded: ForgeGame.apk exported to /build/");
        }, 500);
      }
    }, 100);
  };

  const handleOpenProject = () => setIsProjectOpen(true);
  
  const deleteSelected = () => {
    if (selectedId) {
      setGameObjects(prev => prev.filter(o => o.id !== selectedId));
      setSelectedId(null);
    }
  };

  const duplicateSelected = () => {
    if (selectedId) {
      const original = gameObjects.find(o => o.id === selectedId);
      if (original) {
        const newNode = { ...original, id: Math.random().toString(36).substr(2, 9), name: `${original.name}_Copy`, position: { ...original.position, x: original.position.x + 5 }};
        setGameObjects(prev => [...prev, newNode]);
        setSelectedId(newNode.id);
      }
    }
  };

  const selectedObject = gameObjects.find(o => o.id === selectedId);

  const renderAssetIcon = (type: Asset['type']) => {
    switch(type) {
      case 'audio': return <Music size={20} className="text-purple-400" />;
      case 'video': return <Video size={20} className="text-red-400" />;
      case 'image': return <ImageIcon size={20} className="text-blue-400" />;
      case 'pdf': return <FileText size={20} className="text-orange-400" />;
      case 'script': return <FileCode size={20} className="text-yellow-400" />;
      case 'folder': return <FolderOpen size={24} className="text-zinc-500 fill-zinc-500/10" />;
      default: return <Box size={20} className="text-zinc-500" />;
    }
  };

  const currentFolder = assets.find(a => a.id === currentFolderId);
  const filteredAssets = assets.filter(a => a.parentId === currentFolderId);

  if (!isProjectOpen) {
    return <WelcomeScreen onOpenProject={handleOpenProject} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 text-zinc-300 font-sans select-none overflow-hidden animate-in fade-in duration-500">
      
      {/* TOP MENU BAR */}
      <nav ref={menuBarRef} className="h-8 bg-zinc-950 border-b border-zinc-900 flex items-center px-2 z-50">
        <div className="flex items-center h-full">
          <div className="px-2 py-1 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded cursor-default relative">
            <button 
              className={`text-[11px] font-medium px-2 ${activeMenu === 'file' ? 'text-white' : ''}`}
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              onMouseEnter={() => activeMenu && setActiveMenu('file')}
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div className="absolute top-full left-0 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-2xl py-1 mt-1 z-[60]">
                <button className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 text-[11px] text-zinc-300 hover:text-white group">
                  <div className="flex items-center space-x-2"><Plus size={12} /><span>New Project</span></div>
                  <span className="text-[9px] text-zinc-600 group-hover:text-blue-200">Ctrl+N</span>
                </button>
                <button className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 text-[11px] text-zinc-300 hover:text-white group">
                  <div className="flex items-center space-x-2"><FolderOpen size={12} /><span>Open Project</span></div>
                  <span className="text-[9px] text-zinc-600 group-hover:text-blue-200">Ctrl+O</span>
                </button>
                <div className="h-px bg-zinc-800 my-1" />
                <button className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 text-[11px] text-zinc-300 hover:text-white group">
                  <div className="flex items-center space-x-2"><Save size={12} /><span>Save</span></div>
                  <span className="text-[9px] text-zinc-600 group-hover:text-blue-200">Ctrl+S</span>
                </button>
                <button className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 text-[11px] text-zinc-300 hover:text-white group">
                  <div className="flex items-center space-x-2"><Package size={12} /><span>Build Settings</span></div>
                </button>
                <div className="h-px bg-zinc-800 my-1" />
                <button 
                  onClick={() => setIsProjectOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-red-600 text-[11px] text-zinc-300 hover:text-white group"
                >
                  <div className="flex items-center space-x-2"><LogOut size={12} /><span>Exit to Menu</span></div>
                </button>
              </div>
            )}
          </div>

          <div className="px-2 py-1 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded cursor-default relative">
            <button 
              className={`text-[11px] font-medium px-2 ${activeMenu === 'edit' ? 'text-white' : ''}`}
              onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
              onMouseEnter={() => activeMenu && setActiveMenu('edit')}
            >
              Edit
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute top-full left-0 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-2xl py-1 mt-1 z-[60]">
                <button className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 text-[11px] text-zinc-300 hover:text-white group">
                  <div className="flex items-center space-x-2"><Undo2 size={12} /><span>Undo</span></div>
                  <span className="text-[9px] text-zinc-600 group-hover:text-blue-200">Ctrl+Z</span>
                </button>
                <button className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 text-[11px] text-zinc-300 hover:text-white group">
                  <div className="flex items-center space-x-2"><Redo2 size={12} /><span>Redo</span></div>
                  <span className="text-[9px] text-zinc-600 group-hover:text-blue-200">Ctrl+Y</span>
                </button>
                <div className="h-px bg-zinc-800 my-1" />
                <button className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 text-[11px] text-zinc-300 hover:text-white group">
                  <div className="flex items-center space-x-2"><Scissors size={12} /><span>Cut</span></div>
                  <span className="text-[9px] text-zinc-600 group-hover:text-blue-200">Ctrl+X</span>
                </button>
                <button className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 text-[11px] text-zinc-300 hover:text-white group">
                  <div className="flex items-center space-x-2"><Copy size={12} /><span>Copy</span></div>
                  <span className="text-[9px] text-zinc-600 group-hover:text-blue-200">Ctrl+C</span>
                </button>
                <button className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 text-[11px] text-zinc-300 hover:text-white group">
                  <div className="flex items-center space-x-2"><CheckSquare size={12} /><span>Paste</span></div>
                  <span className="text-[9px] text-zinc-600 group-hover:text-blue-200">Ctrl+V</span>
                </button>
              </div>
            )}
          </div>

          <div className="px-2 py-1 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded cursor-default relative">
            <button 
              className={`text-[11px] font-medium px-2 ${activeMenu === 'help' ? 'text-white' : ''}`}
              onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
              onMouseEnter={() => activeMenu && setActiveMenu('help')}
            >
              Help
            </button>
            {activeMenu === 'help' && (
              <div className="absolute top-full left-0 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-2xl py-1 mt-1 z-[60]">
                <button className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-blue-600 text-[11px] text-zinc-300 hover:text-white">
                  <FileText size={12} /><span>Documentation</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-blue-600 text-[11px] text-zinc-300 hover:text-white">
                  <MessageCircle size={12} /><span>Community Discord</span>
                </button>
                <div className="h-px bg-zinc-800 my-1" />
                <button className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-blue-600 text-[11px] text-zinc-300 hover:text-white">
                  <Info size={12} /><span>About Forge IDE</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-blue-600 text-[11px] text-zinc-300 hover:text-white">
                  <ExternalLink size={12} /><span>Check for Updates</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex-grow h-full" />
        <div className="flex items-center space-x-4 px-4 h-full">
           <span className="text-[10px] text-zinc-600 font-mono">Build v1.0.4 - stable</span>
           <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-700 font-bold uppercase">Connected</span>
           </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="flex flex-grow w-full overflow-hidden">
        
        {/* SIDEBAR PANEL (HIERARCHY) */}
        <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col z-20 shadow-xl">
          <div className="p-3 bg-blue-600 flex items-center justify-between shadow-lg shadow-blue-600/10 cursor-pointer" onClick={() => setIsProjectOpen(false)}>
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-1 rounded"><Zap size={14} className="text-white" fill="currentColor" /></div>
              <span className="text-xs font-black text-white uppercase tracking-tighter">Forge IDE</span>
            </div>
            <Settings size={14} className="text-white/50 hover:text-white" />
          </div>

          <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex justify-between items-center border-b border-zinc-800 bg-zinc-900/20 relative">
            Scene Graph
            <div className="flex space-x-2">
              <Search size={12} className="cursor-pointer hover:text-white" />
              <Plus 
                size={12} 
                className={`cursor-pointer transition-colors ${isAddMenuOpen ? 'text-blue-500' : 'hover:text-white'}`} 
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              />
            </div>

            {isAddMenuOpen && (
              <div 
                ref={addMenuRef}
                className="absolute top-10 left-3 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="max-h-[70vh] overflow-y-auto p-2 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800">
                  <div>
                    <div className="text-[9px] font-black text-zinc-600 px-2 mb-1 tracking-widest uppercase">2D Objects</div>
                    <div className="space-y-0.5">
                      <button onClick={() => addObject('Text', '2D')} className="w-full flex items-center space-x-2 px-2 py-1.5 hover:bg-blue-600/20 text-xs rounded text-zinc-300 group"><Type size={14} className="text-zinc-500 group-hover:text-blue-400" /><span>Text</span></button>
                      <button onClick={() => addObject('Empty Item', '2D')} className="w-full flex items-center space-x-2 px-2 py-1.5 hover:bg-blue-600/20 text-xs rounded text-zinc-300 group"><Pointer size={14} className="text-zinc-500 group-hover:text-blue-400" /><span>Empty Item</span></button>
                      <button onClick={() => addObject('Box', '2D')} className="w-full flex items-center space-x-2 px-2 py-1.5 hover:bg-blue-600/20 text-xs rounded text-zinc-300 group"><Square size={14} className="text-zinc-500 group-hover:text-blue-400" /><span>Box</span></button>
                      <button onClick={() => addObject('Circle', '2D')} className="w-full flex items-center space-x-2 px-2 py-1.5 hover:bg-blue-600/20 text-xs rounded text-zinc-300 group"><Circle size={14} className="text-zinc-500 group-hover:text-blue-400" /><span>Circle</span></button>
                      <button onClick={() => addObject('Sprite Placeholder', '2D')} className="w-full flex items-center space-x-2 px-2 py-1.5 hover:bg-blue-600/20 text-xs rounded text-zinc-300 group"><ImageIcon size={14} className="text-zinc-500 group-hover:text-blue-400" /><span>Sprite</span></button>
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-zinc-600 px-2 mb-1 tracking-widest uppercase">Lighting</div>
                    <div className="space-y-0.5">
                      <button onClick={() => addObject('Point Light', 'Light')} className="w-full flex items-center space-x-2 px-2 py-1.5 hover:bg-blue-600/20 text-xs rounded text-zinc-300 group"><Sun size={14} className="text-zinc-500 group-hover:text-blue-400" /><span>Point Light</span></button>
                      <button onClick={() => addObject('Spot Light', 'Light')} className="w-full flex items-center space-x-2 px-2 py-1.5 hover:bg-blue-600/20 text-xs rounded text-zinc-300 group"><Lightbulb size={14} className="text-zinc-500 group-hover:text-blue-400" /><span>Spot Light</span></button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-2 overflow-y-auto flex-grow text-sm">
            <div className="flex items-center space-x-2 p-1 text-zinc-300 font-medium">
              <ChevronDown size={14} className="text-zinc-600" />
              <Monitor size={14} className="text-blue-500" />
              <span>Root Scene</span>
            </div>
            <div className="pl-6 space-y-1 mt-1">
              {gameObjects.slice().sort((a, b) => b.zIndex - a.zIndex).map(obj => (
                <div 
                  key={obj.id}
                  onClick={() => setSelectedId(obj.id)}
                  className={`flex items-center group space-x-2 p-1.5 rounded cursor-pointer transition-all border border-transparent ${selectedId === obj.id ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'hover:bg-zinc-900/50 text-zinc-400'}`}
                >
                  <div className="w-1 flex-shrink-0" />
                  <Box size={14} className={selectedId === obj.id ? 'text-blue-500' : 'text-zinc-600'} />
                  <span className="flex-grow truncate">{obj.name}</span>
                  <div className="hidden group-hover:flex items-center space-x-1">
                    <Eye size={10} className="text-zinc-500" />
                    <Lock size={10} className="text-zinc-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN VIEWPORT AREA */}
        <main className="flex-grow relative flex flex-col bg-zinc-900/50 overflow-hidden">
          
          <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-950 z-10 shadow-md">
            <div className="flex items-center space-x-1 bg-black/40 rounded-lg p-1 border border-zinc-800/50">
              {Object.values(EditorTab).map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${activeTab === tab ? 'bg-zinc-800 text-blue-400 shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {tab === EditorTab.Scene && <Layout size={14} />}
                  {tab === EditorTab.Scripting && <FileCode size={14} />}
                  {tab === EditorTab.Architecture && <Cpu size={14} />}
                  {tab === EditorTab.Build && <Package size={14} />}
                  {tab === EditorTab.Assets && <Layers size={14} />}
                  <span className="capitalize">{tab.toLowerCase()}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              {!isSimulating && (
                <>
                  <div className="flex bg-black/40 rounded p-0.5 border border-zinc-800/50">
                    <button onClick={() => setTransformMode('select')} className={`p-1.5 rounded transition-all ${transformMode === 'select' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}><MousePointer2 size={14} /></button>
                    <button onClick={() => setTransformMode('move')} className={`p-1.5 rounded transition-all ${transformMode === 'move' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}><Move size={14} /></button>
                    <button onClick={() => setTransformMode('rotate')} className={`p-1.5 rounded transition-all ${transformMode === 'rotate' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}><RotateCw size={14} /></button>
                    <button onClick={() => setTransformMode('scale')} className={`p-1.5 rounded transition-all ${transformMode === 'scale' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}><Maximize2 size={14} /></button>
                  </div>
                  <div className="h-4 w-px bg-zinc-800" />
                  <div className="flex items-center space-x-1">
                    <button onClick={duplicateSelected} disabled={!selectedId} className="p-1.5 text-zinc-500 hover:text-zinc-300 disabled:opacity-20"><Copy size={14} /></button>
                    <button onClick={deleteSelected} disabled={!selectedId} className="p-1.5 text-zinc-500 hover:text-red-400 disabled:opacity-20"><Trash2 size={14} /></button>
                  </div>
                </>
              )}
              <button 
                onClick={toggleSimulation}
                className={`px-5 py-2 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all shadow-lg active:scale-95 ${isSimulating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                {isSimulating ? <StopCircle size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                <span>{isSimulating ? 'Stop Simulation' : 'Simulate'}</span>
              </button>
            </div>
          </header>

          <div className="flex-grow flex flex-col relative overflow-hidden">
            {activeTab === EditorTab.Scene && (
              <div className={`flex-grow flex items-center justify-center relative overflow-hidden ${isSimulating ? 'bg-black' : 'bg-[#0a0a0a]'}`}>
                <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                  {!isSimulating && showGrid && (
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                  )}
                  <div className="absolute inset-0">
                    {!isSimulating && <div className="absolute inset-0 opacity-20 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />}
                    {gameObjects.map(obj => (
                      <div
                        key={obj.id}
                        style={{ 
                          left: `${obj.position.x}%`, top: `${obj.position.y}%`,
                          backgroundColor: obj.color,
                          transform: `translate(-50%, -50%) rotate(${obj.rotation}deg) scale(${obj.scale.x}, ${obj.scale.y})`,
                          zIndex: obj.zIndex,
                          width: '64px', height: '64px',
                          borderRadius: obj.type === 'Circle' ? '100%' : '4px'
                        }}
                        className={`absolute shadow-lg flex items-center justify-center transition-all ${isSimulating ? 'cursor-default' : 'cursor-grab active:cursor-grabbing border'} ${!isSimulating && selectedId === obj.id ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-black z-50 border-blue-400' : 'border-zinc-800'}`}
                        onClick={(e) => { e.stopPropagation(); if (!isSimulating) setSelectedId(obj.id); }}
                      >
                        {obj.components.text && <span className="text-[10px] font-bold text-white text-center pointer-events-none px-1 drop-shadow-lg">{obj.components.text.content}</span>}
                        {obj.components.light && <Sun size={24} className="text-yellow-400 animate-pulse opacity-50" />}
                        {!obj.components.text && !obj.components.light && <span className="text-[10px] text-white/50 uppercase font-black drop-shadow-md">{obj.type[0]}</span>}
                      </div>
                    ))}
                    {isSimulating && <div className="absolute bottom-[10%] left-0 right-0 h-1 bg-green-900/50 border-t border-green-500/30" />}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === EditorTab.Scripting && (
              <div className="flex-grow flex flex-col bg-[#080808] p-6 font-mono text-sm overflow-auto text-blue-100/80 leading-relaxed">
                <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                  <span className="text-zinc-600">/scripts/world_controller.js</span>
                  <button onClick={() => alert("Logic Synced with Engine Core")} className="flex items-center space-x-2 px-2 py-1 bg-zinc-900 rounded text-[10px] text-blue-400 hover:text-blue-300"><RefreshCcw size={12} /><span>Hot Reload</span></button>
                </div>
                <pre className="text-blue-300/60">{`// Logic Engine Hooked...\n\nclass Main extends Forge.Entity {\n  onUpdate(dt) {\n    this.rotate(5 * dt);\n    if (Forge.Input.isPressed('space')) {\n      this.jump();\n    }\n  }\n}`}</pre>
              </div>
            )}
            
            {activeTab === EditorTab.Architecture && <ArchitectureViewer />}
            
            {activeTab === EditorTab.Build && (
              <div className="flex-grow flex items-center justify-center p-12 bg-zinc-900/20">
                <div className="max-w-md w-full bg-zinc-950 rounded-2xl border border-zinc-800 p-8 shadow-2xl">
                  <h2 className="text-xl font-black mb-4 flex items-center space-x-3"><Package className="text-orange-400" /><span>Forge Binaries</span></h2>
                  {!isBuilding ? (
                    <button onClick={startBuild} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center justify-center space-x-3">
                      <Cpu size={20} /><span>Initiate Build</span>
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500"><span>Compiling Engine Core...</span><span>{buildProgress}%</span></div>
                      <div className="w-full h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-1"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${buildProgress}%` }}></div></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ASSETS BOTTOM MENU */}
            <section className="h-64 border-t border-zinc-800 bg-zinc-950 flex flex-col shadow-2xl z-10">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800/50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                    <FolderOpen size={14} className="text-blue-500" />
                    <span>Project Assets</span>
                  </div>
                  <div className="h-3 w-px bg-zinc-800" />
                  <div className="flex items-center space-x-1 text-[10px] font-bold">
                    <button onClick={() => setCurrentFolderId(null)} className={`hover:text-white transition-colors ${currentFolderId === null ? 'text-blue-400' : 'text-zinc-600'}`}>Assets</button>
                    {currentFolder && (
                      <>
                        <ChevronRight size={10} className="text-zinc-800" />
                        <span className="text-blue-400">{currentFolder.name}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {currentFolderId !== null && (
                    <button onClick={() => {
                      const parentFolder = assets.find(a => a.id === currentFolderId);
                      setCurrentFolderId(parentFolder?.parentId || null);
                    }} className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-800 text-zinc-500 hover:text-white transition-all">
                      <ArrowLeft size={14} />
                    </button>
                  )}
                  <button onClick={createFolder} className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-md text-[9px] font-black uppercase tracking-widest transition-all">
                    <FolderPlus size={12} />
                    <span>New Folder</span>
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleImportAsset} />
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/10">
                    <Upload size={12} />
                    <span>Import</span>
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-x-auto p-4 flex items-start space-x-6 scrollbar-thin scrollbar-thumb-zinc-800">
                {filteredAssets.map(asset => (
                  <div key={asset.id} className="flex-shrink-0 w-28 group" onDoubleClick={() => asset.type === 'folder' && setCurrentFolderId(asset.id)}>
                    <div className="aspect-square bg-zinc-900 border border-zinc-800 rounded-xl mb-2 flex items-center justify-center relative transition-all group-hover:border-blue-500/50 group-hover:bg-blue-600/5 shadow-inner cursor-pointer">
                      {renderAssetIcon(asset.type)}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical size={12} className="text-zinc-600 hover:text-white cursor-pointer" /></div>
                    </div>
                    <div className="px-1 text-center">
                      <div className="text-[10px] font-bold text-zinc-400 truncate group-hover:text-zinc-200 transition-colors">{asset.name}</div>
                      <div className="text-[8px] text-zinc-700 font-mono mt-0.5">{asset.size}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>

        {/* INSPECTOR PANEL */}
        <aside className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col z-20 shadow-2xl overflow-hidden">
          <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-800 bg-zinc-900/20">Property Inspector</div>
          {selectedObject ? (
            <div className="p-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pb-12">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-zinc-200"><Box size={14} className="text-blue-500" /><span className="font-bold text-xs truncate max-w-[120px]">{selectedObject.name}</span></div>
                  <div className="px-1.5 py-0.5 bg-zinc-900 rounded text-[8px] font-mono text-zinc-600 border border-zinc-800">0x{selectedObject.id}</div>
                </div>
                <div className="space-y-4 bg-black/40 p-4 rounded-xl border border-zinc-800/50 shadow-inner">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><span className="text-[8px] text-zinc-500 uppercase font-bold">Pos X</span><input type="number" value={Math.round(selectedObject.position.x)} className="w-full bg-zinc-950 border border-zinc-800 text-[11px] font-mono px-2 py-1.5 rounded-md text-blue-400" readOnly /></div>
                    <div className="space-y-1"><span className="text-[8px] text-zinc-500 uppercase font-bold">Pos Y</span><input type="number" value={Math.round(selectedObject.position.y)} className="w-full bg-zinc-950 border border-zinc-800 text-[11px] font-mono px-2 py-1.5 rounded-md text-blue-400" readOnly /></div>
                  </div>
                </div>
              </section>
              
              {selectedObject.components.rigidbody && (
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 space-y-3 shadow-lg shadow-black/20">
                    <div className="text-[10px] font-black uppercase text-zinc-500 mb-2 flex items-center space-x-2"><Activity size={12} /><span>Rigidbody 2D</span></div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Simulated Physics</span>
                      <button 
                        onClick={() => {
                          const newObjs = gameObjects.map(o => o.id === selectedId ? { ...o, components: { ...o.components, rigidbody: { ...o.components.rigidbody!, isDynamic: !o.components.rigidbody!.isDynamic } } } : o);
                          setGameObjects(newObjs);
                        }}
                        className={`w-10 h-5 rounded-full transition-colors relative ${selectedObject.components.rigidbody.isDynamic ? 'bg-blue-600' : 'bg-zinc-800'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${selectedObject.components.rigidbody.isDynamic ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                </div>
              )}
              <button className="w-full py-4 border border-dashed border-zinc-800 text-zinc-700 text-[9px] font-black uppercase tracking-[0.25em] rounded-xl hover:border-zinc-600 hover:text-zinc-400 transition-all">Add Native Component</button>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-800"><MousePointer2 size={32} /></div>
              <p className="text-zinc-700 text-[11px] leading-relaxed">Forge Engine Core Active.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default App;
