// 감정별 아이콘 및 색상 매핑
// 프론트엔드에서 감정 이름을 받아 아이콘과 색상을 결정
// 다양한 아이콘을 사용하여 감정을 직관적으로 표현

export const EMOTION_MAP = {
  // 부정적 감정 - 강한 감정 (화남/분노)
  '화남': { icon: 'flame', color: '#E74C3C' },
  '분노': { icon: 'thunderstorm', color: '#C0392B' },
  '짜증': { icon: 'flash', color: '#E67E22' },
  '짜증남': { icon: 'flash', color: '#D35400' },
  '억울함': { icon: 'megaphone', color: '#E57E22' },
  '억울': { icon: 'megaphone', color: '#D35400' },

  // 부정적 감정 - 슬픔/우울
  '슬픔': { icon: 'rainy', color: '#3498DB' },
  '우울': { icon: 'cloudy', color: '#2980B9' },
  '우울함': { icon: 'cloudy', color: '#5D6D7E' },
  '외로움': { icon: 'moon', color: '#8E44AD' },
  '공허함': { icon: 'moon', color: '#9B59B6' },
  '허무함': { icon: 'moon', color: '#7D3C98' },

  // 부정적 감정 - 불안/걱정
  '불안': { icon: 'pulse', color: '#F39C12' },
  '불안함': { icon: 'pulse', color: '#E67E22' },
  '걱정': { icon: 'alert-circle', color: '#F1C40F' },
  '걱정됨': { icon: 'alert-circle', color: '#D4AC0D' },
  '두려움': { icon: 'alert-circle', color: '#E74C3C' },
  '무서움': { icon: 'skull', color: '#C0392B' },

  // 부정적 감정 - 답답함/지침
  '답답함': { icon: 'cloud', color: '#F5A623' },
  '답답': { icon: 'cloud', color: '#E59866' },
  '지침': { icon: 'time', color: '#95A5A6' },
  '지친': { icon: 'time', color: '#7F8C8D' },
  '피곤함': { icon: 'battery-half', color: '#BDC3C7' },
  '피곤': { icon: 'battery-half', color: '#AEBDC7' },
  '피로': { icon: 'bed', color: '#78909C' },
  '피로감': { icon: 'bed', color: '#607D8B' },
  '무력감': { icon: 'battery-dead', color: '#566573' },
  '무기력': { icon: 'battery-dead', color: '#5D6D7E' },
  '스트레스': { icon: 'nuclear', color: '#FF5722' },
  '부담감': { icon: 'fitness', color: '#8D6E63' },
  '압박감': { icon: 'fitness', color: '#A1887F' },

  // 부정적 감정 - 서운함/실망/좌절/상처
  '서운함': { icon: 'heart-broken', color: '#E59866' },
  '서운': { icon: 'heart-broken', color: '#D68910' },
  '상처': { icon: 'bandage', color: '#E57373' },
  '상처받음': { icon: 'bandage', color: '#EF5350' },
  '실망': { icon: 'thumb-down', color: '#AF7AC5' },
  '실망감': { icon: 'thumb-down', color: '#9B59B6' },
  '좌절': { icon: 'trending-down', color: '#7B1FA2' },
  '좌절감': { icon: 'trending-down', color: '#6A1B9A' },
  '절망': { icon: 'skull', color: '#4A148C' },
  '배신감': { icon: 'shield', color: '#922B21' },
  '불신': { icon: 'shield', color: '#6C3483' },

  // 부정적 감정 - 불공평/부당함
  '불공평함': { icon: 'scale', color: '#DC7633' },
  '불공평': { icon: 'scale', color: '#CA6F1E' },
  '부당함': { icon: 'scale', color: '#BA4A00' },
  '억압감': { icon: 'lock-closed', color: '#6E2C00' },

  // 부정적 감정 - 수치/죄책감
  '부끄러움': { icon: 'eye-off', color: '#EC7063' },
  '수치심': { icon: 'eye-off', color: '#CD6155' },
  '죄책감': { icon: 'sad', color: '#A93226' },
  '미안함': { icon: 'sad', color: '#F1948A' },

  // 부정적 감정 - 질투/시기
  '질투': { icon: 'eye', color: '#1ABC9C' },
  '시기': { icon: 'eye', color: '#16A085' },
  '부러움': { icon: 'eye', color: '#48C9B0' },

  // 긍정적 감정 - 기쁨/행복
  '기쁨': { icon: 'sunny', color: '#F1C40F' },
  '행복': { icon: 'sunny', color: '#F4D03F' },
  '행복함': { icon: 'sunny', color: '#F7DC6F' },
  '즐거움': { icon: 'happy', color: '#58D68D' },
  '신남': { icon: 'happy', color: '#82E0AA' },

  // 긍정적 감정 - 안도/편안
  '안도': { icon: 'shield-checkmark', color: '#3498DB' },
  '안심': { icon: 'shield-checkmark', color: '#5DADE2' },
  '편안함': { icon: 'cafe', color: '#5B8DEF' },
  '편안': { icon: 'cafe', color: '#7FB3D5' },
  '평온': { icon: 'leaf', color: '#85C1E9' },
  '차분함': { icon: 'leaf', color: '#AED6F1' },

  // 긍정적 감정 - 이해/공감
  '이해받음': { icon: 'ear-hearing', color: '#5B8DEF' },
  '이해됨': { icon: 'ear-hearing', color: '#7FB3D5' },
  '공감받음': { icon: 'people', color: '#85C1E9' },
  '인정받음': { icon: 'medal', color: '#76D7C4' },
  '존중받음': { icon: 'medal', color: '#73C6B6' },

  // 긍정적 감정 - 감사/사랑
  '감사': { icon: 'gift', color: '#F39C12' },
  '감사함': { icon: 'gift', color: '#E67E22' },
  '고마움': { icon: 'rose', color: '#F7DC6F' },
  '사랑': { icon: 'favorite', color: '#E91E63' },
  '애정': { icon: 'favorite', color: '#F06292' },

  // 긍정적 감정 - 희망/기대
  '희망': { icon: 'partly-sunny', color: '#00BCD4' },
  '기대': { icon: 'star', color: '#26C6DA' },
  '기대감': { icon: 'star', color: '#4DD0E1' },
  '설렘': { icon: 'sparkles', color: '#FF7043' },

  // 긍정적 감정 - 자신감/뿌듯
  '자신감': { icon: 'fitness', color: '#FF9800' },
  '뿌듯함': { icon: 'ribbon', color: '#FFB74D' },
  '뿌듯': { icon: 'ribbon', color: '#FFC107' },
  '성취감': { icon: 'trophy', color: '#FFA726' },
  '만족': { icon: 'thumb-up', color: '#66BB6A' },
  '만족감': { icon: 'thumb-up', color: '#81C784' },

  // 중립적 감정
  '혼란': { icon: 'prism', color: '#9E9E9E' },
  '혼란스러움': { icon: 'prism', color: '#757575' },
  '복잡함': { icon: 'shuffle', color: '#78909C' },
  '당황': { icon: 'help-buoy', color: '#FFAB91' },
  '당황스러움': { icon: 'help-buoy', color: '#FF8A65' },
  '난처함': { icon: 'help-buoy', color: '#FFCC80' },
  '놀람': { icon: 'flash', color: '#FFD54F' },
  '의아함': { icon: 'help', color: '#90A4AE' },
  '무관심': { icon: 'remove', color: '#B0BEC5' },
  '담담함': { icon: 'leaf', color: '#CFD8DC' },

  // 부정적 감정 - 불편함
  '불편함': { icon: 'hand-left', color: '#FF8A65' },
  '불편': { icon: 'hand-left', color: '#FF7043' },
  '거북함': { icon: 'hand-left', color: '#FFAB91' },
  '불쾌함': { icon: 'ban', color: '#EF5350' },
  '불쾌': { icon: 'ban', color: '#E53935' },

  // 긍정적 감정 - 연결/유대
  '연결감': { icon: 'link', color: '#4DB6AC' },
  '소속감': { icon: 'people', color: '#26A69A' },
  '친밀감': { icon: 'favorite', color: '#00897B' },
  '유대감': { icon: 'handshake', color: '#00796B' },

  // 욕구/필요 관련 (AI 분석에서 자주 사용)
  '인정의 욕구': { icon: 'medal', color: '#E91E63' },
  '인정 욕구': { icon: 'medal', color: '#EC407A' },
  '압도감': { icon: 'thunderstorm', color: '#F57F17' },
  '압도': { icon: 'thunderstorm', color: '#F9A825' },
  '자율성': { icon: 'lock-open', color: '#1565C0' },
  '자율성 욕구': { icon: 'lock-open', color: '#1976D2' },
  '통제감': { icon: 'options', color: '#0D47A1' },
  '통제 욕구': { icon: 'options', color: '#1565C0' },
  '안정감': { icon: 'home', color: '#2E7D32' },
  '안전 욕구': { icon: 'shield-checkmark', color: '#388E3C' },
  '존중 욕구': { icon: 'ribbon', color: '#7B1FA2' },
  '이해 욕구': { icon: 'ear-hearing', color: '#5B8DEF' },
  '공감 욕구': { icon: 'people', color: '#00ACC1' },
  '소통 욕구': { icon: 'chatbubbles', color: '#00897B' },
  '연결 욕구': { icon: 'link', color: '#4DB6AC' },
  '독립심': { icon: 'person', color: '#5C6BC0' },
  '주도성': { icon: 'flag', color: '#FF7043' },
  '성장 욕구': { icon: 'trending-up', color: '#66BB6A' },

  // 관계/상황 감정 (AI 분석에서 자주 사용)
  '방어적': { icon: 'shield', color: '#78909C' },
  '공격적': { icon: 'flame', color: '#D32F2F' },
  '회피적': { icon: 'eye-off', color: '#90A4AE' },
  '수동적': { icon: 'remove', color: '#B0BEC5' },
  '적극적': { icon: 'arrow-forward', color: '#4CAF50' },
  '소극적': { icon: 'arrow-back', color: '#9E9E9E' },
  '개방적': { icon: 'open', color: '#42A5F5' },
  '폐쇄적': { icon: 'lock-closed', color: '#607D8B' },
  '협력적': { icon: 'handshake', color: '#26A69A' },
  '경쟁적': { icon: 'trophy', color: '#FF9800' },
  '의존적': { icon: 'people', color: '#AB47BC' },
  '거리감': { icon: 'resize', color: '#78909C' },
  '단절감': { icon: 'cut', color: '#455A64' },
  '소외감': { icon: 'person-remove', color: '#5D6D7E' },
  '고립감': { icon: 'person', color: '#37474F' },
};

