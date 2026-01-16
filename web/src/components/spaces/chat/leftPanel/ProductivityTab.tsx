import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faTasks, faStickyNote, faClock } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { useCreateRoom } from '../../../../hooks/useMessages';

export function ProductivityTab({ spaceId }: { spaceId: string }) {
  const createRoomMutation = useCreateRoom();

  const handleCreateMeeting = async () => {
    if (!spaceId) {
      alert('No space selected.');
      return;
    }

    const titleInput = window.prompt('Meeting title?');
    const title = titleInput?.trim();
    if (!title) return;

    const whenInput = window.prompt('When is the meeting? (optional)');
    const when = whenInput?.trim();

    try {
      const newRoom = await createRoomMutation.mutateAsync({
        space_id: spaceId,
        name: `Meeting: ${title}`,
        description: when ? `Scheduled for ${when}.` : 'Meeting room created from Productivity actions.',
        type: 'text',
        category: 'Meetings',
        is_private: false,
      });

      if (newRoom?.id) {
        window.location.hash = newRoom.id;
      }
    } catch (error) {
      console.error('Failed to create meeting room:', error);
      alert('Failed to create meeting room. Please try again.');
    }
  };

  const handleCreateTask = () => {

    const titleInput = window.prompt('Task title?');
    const title = titleInput?.trim();
    if (!title) return;

    const dueInput = window.prompt('Due date? (optional)');
    const due = dueInput?.trim();

    createRoomMutation
      .mutateAsync({
        space_id: spaceId,
        name: `Task: ${title}`,
        description: due ? `Due ${due}.` : 'Task created from Productivity actions.',
        type: 'text',
        category: 'Tasks',
        is_private: false,
      })
      .then((newRoom) => {
        if (newRoom?.id) {
          window.location.hash = newRoom.id;
        }
      })
      .catch((error) => {
        console.error('Failed to create task room:', error);
        alert('Failed to create task. Please try again.');
      });
  };

  const handleCreateNote = () => {

    const titleInput = window.prompt('Note title?');
    const title = titleInput?.trim();
    if (!title) return;

    const bodyInput = window.prompt('Add a quick note? (optional)');
    const body = bodyInput?.trim();

    createRoomMutation.mutateAsync({
      space_id: spaceId,
      name: `Note: ${title}`,
      description: body || 'Note created from Productivity actions.',
      type: 'text',
      category: 'Notes',
      is_private: false,
    }).then((newRoom) => {
      if (newRoom?.id) {
        window.location.hash = newRoom.id;
      }
    }).catch((error) => {
      console.error('Failed to create note:', error);
      alert('Failed to create note. Please try again.');
    });
  };

  const handleSetReminder = () => {
    const reminderInput = window.prompt('Reminder text?');
    const reminderText = reminderInput?.trim();
    if (!reminderText) return;

    const minutesInput = window.prompt('Remind in how many minutes?');
    const minutes = minutesInput ? Number(minutesInput) : NaN;
    if (!Number.isFinite(minutes) || minutes <= 0) {
      alert('Please enter a valid number of minutes.');
      return;
    }

    const delayMs = minutes * 60 * 1000;
    const scheduledAt = new Date(Date.now() + delayMs).toLocaleString();
    alert(`Reminder set for ${scheduledAt}.`);

    window.setTimeout(() => {
      alert(`Reminder: ${reminderText}`);
    }, delayMs);
  };

  return (
    <div className="p-4 space-y-1.5">
      {[
        { icon: faCalendar, label: 'Schedule Meeting', color: 'blue', bg: 'blue-500/10', onClick: handleCreateMeeting },
        { icon: faTasks, label: 'Create Task', color: 'green', bg: 'green-500/10', onClick: handleCreateTask },
        { icon: faStickyNote, label: 'New Note', color: 'purple', bg: 'purple-500/10', onClick: handleCreateNote },
        { icon: faClock, label: 'Set Reminder', color: 'orange', bg: 'orange-500/10', onClick: handleSetReminder },
      ].map((action) => (
        <motion.button
          key={action.label}
          onClick={action.onClick}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-3.5 py-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-all flex items-center gap-3 group"
        >
          <div className={`w-10 h-10 rounded-lg bg-${action.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <FontAwesomeIcon icon={action.icon} className={`text-${action.color}-400`} />
          </div>
          <span className="text-sm font-medium text-white">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}