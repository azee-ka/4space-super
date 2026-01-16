import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

export function RemindersTab() {
  return (
    <div className="p-4">
      <div className="text-center py-6">
        <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-zinc-800/50 flex items-center justify-center">
          <FontAwesomeIcon icon={faClock} className="text-2xl text-orange-400" />
        </div>
        <p className="text-sm text-gray-400 mb-3">No reminders set</p>
        <button className="px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-sm font-medium transition-colors">
          Create Reminder
        </button>
      </div>
    </div>
  );
}