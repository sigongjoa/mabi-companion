export async function POST(request: Request) {
  try {
    const { prompt, image, context } = await request.json()

    // Enhanced system prompt with comprehensive game data context
    const systemPrompt = `당신은 마비노기 모바일 게임의 전문 AI 어시스턴트입니다. 
    
사용자의 게임 데이터를 실시간으로 분석하여 최적의 조언을 제공합니다.

주요 기능:
- 캐릭터 관리 및 성장 전략 제안
- 가공 시설 최적화 및 제작 계획 수립
- 인벤토리 관리 및 아이템 활용 방안
- 퀘스트 진행 상황 분석 및 우선순위 제안
- 전투력 향상을 위한 맞춤형 조언

응답 스타일:
- 한국어로 친근하고 전문적인 톤
- 이모지와 구조화된 형식 사용
- 구체적이고 실행 가능한 조언 제공
- 게임 데이터 기반의 정확한 분석

이미지가 제공된 경우, 게임 스크린샷을 분석하여 더 정확한 조언을 제공하세요.`

    const messages = [
      { role: "system", content: systemPrompt },
      ...context,
      {
        role: "user",
        content: image
          ? `${prompt}\n\n[이미지가 첨부되었습니다. 이미지를 분석하여 관련된 조언을 제공해주세요.]`
          : prompt,
      },
    ]

    // Use a more sophisticated AI model for better responses
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o", // Use GPT-4 with vision capabilities
        messages: image
          ? [
              ...messages.slice(0, -1),
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  { type: "image_url", image_url: { url: image } },
                ],
              },
            ]
          : messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return Response.json({ message: data.choices[0].message.content })
  } catch (error) {
    console.error("Chat API Error:", error)
    return Response.json({ error: { message: error.message || "Internal server error" } }, { status: 500 })
  }
}
