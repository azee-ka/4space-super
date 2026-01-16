import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

export function LinksTab() {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <FontAwesomeIcon icon={faLink} className="text-blue-400" />
        </div>
        <h3 className="text-xs font-bold text-white">Shared Links</h3>
      </div>

      <div className="text-center py-6">
        <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-zinc-800/50 flex items-center justify-center">
          <FontAwesomeIcon icon={faLink} className="text-2xl text-gray-600" />
        </div>
        <p className="text-sm text-gray-400">No links shared yet</p>
      </div>
    </div>
  );
}