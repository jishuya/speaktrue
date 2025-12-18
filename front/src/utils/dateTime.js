/**
 * 날짜/시간 관련 유틸리티 함수
 */

/**
 * 현재 시간을 "오전/오후 H:MM" 형식으로 반환
 */
export function getCurrentTime() {
  return new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Date 객체를 "오전/오후 H:MM" 형식으로 반환
 */
export function formatTime(date) {
  return new Date(date).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 날짜를 상대적 표현으로 반환 (오늘, 어제, 일주일 전 등)
 * @param {Date|string|number} date - 날짜
 * @returns {string} 상대적 날짜 표현
 */
export function getRelativeDate(date) {
  const now = new Date();
  const target = new Date(date);

  // 시간 부분 제거하고 날짜만 비교
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffTime = nowDate.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return '오늘';
  } else if (diffDays === 1) {
    return '어제';
  } else if (diffDays <= 7) {
    return '일주일 전';
  } else if (diffDays <= 14) {
    return '이주일 전';
  } else if (diffDays <= 30) {
    return '한달 전';
  } else if (diffDays <= 60) {
    return '두달 전';
  } else {
    // 그 이상은 날짜로 표시
    return target.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

/**
 * 날짜와 시간을 함께 포맷 (오늘, 오후 8:42)
 * @param {Date|string|number} date - 날짜
 * @returns {string} 포맷된 날짜와 시간
 */
export function formatDateTimeRelative(date) {
  const relativeDate = getRelativeDate(date);
  const time = formatTime(date);
  return `${relativeDate}, ${time}`;
}

/**
 * 채팅에서 날짜 구분선을 표시할지 결정
 * @param {Date|string|number} currentDate - 현재 메시지 날짜
 * @param {Date|string|number|null} prevDate - 이전 메시지 날짜
 * @returns {boolean} 날짜 구분선 표시 여부
 */
export function shouldShowDateSeparator(currentDate, prevDate) {
  if (!prevDate) return true;

  const current = new Date(currentDate);
  const prev = new Date(prevDate);

  return (
    current.getFullYear() !== prev.getFullYear() ||
    current.getMonth() !== prev.getMonth() ||
    current.getDate() !== prev.getDate()
  );
}
