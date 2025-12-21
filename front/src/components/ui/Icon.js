import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

// Icon mapping: name -> { set, iconName }
// set: 'ion' (Ionicons), 'mat' (MaterialIcons), 'mci' (MaterialCommunityIcons)
const ICON_MAP = {
  // Navigation
  'arrow-back': { set: 'ion', iconName: 'arrow-back' },
  'arrow-back-ios': { set: 'ion', iconName: 'chevron-back' },
  'arrow-forward': { set: 'ion', iconName: 'arrow-forward' },
  'chevron-right': { set: 'ion', iconName: 'chevron-forward' },
  'chevron-left': { set: 'ion', iconName: 'chevron-back' },
  'close': { set: 'ion', iconName: 'close' },
  'menu': { set: 'ion', iconName: 'menu' },
  'more-horiz': { set: 'mat', iconName: 'more-horiz' },
  'more-vert': { set: 'mat', iconName: 'more-vert' },
  'expand-more': { set: 'mat', iconName: 'expand-more' },
  'expand-less': { set: 'mat', iconName: 'expand-less' },

  // Actions
  'edit': { set: 'mat', iconName: 'edit' },
  'delete': { set: 'mat', iconName: 'delete-outline' },
  'content-copy': { set: 'mat', iconName: 'content-copy' },
  'send': { set: 'ion', iconName: 'send' },
  'search': { set: 'ion', iconName: 'search' },
  'search-off': { set: 'mat', iconName: 'search-off' },
  'add': { set: 'ion', iconName: 'add' },
  'add-circle-outline': { set: 'ion', iconName: 'add-circle-outline' },
  'remove': { set: 'ion', iconName: 'remove-circle-outline' },
  'refresh': { set: 'ion', iconName: 'refresh' },
  'share': { set: 'ion', iconName: 'share-outline' },
  'download': { set: 'mat', iconName: 'file-download' },
  'upload': { set: 'mat', iconName: 'file-upload' },
  'logout': { set: 'mat', iconName: 'logout' },
  'login': { set: 'mat', iconName: 'login' },

  // Media
  'play-arrow': { set: 'ion', iconName: 'play' },
  'pause': { set: 'ion', iconName: 'pause' },
  'stop': { set: 'ion', iconName: 'stop' },
  'mic': { set: 'ion', iconName: 'mic' },
  'mic-off': { set: 'ion', iconName: 'mic-off' },
  'volume-up': { set: 'ion', iconName: 'volume-high' },
  'volume-off': { set: 'ion', iconName: 'volume-mute' },
  'camera': { set: 'ion', iconName: 'camera' },
  'image': { set: 'ion', iconName: 'image' },

  // Status & Feedback
  'check': { set: 'ion', iconName: 'checkmark' },
  'check-circle': { set: 'ion', iconName: 'checkmark-circle' },
  'error': { set: 'mat', iconName: 'error' },
  'error-outline': { set: 'mat', iconName: 'error-outline' },
  'warning': { set: 'ion', iconName: 'warning' },
  'info': { set: 'ion', iconName: 'information-circle' },
  'help': { set: 'ion', iconName: 'help-circle' },
  'help-outline': { set: 'ion', iconName: 'help-circle-outline' },

  // Communication
  'chat-bubble': { set: 'ion', iconName: 'chatbubble' },
  'chat': { set: 'ion', iconName: 'chatbubbles-outline' },
  'mail': { set: 'ion', iconName: 'mail' },
  'notifications': { set: 'ion', iconName: 'notifications' },
  'notifications-off': { set: 'ion', iconName: 'notifications-off' },

  // User & People
  'person': { set: 'ion', iconName: 'person' },
  'people': { set: 'ion', iconName: 'people' },
  'diversity-1': { set: 'mci', iconName: 'account-group' },
  'account-circle': { set: 'mat', iconName: 'account-circle' },

  // Emotion & Sentiment
  'favorite': { set: 'ion', iconName: 'heart' },
  'favorite-border': { set: 'ion', iconName: 'heart-outline' },
  'thumb-up': { set: 'ion', iconName: 'thumbs-up' },
  'thumb-down': { set: 'ion', iconName: 'thumbs-down' },
  'sentiment-satisfied': { set: 'mat', iconName: 'sentiment-satisfied' },
  'sentiment-dissatisfied': { set: 'mat', iconName: 'sentiment-dissatisfied' },
  'sentiment-neutral': { set: 'mat', iconName: 'sentiment-neutral' },
  'sentiment-very-satisfied': { set: 'mat', iconName: 'sentiment-very-satisfied' },

  // Nature & Wellness
  'spa': { set: 'mat', iconName: 'spa' },
  'local-florist': { set: 'mat', iconName: 'local-florist' },
  'eco': { set: 'mat', iconName: 'eco' },

  // Objects
  'lightbulb': { set: 'ion', iconName: 'bulb' },
  'lock': { set: 'ion', iconName: 'lock-closed' },
  'lock-open': { set: 'ion', iconName: 'lock-open' },
  'visibility': { set: 'ion', iconName: 'eye' },
  'visibility-off': { set: 'ion', iconName: 'eye-off' },
  'settings': { set: 'ion', iconName: 'settings' },
  'history': { set: 'mat', iconName: 'history' },
  'home': { set: 'ion', iconName: 'home' },
  'inbox': { set: 'mat', iconName: 'inbox' },
  'description': { set: 'ion', iconName: 'document-text-outline' },
  'menu-book': { set: 'mat', iconName: 'menu-book' },
  'analytics': { set: 'ion', iconName: 'analytics' },
  'trending-up': { set: 'ion', iconName: 'trending-up' },
  'language': { set: 'ion', iconName: 'globe' },

  // AI & Tech
  'auto-awesome': { set: 'mat', iconName: 'auto-awesome' },
  'psychology': { set: 'mat', iconName: 'psychology' },
  'smart-toy': { set: 'mat', iconName: 'smart-toy' },

  // Misc
  'apple': { set: 'ion', iconName: 'logo-apple' },
  'bolt': { set: 'ion', iconName: 'flash' },
  'handshake': { set: 'mci', iconName: 'handshake' },
  'wifi-off': { set: 'ion', iconName: 'wifi' },
  'ear-hearing': { set: 'mci', iconName: 'ear-hearing' },
  'pricetag': { set: 'ion', iconName: 'pricetag-outline' },
  'pricetags': { set: 'ion', iconName: 'pricetags' },

  // Default fallback
  'default': { set: 'ion', iconName: 'help-circle' },
};

export default function Icon({
  name,
  size = 24,
  color = COLORS.textPrimary,
  style,
}) {
  const iconConfig = ICON_MAP[name] || ICON_MAP['default'];
  const { set, iconName } = iconConfig;

  const iconProps = {
    name: iconName,
    size,
    color,
    style,
  };

  switch (set) {
    case 'mat':
      return <MaterialIcons {...iconProps} />;
    case 'mci':
      return <MaterialCommunityIcons {...iconProps} />;
    case 'ion':
    default:
      return <Ionicons {...iconProps} />;
  }
}

// Export mapping for reference
export { ICON_MAP };
