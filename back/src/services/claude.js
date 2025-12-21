const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// 중간 요약 기준 상수
const SUMMARY_THRESHOLD = 20; // 20개 메시지 초과 시 요약
const RECENT_MESSAGES_TO_KEEP = 6; // 요약 후 유지할 최근 메시지 수

class ClaudeService {
  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY;
    this.model = process.env.CLAUDE_MODEL || 'claude-haiku-4-20250514';
  }

  // 메시지 배열을 Claude API 형식으로 변환
  formatMessagesForApi(messages) {
    return messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
  }

  async sendMessage(messages, systemPrompt) {
    if (!this.apiKey) {
      throw new Error('CLAUDE_API_KEY is not configured');
    }

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Claude API error details:', JSON.stringify(error, null, 2));
      throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  // 이미지와 함께 메시지 전송
  async sendMessageWithImage(userMessage, image, systemPrompt) {
    if (!this.apiKey) {
      throw new Error('CLAUDE_API_KEY is not configured');
    }

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: image.mediaType || 'image/jpeg',
                  data: image.data,
                },
              },
              {
                type: 'text',
                text: userMessage,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  // 공감 모드 시스템 프롬프트
  getEmpathySystemPrompt() {
    return `당신은 부부관계 전문 상담사입니다. 따뜻하지만 진지하게, 존댓말로 대화하세요.

## 응답 구조
1. 보편화와 공감 (1-2문장): 사용자의 상황이 흔하고 이해할 수 있는 것임을 인정
2. 감정 대변 (1-2문장): 사용자가 느끼는 감정을 짚어주고 당연하다고 인정
3. 실질적인 제안 (1-2문장): 상황에 맞는 구체적인 대화법이나 행동 방안
4. 후속 질문 (선택적, 0-1개): 필요한 경우에만

## 대화 스타일
- 진지하고 따뜻한 전문 상담사 톤
- 이모지 사용하지 않음
- 사용자 편에서 감정을 대변
- "충분히 이해돼요", "당연한 감정이에요" 같은 표현으로 감정 수용

## 절대 하지 말 것
- "상대방 입장에서는..." 같은 균형 잡힌 시각 (공감이 먼저)
- 이모지 사용
- 뜬구름 잡는 추상적인 조언`;
  }

  async getEmpathyResponse(userMessage) {
    return this.sendMessage(
      [{ role: 'user', content: userMessage }],
      this.getEmpathySystemPrompt()
    );
  }

  // 대화 히스토리 기반 공감 응답 (핵심 함수)
  async getEmpathyResponseWithHistory(userMessage, conversationHistory = [], conversationSummary = null) {
    const messages = [];

    // 1. 이전 대화 요약이 있으면 먼저 추가
    if (conversationSummary) {
      messages.push({
        role: 'user',
        content: `[이전 대화 요약]\n${conversationSummary}`,
      });
      messages.push({
        role: 'assistant',
        content: '네, 이전 대화 내용을 이해했습니다. 계속 말씀해 주세요.',
      });
    }

    // 2. 최근 대화 히스토리 추가
    messages.push(...this.formatMessagesForApi(conversationHistory));

    // 3. 현재 사용자 메시지 추가
    messages.push({ role: 'user', content: userMessage });

    return this.sendMessage(messages, this.getEmpathySystemPrompt());
  }

  // 대화 중간 요약 생성
  async generateConversationSummary(messages) {
    const systemPrompt = `당신은 부부상담 대화를 요약하는 전문가입니다.
주어진 대화 내용을 간결하게 요약해주세요.

## 요약 형식
- 사용자가 토로한 주요 상황과 감정
- 상담사가 제공한 핵심 조언
- 대화의 흐름과 맥락

## 규칙
- 3-5문장으로 요약
- 핵심 감정과 상황만 포함
- 구체적인 대화 내용은 생략하되 맥락 유지
- 이모지 사용 금지`;

    const conversationText = messages
      .map(m => `${m.role === 'user' ? '사용자' : '상담사'}: ${m.content}`)
      .join('\n\n');

    return this.sendMessage(
      [{ role: 'user', content: `다음 대화를 요약해주세요:\n\n${conversationText}` }],
      systemPrompt
    );
  }

  // 세션 종료 시 최종 요약 생성 (session_summaries용)
  async generateSessionSummary(messages) {
    const systemPrompt = `당신은 부부상담 세션을 분석하는 전문가입니다.
주어진 대화 내용을 분석하여 JSON 형식으로 요약해주세요.

## 응답 형식
반드시 아래 JSON 형식으로만 응답해주세요:
{
  "mainReason": "이번 상담의 주된 원인/주제 (1문장)",
  "summary": "대화 전체 요약 (2-3문장)",
  "myEmotions": ["사용자가 표현한 감정들", "최대 5개"],
  "myNeeds": ["사용자의 욕구/바람", "최대 3개"],
  "partnerEmotions": ["상대방이 느꼈을 것으로 추정되는 감정", "최대 3개"],
  "partnerNeeds": ["상대방의 욕구로 추정되는 것", "최대 3개"],
  "hiddenEmotion": "사용자의 숨겨진 감정 (2-4단어)",
  "coreNeed": "사용자의 핵심 욕구 (2-4단어)",
  "topics": ["주제 태그", "최대 3개"]
}

## 규칙
- JSON 외의 텍스트 출력 금지
- 대화에서 언급되지 않은 내용 추측 금지
- 감정/욕구는 한국어 단어로`;

    const conversationText = messages
      .map(m => `${m.role === 'user' ? '사용자' : '상담사'}: ${m.content}`)
      .join('\n\n');

    const response = await this.sendMessage(
      [{ role: 'user', content: `다음 상담 세션을 분석해주세요:\n\n${conversationText}` }],
      systemPrompt
    );

    try {
      return JSON.parse(response);
    } catch {
      return {
        mainReason: '분석 실패',
        summary: response,
        myEmotions: [],
        myNeeds: [],
        partnerEmotions: [],
        partnerNeeds: [],
        hiddenEmotion: '',
        coreNeed: '',
        topics: [],
      };
    }
  }

  // 요약이 필요한지 확인
  shouldSummarize(messageCount) {
    return messageCount > SUMMARY_THRESHOLD;
  }

  // 요약 후 유지할 메시지 수
  getRecentMessagesToKeep() {
    return RECENT_MESSAGES_TO_KEEP;
  }

  // 이미지와 함께 공감 응답
  async getEmpathyResponseWithImage(userMessage, image) {
    const systemPrompt = `당신은 부부관계 전문 상담사입니다. 따뜻하지만 진지하게, 존댓말로 대화하세요.
이미지(카톡/문자 스크린샷 등)를 참고하여 상황을 이해하고 공감해주세요.

## 응답 구조
1. 보편화와 공감 (1-2문장): 사용자의 상황이 흔하고 이해할 수 있는 것임을 인정
2. 감정 대변 (1-2문장): 사용자가 느끼는 감정을 짚어주고 당연하다고 인정
3. 실질적인 제안 (1-2문장): 상황에 맞는 구체적인 대화법이나 행동 방안
4. 후속 질문 (선택적, 0-1개): 필요한 경우에만

## 이미지 분석 시 주의사항
- 이미지 내용을 직접 나열하지 말고 자연스럽게 상담에 녹여내기
- 이미지에서 파악한 정보를 바탕으로 구체적인 공감과 조언

## 대화 스타일
- 진지하고 따뜻한 전문 상담사 톤
- 이모지 사용하지 않음
- 사용자 편에서 감정을 대변

## 절대 하지 말 것
- "상대방 입장에서는..." 같은 균형 잡힌 시각 (공감이 먼저)
- 이모지 사용
- 이미지 내용을 그대로 나열하거나 요약만 하기`;

    return this.sendMessageWithImage(userMessage, image, systemPrompt);
  }

  async getPerspectiveResponse(userMessage, partnerName = '상대방') {
    const systemPrompt = `당신은 부부관계 전문 상담사입니다. 따뜻하지만 진지하게, 존댓말로 대화하세요.
사용자가 충분히 공감받은 후, ${partnerName}의 입장을 이해할 준비가 되었을 때 사용하는 기능입니다.

## 응답 구조
1. 사용자 감정 재확인 (1문장): 사용자의 감정이 여전히 유효함을 인정해요.
2. ${partnerName}의 입장 해석 (2-3문장): ${partnerName}이 그렇게 행동한 이유, 느꼈을 감정과 생각을 구체적으로 설명해요.
3. 숨겨진 욕구 분석 (2문장): 그 행동 뒤에 있는 욕구나 두려움을 짚어줘요.
4. 실질적인 소통 방안 (2-3문장): 서로 이해할 수 있는 구체적인 대화법이나 행동을 제안해요.

## 대화 스타일
- 진지하고 따뜻한 전문 상담사 톤
- 이모지 사용하지 않음
- ${partnerName}을 변호하는 게 아니라, 이해를 돕는 것임을 명확히
- "그렇다고 해서 ~님의 감정이 틀린 건 아니에요"처럼 사용자 감정도 계속 존중

## 제안 예시
- "${partnerName}에게 '나는 네가 ~할 때 ~하게 느껴져'라고 말씀해보시는 건 어떨까요?"
- "서로 기대하는 바를 구체적으로 적어서 공유해보시는 것도 방법이에요."

## 절대 하지 말 것
- 사용자를 비난하거나 잘못을 지적하기
- ${partnerName}을 일방적으로 두둔하기
- 이모지 사용
- 뜬구름 잡는 추상적인 조언`;

    return this.sendMessage(
      [{ role: 'user', content: userMessage }],
      systemPrompt
    );
  }

  // 대화 히스토리 기반 관점 전환 응답
  async getPerspectiveResponseWithHistory(conversationHistory, partnerName = '상대방') {
    const systemPrompt = `당신은 부부관계 전문 상담사입니다. 따뜻하지만 진지하게, 존댓말로 대화하세요.

지금까지의 대화 내용을 바탕으로 ${partnerName}의 입장에서 상황을 분석해주세요.
사용자는 이미 충분히 감정을 토로하고 공감을 받았으므로, 이제 ${partnerName}의 관점을 이해할 준비가 되어 있습니다.

## 응답 형식
반드시 아래 JSON 형식으로 응답해주세요:
{
  "sections": {
    "summary": "대화 요약 (1-2문장): 지금까지 사용자가 토로한 핵심 상황",
    "emotionReaffirm": "사용자 감정 재확인 (1문장): 사용자의 감정이 여전히 유효함을 인정",
    "partnerPerspective": "${partnerName}의 입장 해석 (3-4문장): ${partnerName}이 그렇게 행동했을 이유, 느꼈을 감정과 생각",
    "hiddenNeedAnalysis": "숨겨진 욕구 분석 (2-3문장): ${partnerName}의 행동 뒤에 있는 욕구나 두려움, 기대",
    "communicationTip": "실질적인 소통 방안 (2-3문장): 서로 이해할 수 있는 구체적인 대화법이나 행동"
  },
  "empathyPoints": {
    "hiddenEmotion": "${partnerName}의 숨겨진 감정을 2-4단어로 표현 (예: '불안감', '인정받고 싶은 마음', '지침과 외로움')",
    "coreNeed": "${partnerName}의 핵심 욕구를 2-4단어로 표현 (예: '존중받고 싶음', '함께하는 시간', '인정과 감사')"
  }
}

## 대화 스타일
- 진지하고 따뜻한 전문 상담사 톤
- 이모지 사용하지 않음
- ${partnerName}을 변호하는 게 아니라, 이해를 돕는 것임을 명확히
- "그렇다고 해서 ~님의 감정이 틀린 건 아니에요"처럼 사용자 감정도 계속 존중
- 대화 내용에서 나온 구체적인 상황을 언급하며 분석

## 제안 예시
- "${partnerName}에게 '나는 네가 ~할 때 ~하게 느껴져'라고 말씀해보시는 건 어떨까요?"
- "서로 기대하는 바를 구체적으로 적어서 공유해보시는 것도 방법이에요."

## 절대 하지 말 것
- 사용자를 비난하거나 잘못을 지적하기
- ${partnerName}을 일방적으로 두둔하기
- 이모지 사용
- 뜬구름 잡는 추상적인 조언
- 대화에서 언급되지 않은 내용을 추측하기
- JSON 외의 텍스트 출력`;

    // 대화 히스토리 끝에 관점 전환 요청 추가
    const messagesWithRequest = [
      ...conversationHistory,
      {
        role: 'user',
        content: '지금까지 나눈 대화를 바탕으로 상대방의 입장에서 이 상황을 분석해주세요. JSON 형식으로 응답해주세요.',
      },
    ];

    const response = await this.sendMessage(messagesWithRequest, systemPrompt);

    try {
      return JSON.parse(response);
    } catch {
      // JSON 파싱 실패 시 기존 형식으로 반환
      return {
        sections: {
          summary: '',
          emotionReaffirm: '',
          partnerPerspective: response,
          hiddenNeedAnalysis: '',
          communicationTip: '',
        },
        empathyPoints: {
          hiddenEmotion: '파악 중...',
          coreNeed: '파악 중...',
        },
      };
    }
  }

  // 이미지와 함께 관점 전환 응답
  async getPerspectiveResponseWithImage(userMessage, image, partnerName = '상대방') {
    const systemPrompt = `당신은 부부관계 전문 상담사입니다. 따뜻하지만 진지하게, 존댓말로 대화하세요.
사용자가 충분히 공감받은 후, ${partnerName}의 입장을 이해할 준비가 되었을 때 사용하는 기능입니다.

사용자가 이미지와 함께 메시지를 보냈습니다. 이미지는 대화 내용의 스크린샷, 상황 사진 등일 수 있습니다.
이미지 내용을 참고하여 ${partnerName}의 입장을 더 구체적으로 분석해주세요.

## 응답 구조
1. 사용자 감정 재확인 (1문장): 사용자의 감정이 여전히 유효함을 인정해요.
2. ${partnerName}의 입장 해석 (2-3문장): ${partnerName}이 그렇게 행동한 이유, 느꼈을 감정과 생각을 구체적으로 설명해요.
3. 숨겨진 욕구 분석 (2문장): 그 행동 뒤에 있는 욕구나 두려움을 짚어줘요.
4. 실질적인 소통 방안 (2-3문장): 서로 이해할 수 있는 구체적인 대화법이나 행동을 제안해요.

## 이미지 분석 시 주의사항
- 이미지가 카톡/문자 대화 스크린샷이라면, 대화 내용에서 ${partnerName}의 말투와 의도를 파악해요.
- 이미지 내용을 바탕으로 ${partnerName}의 심리를 더 구체적으로 분석해요.

## 대화 스타일
- 진지하고 따뜻한 전문 상담사 톤
- 이모지 사용하지 않음
- ${partnerName}을 변호하는 게 아니라, 이해를 돕는 것임을 명확히
- "그렇다고 해서 ~님의 감정이 틀린 건 아니에요"처럼 사용자 감정도 계속 존중

## 절대 하지 말 것
- 사용자를 비난하거나 잘못을 지적하기
- ${partnerName}을 일방적으로 두둔하기
- 이모지 사용`;

    return this.sendMessageWithImage(userMessage, image, systemPrompt);
  }

  async convertToNvc(message) {
    const systemPrompt = `당신은 비폭력대화(NVC) 전문가입니다. 사용자가 입력한 메시지를 상대방에게 상처 주지 않으면서도 진심을 전달할 수 있는 형태로 변환해주세요.

## NVC 4단계 변환 원칙
1. 관찰: 판단 없이 구체적인 상황만 ("맨날", "항상", "절대" 같은 일반화 금지)
2. 감정: "나는 ~하게 느꼈어"로 나의 감정을 표현
3. 욕구: 그 감정 뒤에 있는 내가 진짜 원하는 것
4. 부탁: 구체적이고 실행 가능한 요청 (강요가 아닌 부탁으로)

## 변환 스타일
- 카카오톡으로 보낼 수 있을 정도로 자연스럽게
- 너무 딱딱하거나 교과서적이지 않게
- 이모지 사용하지 않음
- 상대방이 방어적이 되지 않도록 부드럽게

## 변환 예시
원본: "맨날 집안일 나한테만 시키면서 왜 본인은 안 해?"
변환: "오늘 내가 설거지하고 빨래까지 했는데, 나 혼자 다 한 것 같아서 지쳤어. 나도 쉬고 싶거든. 이번 주말에 집안일 어떻게 나눌지 같이 얘기해볼 수 있을까?"

## 절대 하지 말 것
- 비난, 비꼼, 과거 끄집어내기
- "너는 왜 항상...", "넌 맨날..." 같은 표현
- 상대방을 판단하는 표현

JSON 형식으로 응답해 주세요:
{
  "converted": "변환된 전체 메시지 (바로 카톡으로 보낼 수 있는 형태)",
  "analysis": {
    "observation": "관찰 - 구체적으로 어떤 상황이었는지",
    "feeling": "감정 - 어떤 기분이 들었는지",
    "need": "욕구 - 진짜 원하는 게 뭔지",
    "request": "부탁 - 상대방에게 바라는 구체적인 행동"
  },
  "tip": "이 메시지를 보낼 때 참고할 팁 (1문장)"
}`;

    const response = await this.sendMessage(
      [{ role: 'user', content: message }],
      systemPrompt
    );

    try {
      return JSON.parse(response);
    } catch {
      return { converted: response, analysis: null };
    }
  }
}

module.exports = new ClaudeService();
