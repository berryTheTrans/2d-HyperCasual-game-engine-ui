
import React from 'react';
import { Cpu, ChevronRight, FileCode } from 'lucide-react';
import { ARCHITECTURE_DATA } from '../constants.tsx';

const ArchitectureViewer: React.FC = () => {
  return (
    <div className="flex-grow flex flex-col overflow-hidden bg-zinc-950">
      <div className="p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
          <header>
            <h1 className="text-4xl font-bold text-white flex items-center space-x-4">
              <Cpu className="text-green-500 w-10 h-10" />
              <span>Native C++ Software Architecture</span>
            </h1>
            <p className="mt-4 text-zinc-400 text-lg leading-relaxed max-w-3xl">
              HyperCasual Forge is built on a high-performance, modular C++ core designed specifically for 
              mobile workloads. Below is the blueprint for the engine modules and internal API.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ARCHITECTURE_DATA.map((module, idx) => (
              <div key={idx} className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-green-400 mb-2">{module.name}</h3>
                  <p className="text-sm text-zinc-500 mb-4">{module.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Key Classes</div>
                    <div className="flex flex-wrap gap-2">
                      {module.classes.map(cls => (
                        <span key={cls} className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-mono text-zinc-300">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-black border-t border-zinc-800 p-4">
                  <div className="flex items-center space-x-2 text-zinc-600 mb-2">
                    <FileCode size={12} />
                    <span className="text-[10px] font-mono uppercase">Internal C++ Snippet</span>
                  </div>
                  <pre className="text-[11px] font-mono text-blue-300/80 leading-tight">
                    {module.snippet}
                  </pre>
                </div>
              </div>
            ))}
          </div>

          <section className="bg-blue-900/10 border border-blue-800/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-6">Mobile Engine Integration Strategy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold text-zinc-200 mb-2 underline decoration-blue-500">Rendering</h4>
                <p className="text-xs text-zinc-500 leading-normal">
                  Uses Vulkan on Android and Metal on iOS via a thin abstraction layer (similar to bgfx). 
                  Optimized for fill-rate and batching simple hyper-casual geometry.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-zinc-200 mb-2 underline decoration-blue-500">Physics</h4>
                <p className="text-xs text-zinc-500 leading-normal">
                  Integrated Box2D for 2D logic or Bullet for simple 3D collisions. 
                  Fixed-step simulation decoupled from rendering for frame-pacing stability.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-zinc-200 mb-2 underline decoration-blue-500">Input</h4>
                <p className="text-xs text-zinc-500 leading-normal">
                  Unified touch event queue processing tap, swipe, and drag gestures directly 
                  piped to the JavaScript scripting engine.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
             <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Project Folder Organization</h3>
                  <p className="text-xs text-zinc-500 mt-1">Recommended source structure for the Native Desktop Application.</p>
                </div>
                <button className="px-4 py-2 bg-zinc-800 rounded text-xs font-bold hover:bg-zinc-700">DOWNLOAD SPEC PDF</button>
             </div>
             <div className="mt-6 grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 bg-black rounded">
                  <div className="text-blue-500">/src</div>
                  <div className="pl-4 text-zinc-400">/editor <span className="text-zinc-600 italic">// ImGui Workspace</span></div>
                  <div className="pl-4 text-zinc-400">/runtime <span className="text-zinc-600 italic">// Game Engine Core</span></div>
                  <div className="pl-8 text-zinc-500">/renderer</div>
                  <div className="pl-8 text-zinc-500">/scripting</div>
                  <div className="pl-4 text-zinc-400">/exporter <span className="text-zinc-600 italic">// Build Systems</span></div>
                </div>
                <div className="p-3 bg-black rounded">
                  <div className="text-green-500">/third_party</div>
                  <div className="pl-4 text-zinc-400">/v8 <span className="text-zinc-600 italic">// JS Engine</span></div>
                  <div className="pl-4 text-zinc-400">/imgui <span className="text-zinc-600 italic">// UI Framework</span></div>
                  <div className="pl-4 text-zinc-400">/box2d <span className="text-zinc-600 italic">// Physics</span></div>
                  <div className="pl-4 text-zinc-400">/assimp <span className="text-zinc-600 italic">// Asset Loading</span></div>
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureViewer;
