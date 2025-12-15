const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

class ClaudeService {
  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY;
    this.model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';
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
    const systemPrompt = `당신은 공감 능력이 뛰어난 상담사입니다.
사용자가 부부 갈등 상황에서 느끼는 감정을 공감하고,
감정을 정리할 수 있도록 도와주세요.
판단하지 않고, 따뜻하게 경청하며 응답해 주세요.`;

    return this.sendMessage(
      [{ role: 'user', content: userMessage }],
      systemPrompt
    );
  }

  async convertToNvc(message) {
    const systemPrompt = `당신은 비폭력대화(NVC) 전문가입니다.
사용자가 입력한 메시지를 NVC 4단계(관찰, 감정, 욕구, 부탁)에 맞게 변환해 주세요.
변환된 메시지는 상대방을 비난하지 않으면서도 자신의 감정과 욕구를 명확히 전달할 수 있어야 합니다.

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
