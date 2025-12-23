const https = require('https');
const http = require('http');

class ClovaSpeechService {
  constructor() {
    this.invokeUrl = process.env.CLOVA_SPEECH_INVOKE_URL;
    this.secretKey = process.env.CLOVA_SPEECH_SECRET_KEY;
  }

  /**
   * 오디오 파일을 Clova Speech API로 전송하여 STT + 화자 분리 수행
   * @param {Buffer} audioBuffer - 오디오 파일 버퍼
   * @param {string} filename - 파일명
   * @returns {Promise<Object>} - 변환 결과
   */
  async transcribeAudio(audioBuffer, filename = 'audio.m4a') {
    const params = {
      language: 'ko-KR',
      completion: 'sync',
      diarization: {
        enable: true,
        speakerCountMin: 2,
        speakerCountMax: 2,
      },
    };

    return this.uploadFile(audioBuffer, filename, params);
  }

  /**
   * 파일 업로드 방식으로 Clova Speech API 호출
   */
  async uploadFile(audioBuffer, filename, params) {
    return new Promise((resolve, reject) => {
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

      // multipart/form-data 본문 생성
      const paramsJson = JSON.stringify(params);

      let body = '';
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="params"\r\n`;
      body += `Content-Type: application/json\r\n\r\n`;
      body += paramsJson + '\r\n';
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="media"; filename="${filename}"\r\n`;
      body += `Content-Type: audio/mp4\r\n\r\n`;

      const bodyStart = Buffer.from(body, 'utf8');
      const bodyEnd = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
      const fullBody = Buffer.concat([bodyStart, audioBuffer, bodyEnd]);

      const url = new URL(this.invokeUrl + '/recognizer/upload');

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'X-CLOVASPEECH-API-KEY': this.secretKey,
          'Content-Length': fullBody.length,
        },
      };

      const protocol = url.protocol === 'https:' ? https : http;

      const req = protocol.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (res.statusCode === 200) {
              resolve(result);
            } else {
              reject(new Error(`Clova Speech API Error: ${res.statusCode} - ${data}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(fullBody);
      req.end();
    });
  }

  /**
   * Clova Speech API 응답을 DB 저장 형식으로 변환
   * @param {Object} clovaResult - Clova Speech API 응답
   * @returns {Array} - 화자별로 분리된 발화 목록
   */
  parseTranscriptResult(clovaResult) {
    const transcripts = [];

    if (!clovaResult.segments) {
      return transcripts;
    }

    for (const segment of clovaResult.segments) {
      // 화자 매핑: speaker 0 -> 'me', speaker 1 -> 'partner'
      const speaker = segment.speaker?.label === '1' ? 'partner' : 'me';

      transcripts.push({
        speaker,
        content: segment.text || '',
        startTime: Math.floor(segment.start / 1000), // ms -> sec
        endTime: Math.floor(segment.end / 1000),     // ms -> sec
      });
    }

    return transcripts;
  }

  /**
   * 전체 텍스트 추출 (요약용)
   */
  getFullText(clovaResult) {
    if (!clovaResult.segments) {
      return clovaResult.text || '';
    }

    return clovaResult.segments
      .map(seg => `${seg.speaker?.label === '1' ? 'B' : 'A'}: ${seg.text}`)
      .join('\n');
  }
}

module.exports = new ClovaSpeechService();
