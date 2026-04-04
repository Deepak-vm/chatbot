import { useState } from 'react';
import {
  Key,
  Server,
  Sliders,
  Trash2,
  Save,
  Info,
} from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { Button } from '../common/Button';
import { MODELS } from '../../utils/constants';

function Section({ title, icon: Icon, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-[#1f2937]">
        <Icon size={16} className="text-indigo-400" />
        <h2 className="text-sm font-semibold text-gray-200">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function SettingsPanel() {
  const { selectedModel, setModel, clearChat } = useChat();
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save to localStorage
    if (apiKey) localStorage.setItem('lg_api_key', apiKey);
    if (apiUrl) localStorage.setItem('lg_api_url', apiUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure your LangGraph Chat experience</p>
        </div>

        {/* API Keys */}
        <Section title="API Configuration" icon={Key}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5" htmlFor="api-key">
                API Key
              </label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5" htmlFor="api-url">
                Backend URL
              </label>
              <input
                id="api-url"
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>
        </Section>

        {/* Model */}
        <Section title="Default Model" icon={Server}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setModel(model)}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${
                  selectedModel.id === model.id
                    ? 'border-indigo-500/40 bg-indigo-500/10'
                    : 'border-[#1f2937] hover:border-[#374151] hover:bg-white/5'
                }`}
                aria-pressed={selectedModel.id === model.id}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    selectedModel.id === model.id ? 'bg-indigo-400' : 'bg-gray-600'
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-200">{model.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{model.description}</p>
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* Danger zone */}
        <Section title="Data" icon={Sliders}>
          <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/15 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-200">Clear All Chats</p>
              <p className="text-xs text-gray-500 mt-0.5">Delete all message history</p>
            </div>
            <Button variant="danger" size="sm" onClick={clearChat}>
              <Trash2 size={14} />
              Clear
            </Button>
          </div>
        </Section>

        {/* Info */}
        <div className="flex items-start gap-2 p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
          <Info size={14} className="text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-500 leading-relaxed">
            Currently using <strong className="text-gray-400">mock mode</strong>. Set a backend URL
            and API key to connect to your LangGraph/FastAPI backend.
          </p>
        </div>

        {/* Save */}
        <Button variant="gradient" className="w-full justify-center" onClick={handleSave}>
          <Save size={15} />
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
