import React, { useState } from 'react';
import { getAPPS_SCRIPT_TEMPLATE } from '../services/googleSheets';

interface SettingsPanelProps {
  appsScriptUrl: string;
  docUrl: string;
  unit: string;
  onSaveUrl: (url: string) => void;
  onSaveDocUrl: (docUrl: string) => void;
  onSaveUnit: (unit: string) => void;
  onResetRegimens: () => void;
  onBack: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  appsScriptUrl,
  docUrl,
  unit,
  onSaveUrl,
  onSaveDocUrl,
  onSaveUnit,
  onResetRegimens,
  onBack
}) => {
  const [url, setUrl] = useState(appsScriptUrl);
  const [googleDocUrl, setGoogleDocUrl] = useState(docUrl);
  const [unitState, setUnitState] = useState(unit);
  const [showCode, setShowCode] = useState(false);
  const [toast, setToast] = useState('');

  function handleSave() {
    onSaveUrl(url.trim());
    onSaveDocUrl(googleDocUrl.trim());
    onSaveUnit(unitState);
    setToast('Settings saved!');
    setTimeout(() => setToast(''), 2000);
  }

  function copyScriptCode() {
    navigator.clipboard.writeText(getAPPS_SCRIPT_TEMPLATE());
    setToast('Google Apps Script code copied to clipboard!');
    setTimeout(() => setToast(''), 2500);
  }

  return (
    <div className="screen overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <button className="w-10 h-10 rounded-lg bg-surfaceCard border border-dimBorder flex items-center justify-center text-white text-lg"
                onClick={onBack} aria-label="Back">←</button>
        <h2 className="text-lg font-bold tracking-wider uppercase font-mono">Settings & Integration</h2>
      </div>

      {/* Weight Unit */}
      <div className="mb-6">
        <label className="text-dimText text-xs font-mono uppercase tracking-wider mb-2 block">Weight Unit</label>
        <div className="flex gap-2">
          {['kg', 'lbs'].map((u) => (
            <button key={u} className={`flex-1 py-3 font-mono font-bold rounded-lg border text-sm uppercase ${unitState === u ? 'bg-white text-black border-white' : 'bg-surfaceCard text-white border-dimBorder'}`}
                    onClick={() => setUnitState(u)}>
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Google Apps Script URL */}
      <div className="mb-6">
        <label className="text-dimText text-xs font-mono uppercase tracking-wider mb-2 block">
          Google Apps Script Web App URL *
        </label>
        <input value={url} onChange={e => setUrl(e.target.value)}
               placeholder="https://script.google.com/macros/s/.../exec" className="mb-2" />
        <p className="text-xs text-subText font-sans leading-relaxed">
          Handles both Google Sheets (predefined workouts) and Google Docs (custom workouts creating a tab per session).
        </p>
      </div>

      {/* Optional Google Doc URL */}
      <div className="mb-6">
        <label className="text-dimText text-xs font-mono uppercase tracking-wider mb-2 block">
          Target Google Doc URL / ID (Optional)
        </label>
        <input value={googleDocUrl} onChange={e => setGoogleDocUrl(e.target.value)}
               placeholder="https://docs.google.com/document/d/.../edit" className="mb-2" />
        <p className="text-xs text-subText font-sans leading-relaxed">
          Optional. If left blank, the script automatically creates or updates a document named <strong>"Gym Logger - Custom Workouts"</strong> in your Google Drive.
        </p>
      </div>

      <button className="btn-primary mb-6" onClick={handleSave}>
        Save Settings
      </button>

      <div className="divider"></div>

      {/* Setup Guide */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-dimText uppercase">GOOGLE APPS SCRIPT SETUP GUIDE</span>
          <button className="text-xs font-mono text-white underline" onClick={() => setShowCode(!showCode)}>
            {showCode ? 'Hide Code' : 'View Code'}
          </button>
        </div>

        <div className="p-4 bg-surfaceCard rounded-xl border border-dimBorder text-xs text-subText font-sans leading-relaxed flex flex-col gap-2">
          <p><strong>Step 1:</strong> Open a spreadsheet at <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-white underline font-mono">sheets.new</a>.</p>
          <p><strong>Step 2:</strong> Go to <strong>Extensions &gt; Apps Script</strong> in the menu.</p>
          <p><strong>Step 3:</strong> Replace everything with the code snippet below.</p>
          <p><strong>Step 4:</strong> Click <strong>Deploy &gt; New deployment</strong>, select <strong>Web app</strong>, set <i>Who has access</i> to <strong>Anyone</strong>.</p>
          <p><strong>Step 5:</strong> Copy the Web App URL into the box above!</p>
        </div>

        {showCode && (
          <div className="mt-3 p-3 bg-black rounded-lg border border-dimBorder font-mono text-[11px] overflow-x-auto relative">
            <button className="absolute top-2 right-2 px-3 py-1 bg-white text-black font-bold text-xs rounded"
                    onClick={copyScriptCode}>
              Copy Code
            </button>
            <pre className="text-subText">{getAPPS_SCRIPT_TEMPLATE()}</pre>
          </div>
        )}
      </div>

      <div className="divider"></div>

      {/* Reset Default Regimens */}
      <div className="mb-6">
        <label className="text-dimText text-xs font-mono uppercase tracking-wider mb-2 block">Reset App Data</label>
        <button className="btn-secondary text-sm py-3" onClick={() => {
          if (confirm('Reset default regimens and history?')) {
            onResetRegimens();
            setToast('Regimens reset to defaults!');
            setTimeout(() => setToast(''), 2000);
          }
        }}>
          Reset Default Regimens
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};
