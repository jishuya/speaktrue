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
  'chevron-up': { set: 'ion', iconName: 'chevron-up' },
  'chevron-down': { set: 'ion', iconName: 'chevron-down' },

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
  'heart-broken': { set: 'ion', iconName: 'heart-dislike' },
  'thumb-up': { set: 'ion', iconName: 'thumbs-up' },
  'thumb-down': { set: 'ion', iconName: 'thumbs-down' },
  'sentiment-satisfied': { set: 'mat', iconName: 'sentiment-satisfied' },
  'sentiment-dissatisfied': { set: 'mat', iconName: 'sentiment-dissatisfied' },
  'sentiment-neutral': { set: 'mat', iconName: 'sentiment-neutral' },
  'sentiment-very-satisfied': { set: 'mat', iconName: 'sentiment-very-satisfied' },
  'sentiment-very-dissatisfied': { set: 'mat', iconName: 'sentiment-very-dissatisfied' },

  // Emotion Icons (다양한 감정 표현용)
  'flame': { set: 'ion', iconName: 'flame' },                    // 분노/화남
  'flash': { set: 'ion', iconName: 'flash' },                    // 짜증
  'thunderstorm': { set: 'ion', iconName: 'thunderstorm' },      // 폭발적 분노
  'cloud': { set: 'ion', iconName: 'cloud' },                    // 답답함
  'cloudy': { set: 'ion', iconName: 'cloudy' },                  // 우울
  'rainy': { set: 'ion', iconName: 'rainy' },                    // 슬픔
  'water': { set: 'ion', iconName: 'water' },                    // 눈물/슬픔
  'snow': { set: 'ion', iconName: 'snow' },                      // 차가움/냉담
  'sunny': { set: 'ion', iconName: 'sunny' },                    // 기쁨/행복
  'partly-sunny': { set: 'ion', iconName: 'partly-sunny' },      // 희망
  'moon': { set: 'ion', iconName: 'moon' },                      // 외로움/공허함
  'star': { set: 'ion', iconName: 'star' },                      // 설렘/기대
  'scale': { set: 'mci', iconName: 'scale-balance' },            // 불공평함
  'shield': { set: 'ion', iconName: 'shield' },                  // 방어적/불신
  'shield-checkmark': { set: 'ion', iconName: 'shield-checkmark' }, // 안심
  'ban': { set: 'ion', iconName: 'ban' },                        // 거부/억압
  'alert-circle': { set: 'ion', iconName: 'alert-circle' },      // 불안/걱정
  'time': { set: 'ion', iconName: 'time' },                      // 지침/피로
  'battery-dead': { set: 'ion', iconName: 'battery-dead' },      // 무기력
  'battery-half': { set: 'ion', iconName: 'battery-half' },      // 피곤
  'leaf': { set: 'ion', iconName: 'leaf' },                      // 평온/차분
  'rose': { set: 'mci', iconName: 'flower-tulip' },              // 감사/애정
  'gift': { set: 'ion', iconName: 'gift' },                      // 감사
  'ribbon': { set: 'ion', iconName: 'ribbon' },                  // 뿌듯/성취
  'trophy': { set: 'ion', iconName: 'trophy' },                  // 성취감
  'medal': { set: 'ion', iconName: 'medal' },                    // 인정받음
  'hand-left': { set: 'ion', iconName: 'hand-left' },            // 거부/정지
  'hand-right': { set: 'ion', iconName: 'hand-right' },          // 도움
  'eye': { set: 'ion', iconName: 'eye' },                        // 시기/질투
  'eye-off': { set: 'ion', iconName: 'eye-off' },                // 회피
  'skull': { set: 'ion', iconName: 'skull' },                    // 절망
  'sad': { set: 'ion', iconName: 'sad' },                        // 슬픔
  'happy': { set: 'ion', iconName: 'happy' },                    // 기쁨
  'sparkles': { set: 'ion', iconName: 'sparkles' },              // 설렘
  'cafe': { set: 'ion', iconName: 'cafe' },                      // 편안함
  'bed': { set: 'ion', iconName: 'bed' },                        // 피곤
  'fitness': { set: 'ion', iconName: 'fitness' },                // 활력/자신감
  'pulse': { set: 'ion', iconName: 'pulse' },                    // 긴장/불안
  'nuclear': { set: 'ion', iconName: 'nuclear' },                // 스트레스
  'bonfire': { set: 'ion', iconName: 'bonfire' },                // 따뜻함/위로
  'prism': { set: 'ion', iconName: 'prism' },                    // 혼란
  'shuffle': { set: 'ion', iconName: 'shuffle' },                // 복잡함
  'help-buoy': { set: 'ion', iconName: 'help-buoy' },            // 도움필요
  'compass': { set: 'ion', iconName: 'compass' },                // 방향상실
  'footsteps': { set: 'ion', iconName: 'footsteps' },            // 불안/초조
  'infinite': { set: 'ion', iconName: 'infinite' },              // 지속적 감정
  'megaphone': { set: 'ion', iconName: 'megaphone' },            // 억울함 호소
  'volume-mute': { set: 'ion', iconName: 'volume-mute' },        // 답답함/억압
  'lock-closed': { set: 'ion', iconName: 'lock-closed' },        // 억압감
  'unlink': { set: 'ion', iconName: 'unlink' },                  // 단절/외로움
  'bandage': { set: 'ion', iconName: 'bandage' },                  // 상처

  // Fallback shapes (매핑에 없는 감정용)
  'ellipse': { set: 'ion', iconName: 'ellipse' },
  'square': { set: 'ion', iconName: 'square' },
  'triangle': { set: 'ion', iconName: 'triangle' },
  'diamond': { set: 'ion', iconName: 'diamond' },
  'heart': { set: 'ion', iconName: 'heart' },
  'flower': { set: 'ion', iconName: 'flower' },
  'planet': { set: 'ion', iconName: 'planet' },

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
  'trending-down': { set: 'ion', iconName: 'trending-down' },
  'language': { set: 'ion', iconName: 'globe' },

  // AI & Tech
  'auto-awesome': { set: 'mat', iconName: 'auto-awesome' },
  'psychology': { set: 'mat', iconName: 'psychology' },
  'smart-toy': { set: 'mat', iconName: 'smart-toy' },
  'tips-and-updates': { set: 'mat', iconName: 'tips-and-updates' },

  // Misc
  'apple': { set: 'ion', iconName: 'logo-apple' },
  'bolt': { set: 'ion', iconName: 'flash' },
  'handshake': { set: 'mci', iconName: 'handshake' },
  'wifi-off': { set: 'ion', iconName: 'wifi' },
  'ear-hearing': { set: 'mci', iconName: 'ear-hearing' },
  'pricetag': { set: 'ion', iconName: 'pricetag-outline' },
  'pricetags': { set: 'ion', iconName: 'pricetags' },
  'link': { set: 'ion', iconName: 'link' },

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
