// 감정별 아이콘 및 색상 매핑
// 프론트엔드에서 감정 이름을 받아 아이콘과 색상을 결정

export const EMOTION_MAP = {
  // 부정적 감정 - 강한 감정
  '화남': { icon: 'sentiment-very-dissatisfied', color: '#E74C3C' },
  '분노': { icon: 'sentiment-very-dissatisfied', color: '#C0392B' },
  '짜증': { icon: 'sentiment-dissatisfied', color: '#E67E22' },
  '짜증남': { icon: 'sentiment-dissatisfied', color: '#E67E22' },
  '억울함': { icon: 'sentiment-dissatisfied', color: '#D35400' },
  '억울': { icon: 'sentiment-dissatisfied', color: '#D35400' },

  // 부정적 감정 - 슬픔/우울
  '슬픔': { icon: 'sentiment-dissatisfied', color: '#3498DB' },
  '슬픔': { icon: 'sentiment-dissatisfied', color: '#3498DB' },
  '우울': { icon: 'sentiment-dissatisfied', color: '#2980B9' },
  '우울함': { icon: 'sentiment-dissatisfied', color: '#2980B9' },
  '외로움': { icon: 'sentiment-dissatisfied', color: '#8E44AD' },
  '외로움': { icon: 'sentiment-dissatisfied', color: '#8E44AD' },
  '공허함': { icon: 'sentiment-neutral', color: '#9B59B6' },
  '허무함': { icon: 'sentiment-neutral', color: '#7D3C98' },

  // 부정적 감정 - 불안/걱정
  '불안': { icon: 'sentiment-neutral', color: '#F39C12' },
  '불안함': { icon: 'sentiment-neutral', color: '#F39C12' },
  '걱정': { icon: 'sentiment-neutral', color: '#F1C40F' },
  '걱정됨': { icon: 'sentiment-neutral', color: '#F1C40F' },
  '두려움': { icon: 'sentiment-dissatisfied', color: '#E74C3C' },
  '무서움': { icon: 'sentiment-dissatisfied', color: '#C0392B' },

  // 부정적 감정 - 답답함/지침
  '답답함': { icon: 'sentiment-dissatisfied', color: '#F5A623' },
  '답답': { icon: 'sentiment-dissatisfied', color: '#F5A623' },
  '지침': { icon: 'sentiment-dissatisfied', color: '#95A5A6' },
  '지친': { icon: 'sentiment-dissatisfied', color: '#7F8C8D' },
  '피곤함': { icon: 'sentiment-neutral', color: '#BDC3C7' },
  '무력감': { icon: 'sentiment-dissatisfied', color: '#566573' },
  '무기력': { icon: 'sentiment-dissatisfied', color: '#5D6D7E' },

  // 부정적 감정 - 서운함/실망
  '서운함': { icon: 'sentiment-dissatisfied', color: '#E59866' },
  '서운': { icon: 'sentiment-dissatisfied', color: '#E59866' },
  '실망': { icon: 'sentiment-dissatisfied', color: '#AF7AC5' },
  '실망감': { icon: 'sentiment-dissatisfied', color: '#AF7AC5' },
  '배신감': { icon: 'sentiment-very-dissatisfied', color: '#922B21' },
  '불신': { icon: 'sentiment-dissatisfied', color: '#6C3483' },

  // 부정적 감정 - 불공평/부당함
  '불공평함': { icon: 'sentiment-dissatisfied', color: '#DC7633' },
  '불공평': { icon: 'sentiment-dissatisfied', color: '#DC7633' },
  '부당함': { icon: 'sentiment-dissatisfied', color: '#BA4A00' },
  '억압감': { icon: 'sentiment-dissatisfied', color: '#6E2C00' },

  // 부정적 감정 - 수치/죄책감
  '부끄러움': { icon: 'sentiment-neutral', color: '#EC7063' },
  '수치심': { icon: 'sentiment-dissatisfied', color: '#CD6155' },
  '죄책감': { icon: 'sentiment-dissatisfied', color: '#A93226' },
  '미안함': { icon: 'sentiment-neutral', color: '#F1948A' },

  // 부정적 감정 - 질투/시기
  '질투': { icon: 'sentiment-dissatisfied', color: '#1ABC9C' },
  '시기': { icon: 'sentiment-dissatisfied', color: '#16A085' },
  '부러움': { icon: 'sentiment-neutral', color: '#48C9B0' },

  // 긍정적 감정 - 기쁨/행복
  '기쁨': { icon: 'sentiment-very-satisfied', color: '#27AE60' },
  '행복': { icon: 'sentiment-very-satisfied', color: '#2ECC71' },
  '행복함': { icon: 'sentiment-very-satisfied', color: '#2ECC71' },
  '즐거움': { icon: 'sentiment-very-satisfied', color: '#58D68D' },
  '신남': { icon: 'sentiment-very-satisfied', color: '#82E0AA' },

  // 긍정적 감정 - 안도/편안
  '안도': { icon: 'sentiment-satisfied', color: '#3498DB' },
  '안심': { icon: 'sentiment-satisfied', color: '#5DADE2' },
  '편안함': { icon: 'sentiment-very-satisfied', color: '#5B8DEF' },
  '편안': { icon: 'sentiment-very-satisfied', color: '#5B8DEF' },
  '평온': { icon: 'sentiment-satisfied', color: '#85C1E9' },
  '차분함': { icon: 'sentiment-satisfied', color: '#AED6F1' },

  // 긍정적 감정 - 이해/공감
  '이해받음': { icon: 'sentiment-satisfied', color: '#5B8DEF' },
  '이해됨': { icon: 'sentiment-satisfied', color: '#5B8DEF' },
  '공감받음': { icon: 'sentiment-satisfied', color: '#7FB3D5' },
  '인정받음': { icon: 'sentiment-very-satisfied', color: '#76D7C4' },
  '존중받음': { icon: 'sentiment-very-satisfied', color: '#73C6B6' },

  // 긍정적 감정 - 감사/사랑
  '감사': { icon: 'sentiment-very-satisfied', color: '#F39C12' },
  '감사함': { icon: 'sentiment-very-satisfied', color: '#F39C12' },
  '고마움': { icon: 'sentiment-satisfied', color: '#F7DC6F' },
  '사랑': { icon: 'sentiment-very-satisfied', color: '#E91E63' },
  '애정': { icon: 'sentiment-satisfied', color: '#F06292' },

  // 긍정적 감정 - 희망/기대
  '희망': { icon: 'sentiment-satisfied', color: '#00BCD4' },
  '기대': { icon: 'sentiment-satisfied', color: '#26C6DA' },
  '기대감': { icon: 'sentiment-satisfied', color: '#4DD0E1' },
  '설렘': { icon: 'sentiment-very-satisfied', color: '#FF7043' },

  // 긍정적 감정 - 자신감/뿌듯
  '자신감': { icon: 'sentiment-very-satisfied', color: '#FF9800' },
  '뿌듯함': { icon: 'sentiment-very-satisfied', color: '#FFB74D' },
  '뿌듯': { icon: 'sentiment-very-satisfied', color: '#FFB74D' },
  '성취감': { icon: 'sentiment-very-satisfied', color: '#FFA726' },
  '만족': { icon: 'sentiment-satisfied', color: '#66BB6A' },
  '만족감': { icon: 'sentiment-satisfied', color: '#81C784' },

  // 중립적 감정
  '혼란': { icon: 'sentiment-neutral', color: '#9E9E9E' },
  '혼란스러움': { icon: 'sentiment-neutral', color: '#9E9E9E' },
  '복잡함': { icon: 'sentiment-neutral', color: '#78909C' },
  '당황': { icon: 'sentiment-neutral', color: '#FFAB91' },
  '당황스러움': { icon: 'sentiment-neutral', color: '#FFAB91' },
  '놀람': { icon: 'sentiment-neutral', color: '#FFD54F' },
  '의아함': { icon: 'sentiment-neutral', color: '#90A4AE' },
  '무관심': { icon: 'sentiment-neutral', color: '#B0BEC5' },
  '담담함': { icon: 'sentiment-neutral', color: '#CFD8DC' },
};

// 기본값 (매핑에 없는 감정용)
export const DEFAULT_EMOTION = {
  icon: 'sentiment-neutral',
  color: '#9E9E9E',
};

// 감정 이름으로 아이콘과 색상 가져오기
export function getEmotionStyle(emotionName) {
  return EMOTION_MAP[emotionName] || DEFAULT_EMOTION;
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
