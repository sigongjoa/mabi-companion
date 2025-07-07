import { NextResponse } from 'next/server';
import { getLLMService } from '../../../lib/llm-service';
import { logger } from '../../../lib/logger';

export async function POST(request: Request) {
  logger.debug("Chat API: Request received.");
  const { messages, model, provider } = await request.json();
  logger.debug("Chat API: Received data -", { messages, model, provider });

  try {
    const llmService = getLLMService(provider);
    const result = await llmService.chat(messages, model);
    logger.debug("Chat API: Received response from LLM service.", result);
    return NextResponse.json({ result: result.content });
  } catch (err: any) {
    logger.error("Chat API: Error during LLM call -", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

