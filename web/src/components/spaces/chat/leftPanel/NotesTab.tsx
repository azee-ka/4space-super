import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStickyNote } from '@fortawesome/free-solid-svg-icons';

export function NotesTab() {
  return (
    <div className="p-4">
      <div className="text-center py-6">
        <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-zinc-800/50 flex items-center justify-center">
          <FontAwesomeIcon icon={faStickyNote} className="text-2xl text-green-400" />
        </div>
        <p className="text-sm text-gray-400 mb-3">No notes yet</p>
        <button className="px-4 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-medium transition-colors">
          Create Note
        </button>
      </div>
    </div>
  );
}