import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { PageContext } from "@/types/page-context";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your OpenAI API key is set in your environment variables
});

export async function POST(req: NextRequest) {
  console.debug("LLM Context Chat API received request."); // logger.debug
  try {
    const { userInput, pageContext }: { userInput: string; pageContext: PageContext } = await req.json();

    console.debug("User Input:", userInput); // logger.debug
    console.debug("Page Context:", pageContext); // logger.debug

    const pageStateMsg: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: "system",
      content: `현재 페이지 정보:\n${JSON.stringify(pageContext, (key, value) => {
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      }, 2)}`,
    };

    const userMsg: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: "user",
      content: userInput,
    };

    console.debug("Sending messages to OpenAI API."); // logger.debug
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 또는 사용하려는 다른 모델
      messages: [pageStateMsg, userMsg],
    });
    console.debug("Received response from OpenAI API.", response);

    const llmResponse = response.choices[0].message?.content || "LLM 응답이 없습니다.";
    console.debug("LLM Response Content:", llmResponse); // logger.debug

    return NextResponse.json({ response: llmResponse });
  } catch (error) {
    console.error("Error in LLM Context Chat API:", error); // logger.debug
    return NextResponse.json({ error: "LLM 호출 중 오류가 발생했습니다." }, { status: 500 });
  }
}
