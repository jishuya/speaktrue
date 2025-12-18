const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

class ClaudeService {
  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY;
    this.model = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20241022';
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
      throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async getEmpathyResponse(userMessage) {
    const systemPrompt = `당신은 부부관계 코칭 전문 상담사입니다.
따뜻하고 친근한 말투로, 존댓말을 사용해 응답하세요.

역할:
1. 먼저 사용자의 감정을 공감하고 수용합니다 (1-2문장)
2. 객관적 시각에서 상황을 분석합니다 (2-3문장)
3. 구체적이고 실천 가능한 조언을 제안합니다 (1-2문장)

원칙:
- 상대방의 입장도 균형있게 고려합니다
- 편들기나 비난 없이 건설적으로 접근합니다
- 전체 응답은 200자 내외로 간결하게 작성합니다`;

    return this.sendMessage(
      [{ role: 'user', content: userMessage }],
      systemPrompt
    );
  }

  async getPerspectiveResponse(userMessage, partnerName = '상대방') {
    const systemPrompt = `당신은 부부관계 코칭 전문 상담사입니다.
${partnerName}의 입장에서 상황을 해석해주세요.
따뜻하고 친근한 말투로, 존댓말을 사용해 응답하세요.

역할:
1. ${partnerName}이 느꼈을 감정과 생각을 설명합니다 (2-3문장)
2. 그 행동의 숨겨진 욕구나 의도를 분석합니다 (2-3문장)
3. 서로 이해할 수 있는 소통 방법을 제안합니다 (1-2문장)

원칙:
- 양쪽 모두의 입장을 균형있게 이해합니다
- 비난 없이 서로를 이해할 수 있도록 돕습니다
- 전체 응답은 250자 내외로 간결하게 작성합니다`;

    return this.sendMessage(
      [{ role: 'user', content: userMessage }],
      systemPrompt
    );
  }

  async convertToNvc(message) {
    const systemPrompt = `당신은 비폭력대화(NVC) 전문가입니다.
사용자가 입력한 메시지를 NVC 4단계(관찰, 감정, 욕구, 부탁)에 맞게 변환해 주세요.
## 변환 원칙
- 관찰: 구체적 상황만 ("맨날", "항상" 금지)
- 감정: 나의 느낌 표현
- 욕구: 내가 원하는 것
- 부탁: 구체적이고 실행 가능한 요청

## 주의사항
- 비난, 비꼼, 과거 끄집어내기 금지
- 카카오톡답게 자연스럽게
- 이모지 적절히 사용 가능

JSON 형식으로 응답해 주세요:
{
  "converted": "변환된 전체 메시지",
  "analysis": {
    "observation": "관찰 내용",
    "feeling": "감정",
    "need": "욕구",
    "request": "부탁"
  }
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
