import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faBrain } from '@fortawesome/free-solid-svg-icons';

export function MetricsTab({ onlineUsers }: { onlineUsers: Map<string, any> }) {
  const onlineCount = Array.from(onlineUsers.values()).filter((u: any) => u.status === 'online').length;

  return (
    <div className="p-4 space-y-3">
      {/* Activity Card */}
      <div className="p-3.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faFire} className="text-orange-400" />
          </div>
          <h3 className="text-xs font-bold text-white">Activity</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Online Now</span>
            <span className="text-base font-bold text-cyan-400">{onlineCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Messages Today</span>
            <span className="text-base font-bold text-purple-400">1,247</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Files Shared</span>
            <span className="text-base font-bold text-pink-400">89</span>
          </div>
        </div>
      </div>

      {/* Engagement Card */}
      <div className="p-3.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faBrain} className="text-purple-400" />
          </div>
          <h3 className="text-xs font-bold text-white">Engagement</h3>
        </div>
        <div className="space-y-2.5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400">Response Rate</span>
              <span className="text-xs font-bold text-cyan-400">87%</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-700/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-600"
                style={{ width: '87%' }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400">Avg. Response Time</span>
              <span className="text-xs font-bold text-green-400">12 min</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-700/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
                style={{ width: '65%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}