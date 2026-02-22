import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-height-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 transform transition-all hover:scale-[1.01]">
        <div className="flex flex-col items-center gap-6">
          <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg ring-4 ring-indigo-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              E-Suivi <span className="text-indigo-600">404</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Hackathon IFRI 2026 - Tailwind ready!
            </p>
          </div>

          <div className="w-full pt-4">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 group"
            >
              <span className="text-lg">Compteur : {count}</span>
              <span className="bg-indigo-500 px-2 py-1 rounded-md text-sm group-hover:bg-indigo-400">
                +1
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mt-2">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Status</p>
              <p className="text-slate-700 font-semibold flex items-center justify-center gap-2">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                Online
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Style</p>
              <p className="text-slate-700 font-semibold">Tailwind v3</p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 text-slate-400 text-sm font-medium">
        Éditez <code className="bg-white px-2 py-1 rounded border text-indigo-600">src/App.jsx</code> pour commencer le projet.
      </p>
    </div>
  )
}

export default App
