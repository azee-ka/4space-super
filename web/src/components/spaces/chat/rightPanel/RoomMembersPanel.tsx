import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faWifi, faClock } from '@fortawesome/free-solid-svg-icons';

interface RoomMembersPanelProps {
  roomMembers: Array<any>;
  onlineUsers: Map<string, any>;
  onlineCount: number;
  inactiveCount: number;
}

export function RoomMembersPanel({
  roomMembers,
  onlineUsers,
  onlineCount,
  inactiveCount,
}: RoomMembersPanelProps) {
  const onlineIds = new Set(Array.from(onlineUsers.keys()));
  const members = roomMembers.map((member) => {
    const user = member.user || {};
    const displayName = user.display_name || user.username || 'Unknown';
    return {
      ...member,
      displayName,
      avatarUrl: user.avatar_url,
      isOnline: onlineIds.has(member.user_id),
    };
  });

  const onlineMembers = members.filter((member) => member.isOnline);
  const inactiveMembers = members.filter((member) => !member.isOnline);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-4 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faUsers} className="text-purple-400 text-sm" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Room Members</h3>
            <p className="text-xs text-gray-500">Presence and activity at a glance</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-zinc-800 p-3 text-center shadow-lg shadow-black/20">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <FontAwesomeIcon icon={faWifi} className="text-emerald-400 text-xs" />
              <p className="text-[11px] text-emerald-200/80">Online</p>
            </div>
            <p className="text-lg font-bold text-emerald-300">{onlineCount}</p>
          </div>
          <div className="rounded-2xl bg-zinc-800 p-3 text-center shadow-lg shadow-black/20">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <FontAwesomeIcon icon={faClock} className="text-amber-400 text-xs" />
              <p className="text-[11px] text-amber-200/80">Inactive</p>
            </div>
            <p className="text-lg font-bold text-amber-300">{inactiveCount}</p>
          </div>
          <div className="rounded-2xl bg-zinc-800 p-3 text-center shadow-lg shadow-black/20">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <FontAwesomeIcon icon={faUsers} className="text-cyan-400 text-xs" />
              <p className="text-[11px] text-cyan-200/80">Total</p>
            </div>
            <p className="text-lg font-bold text-cyan-300">{roomMembers.length}</p>
          </div>
        </div>

        {onlineMembers.length > 0 && (
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <FontAwesomeIcon icon={faWifi} className="text-emerald-400 text-sm" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Online Members</h3>
                <p className="text-xs text-gray-500">{onlineMembers.length} active now</p>
              </div>
            </div>
            <div className="space-y-2">
              {onlineMembers.map((member) => (
                <MemberRow key={member.user_id} member={member} />
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <FontAwesomeIcon icon={faClock} className="text-amber-400 text-sm" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Inactive Members</h3>
              <p className="text-xs text-gray-500">{inactiveMembers.length} away right now</p>
            </div>
          </div>
          <div className="space-y-2">
            {inactiveMembers.length > 0 ? (
              inactiveMembers.map((member) => (
                <MemberRow key={member.user_id} member={member} />
              ))
            ) : (
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 px-3 py-4 text-center text-xs text-gray-500">
                Everyone is currently active.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MemberRow({ member }: { member: any }) {
  const initial = member.displayName?.[0]?.toUpperCase() || '?';
  const statusLabel = member.isOnline ? 'Online' : 'Inactive';
  const statusBorder = member.isOnline ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300';
  const statusDot = member.isOnline ? 'bg-emerald-400' : 'bg-amber-400';

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
      <div className="flex items-center gap-3">
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.displayName}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-zinc-800/70 flex items-center justify-center text-xs font-semibold text-gray-300">
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm text-white font-medium truncate">{member.displayName}</p>
          <p className="text-xs text-gray-500 capitalize">{member.role || 'member'}</p>
        </div>
      </div>
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[11px] ${statusBorder}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
        <span>{statusLabel}</span>
      </div>
    </div>
  );
}
