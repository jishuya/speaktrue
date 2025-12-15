import { Iconify } from 'react-native-iconify';
import { COLORS } from '../../constants/theme';

// MaterialIcons name -> Iconify icon name mapping (outline style)
const ICON_MAP = {
  // Navigation
  'arrow-back': 'solar:arrow-left-linear',
  'arrow-back-ios': 'solar:arrow-left-linear',
  'arrow-forward': 'solar:arrow-right-linear',
  'chevron-right': 'solar:alt-arrow-right-linear',
  'chevron-left': 'solar:alt-arrow-left-linear',
  'close': 'solar:close-circle-linear',
  'menu': 'solar:hamburger-menu-linear',
  'more-horiz': 'solar:menu-dots-linear',
  'more-vert': 'solar:menu-dots-bold',
  'expand-more': 'solar:alt-arrow-down-linear',
  'expand-less': 'solar:alt-arrow-up-linear',

  // Actions
  'edit': 'solar:pen-linear',
  'delete': 'solar:trash-bin-minimalistic-linear',
  'content-copy': 'solar:copy-linear',
  'send': 'solar:plain-linear',
  'search': 'solar:magnifer-linear',
  'search-off': 'solar:magnifer-zoom-out-linear',
  'add': 'solar:add-circle-linear',
  'add-circle-outline': 'solar:add-circle-linear',
  'remove': 'solar:minus-circle-linear',
  'refresh': 'solar:refresh-linear',
  'share': 'solar:share-linear',
  'download': 'solar:download-linear',
  'upload': 'solar:upload-linear',
  'logout': 'solar:logout-2-linear',
  'login': 'solar:login-2-linear',

  // Media
  'play-arrow': 'solar:play-linear',
  'pause': 'solar:pause-linear',
  'stop': 'solar:stop-linear',
  'mic': 'solar:microphone-linear',
  'mic-off': 'solar:microphone-large-linear',
  'volume-up': 'solar:volume-loud-linear',
  'volume-off': 'solar:volume-cross-linear',
  'camera': 'solar:camera-linear',
  'image': 'solar:gallery-linear',

  // Status & Feedback
  'check': 'solar:check-read-linear',
  'check-circle': 'solar:check-circle-linear',
  'error': 'solar:close-circle-linear',
  'error-outline': 'solar:danger-circle-linear',
  'warning': 'solar:danger-triangle-linear',
  'info': 'solar:info-circle-linear',
  'help': 'solar:question-circle-linear',

  // Communication
  'chat-bubble': 'solar:chat-round-linear',
  'chat': 'solar:chat-line-linear',
  'mail': 'solar:letter-linear',
  'notifications': 'solar:bell-linear',
  'notifications-off': 'solar:bell-off-linear',

  // User & People
  'person': 'solar:user-linear',
  'people': 'solar:users-group-rounded-linear',
  'diversity-1': 'solar:users-group-two-rounded-linear',
  'account-circle': 'solar:user-circle-linear',

  // Emotion & Sentiment
  'favorite': 'solar:heart-linear',
  'favorite-border': 'solar:heart-linear',
  'thumb-up': 'solar:like-linear',
  'thumb-down': 'solar:dislike-linear',
  'sentiment-satisfied': 'solar:emoji-funny-circle-linear',
  'sentiment-dissatisfied': 'solar:sad-circle-linear',
  'sentiment-neutral': 'solar:face-scan-circle-linear',
  'sentiment-very-satisfied': 'solar:emoji-funny-circle-linear',

  // Nature & Wellness
  'spa': 'solar:leaf-linear',
  'local-florist': 'solar:flower-linear',
  'eco': 'solar:leaf-linear',

  // Objects
  'lightbulb': 'solar:lightbulb-linear',
  'lock': 'solar:lock-linear',
  'lock-open': 'solar:lock-unlocked-linear',
  'visibility': 'solar:eye-linear',
  'visibility-off': 'solar:eye-closed-linear',
  'settings': 'solar:settings-linear',
  'history': 'solar:history-linear',
  'home': 'solar:home-smile-linear',
  'inbox': 'solar:inbox-linear',
  'description': 'solar:document-text-linear',
  'menu-book': 'solar:book-linear',
  'analytics': 'solar:chart-linear',
  'trending-up': 'solar:graph-up-linear',
  'language': 'solar:global-linear',

  // AI & Tech
  'auto-awesome': 'solar:magic-stick-3-linear',
  'psychology': 'solar:brain-linear',
  'smart-toy': 'solar:ghost-smile-linear',

  // Misc
  'apple': 'solar:apple-linear',
  'bolt': 'solar:bolt-linear',
  'handshake': 'solar:hand-shake-linear',
  'wifi-off': 'solar:wifi-router-linear',

  // Default fallback
  'default': 'solar:question-circle-linear',
};

export default function Icon({
  name,
  size = 24,
  color = COLORS.textPrimary,
  style,
}) {
  const iconName = ICON_MAP[name] || ICON_MAP['default'];

  return (
    <Iconify
      icon={iconName}
      size={size}
      color={color}
      style={style}
    />
  );
}

// Export mapping for reference
export { ICON_MAP };
