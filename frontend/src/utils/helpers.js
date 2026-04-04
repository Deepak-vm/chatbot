import { CONVERSATION_GROUPS } from './constants';

/**
 * Generate a unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format a date into a readable timestamp
 */
export const formatTimestamp = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Group conversations by time period
 */
export const groupConversationsByDate = (conversations) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart - 86400000);
  const sevenDaysAgo = new Date(todayStart - 7 * 86400000);

  const groups = {
    [CONVERSATION_GROUPS.TODAY]: [],
    [CONVERSATION_GROUPS.YESTERDAY]: [],
    [CONVERSATION_GROUPS.PREVIOUS_7_DAYS]: [],
    [CONVERSATION_GROUPS.OLDER]: [],
  };

  conversations.forEach((conv) => {
    const convDate = new Date(conv.createdAt);
    if (convDate >= todayStart) {
      groups[CONVERSATION_GROUPS.TODAY].push(conv);
    } else if (convDate >= yesterdayStart) {
      groups[CONVERSATION_GROUPS.YESTERDAY].push(conv);
    } else if (convDate >= sevenDaysAgo) {
      groups[CONVERSATION_GROUPS.PREVIOUS_7_DAYS].push(conv);
    } else {
      groups[CONVERSATION_GROUPS.OLDER].push(conv);
    }
  });

  return groups;
};

/**
 * Truncate a string to a max length
 */
export const truncate = (str, max = 40) => {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get initials from a name
 */
export const getInitials = (name = 'User') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Debounce a function
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
