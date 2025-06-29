import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  console.debug("Chat API: Request received."); // console.debug
  const { messages, model } = await request.json();
  console.debug("Chat API: Received messages and model -", { messages, model }); // console.debug

  try {
    if (model === 'lmstudio') {
      console.debug("Chat API: Calling LM Studio proxy."); // console.debug
      // LM Studio 프록시 호출
      const res = await fetch(
        process.env.LM_STUDIO_API_URL || 'http://localhost:1234/v1/chat/completions', // 기본값 로컬 LM Studio URL
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // LM Studio가 자체 인증을 안 쓰면 Authorization 헤더는 생략할 수 있습니다.
            // Authorization: `Bearer ${process.env.LMSTUDIO_API_KEY}`,
          },
          body: JSON.stringify({ model: 'gpt-4o-mini', messages }), // LM Studio 모델명은 실제 설정에 맞게 변경
        }
      );
      console.debug("Chat API: Received response from LM Studio.", res); // console.debug
      const { choices } = await res.json();
      console.debug("Chat API: Parsed LM Studio response -", choices); // console.debug
      return NextResponse.json({ result: choices[0].message.content });
    }

    console.debug("Chat API: Calling OpenAI/Gemini."); // console.debug
    // OpenAI / Gemini 호출
    const chat = await openai.chat.completions.create({
      model: model === 'gemini' ? 'gemini-pro-1' : 'gpt-4o', // Gemini 모델명은 실제 설정에 맞게 변경
      messages,
    });
    console.debug("Chat API: Received response from OpenAI/Gemini.", chat); // console.debug
    return NextResponse.json({ result: chat.choices[0].message.content });
  } catch (err: any) {
    console.error("Chat API: Error during LLM call -", err); // console.debug
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