// 기본값 (매핑에 없는 감정용)
export const DEFAULT_EMOTION = {
  icon: 'help',
  color: '#9E9E9E',
};

// 매핑에 없는 감정용 랜덤 fallback 아이콘/색상 조합
const FALLBACK_STYLES = [
  { icon: 'ellipse', color: '#9575CD' },
  { icon: 'square', color: '#7986CB' },
  { icon: 'triangle', color: '#64B5F6' },
  { icon: 'diamond', color: '#4FC3F7' },
  { icon: 'star', color: '#4DD0E1' },
  { icon: 'heart', color: '#4DB6AC' },
  { icon: 'water', color: '#81C784' },
  { icon: 'leaf', color: '#AED581' },
  { icon: 'flower', color: '#FFD54F' },
  { icon: 'planet', color: '#FFB74D' },
  { icon: 'sparkles', color: '#FF8A65' },
  { icon: 'prism', color: '#A1887F' },
  { icon: 'cloud', color: '#90CAF9' },
  { icon: 'moon', color: '#CE93D8' },
  { icon: 'sunny', color: '#FFCC80' },
  { icon: 'snow', color: '#B3E5FC' },
  { icon: 'flame', color: '#FFAB91' },
  { icon: 'flash', color: '#FFF59D' },
  { icon: 'ribbon', color: '#F48FB1' },
  { icon: 'compass', color: '#80DEEA' },
];

// 감정 이름에 기반한 일관된 해시 생성 (같은 감정은 항상 같은 스타일)
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// 감정 이름으로 아이콘과 색상 가져오기
export function getEmotionStyle(emotionName) {
  if (EMOTION_MAP[emotionName]) {
    return EMOTION_MAP[emotionName];
  }

  // 매핑에 없으면 감정 이름 기반으로 일관된 fallback 스타일 반환
  const index = hashString(emotionName) % FALLBACK_STYLES.length;
  return FALLBACK_STYLES[index];
}

// 감정 배열에 아이콘과 색상 매핑하기
export function mapEmotionsWithStyle(emotions) {
  return emotions.map((item, index) => {
    const style = getEmotionStyle(item.emotion);
    return {
      ...item,
      icon: style.icon,
      color: style.color,
    };
  });
}
