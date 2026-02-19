import OpenAI from 'openai';
import type { SpeakingFeedbackEntity } from '@/features/speaking/domain/entities/speaking-session.entity';
import type {
  ConversationTurn,
  ISpeakingFeedbackAIGateway,
} from '@/features/speaking/domain/ports/speaking-feedback-ai.interface';

const FEEDBACK_SYSTEM = `You are an expert language tutor. Given a transcript of a voice conversation between the student and the AI tutor, produce a structured feedback report in JSON only (no markdown, no backticks).

Return exactly this structure:
{
  "overall_score": <0-100>,
  "strengths": ["string", "..."],
  "grammar_errors": [
    { "what_student_said": "string", "correction": "string", "explanation": "string" }
  ],
  "pronunciation_notes": ["string", "..."],
  "vocabulary_used": [
    { "word": "string", "context": "string", "is_native_expression": boolean }
  ],
  "improvement_suggestions": ["string", "..."],
  "encouragement_message": "string"
}

Be encouraging and specific. For grammar_errors only include clear mistakes the student made. For vocabulary_used include words/phrases the student used well or that are worth noting.`;

export class OpenAISpeakingFeedbackGateway
  implements ISpeakingFeedbackAIGateway
{
  constructor(private readonly apiKey: string) {}

  async generateFeedback(params: {
    transcript: ConversationTurn[];
    targetLanguage: string;
    nativeLanguage: string;
    cefrLevel: string;
    topicTitle: string;
  }): Promise<SpeakingFeedbackEntity> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const transcriptText = params.transcript
      .map((t) => `${t.role === 'user' ? 'STUDENT' : 'TUTOR'}: ${t.content}`)
      .join('\n');

    const openai = new OpenAI({ apiKey: this.apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: FEEDBACK_SYSTEM },
        {
          role: 'user',
          content: `Target language: ${params.targetLanguage}. Native language: ${params.nativeLanguage}. CEFR level: ${params.cefrLevel}. Topic: ${params.topicTitle}.

Conversation transcript:
${transcriptText}

Analyze and return the JSON feedback object only.`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? '{}';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    let data: SpeakingFeedbackEntity;
    try {
      data = JSON.parse(cleaned) as SpeakingFeedbackEntity;
    } catch {
      throw new Error('OpenAI returned invalid JSON for speaking feedback');
    }

    if (typeof data.overall_score !== 'number') data.overall_score = 70;
    if (!Array.isArray(data.strengths)) data.strengths = [];
    if (!Array.isArray(data.grammar_errors)) data.grammar_errors = [];
    if (!Array.isArray(data.pronunciation_notes)) data.pronunciation_notes = [];
    if (!Array.isArray(data.vocabulary_used)) data.vocabulary_used = [];
    if (!Array.isArray(data.improvement_suggestions))
      data.improvement_suggestions = [];
    if (typeof data.encouragement_message !== 'string')
      data.encouragement_message = 'Keep practicing!';

    return data;
  }
}
