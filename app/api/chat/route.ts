import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.debug('POST /api/chat: Google Gemini Function entry.')
  try {
    const { prompt, context, image } = await request.json()
    console.debug(`POST /api/chat: Received prompt: "${prompt}", context length: ${context ? context.length : 0}, image present: ${!!image}`)

    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      console.debug('POST /api/chat: GOOGLE_API_KEY not configured. Returning 500.')
      return NextResponse.json({ error: 'Google API key not configured.' }, { status: 500 })
    }
    console.debug('POST /api/chat: Google API key found. Preparing request to Google Gemini.')

    let model = 'gemini-pro' // 기본 텍스트 전용 모델
    const contents: any[] = []

    // 기존 대화 컨텍스트를 Google Gemini 형식으로 변환
    if (context && Array.isArray(context)) {
      context.forEach((msg: any) => {
        if (msg.role === 'user') {
          contents.push({ role: 'user', parts: [{ text: msg.content }] })
        } else if (msg.role === 'assistant') {
          contents.push({ role: 'model', parts: [{ text: msg.content }] })
        }
      })
      console.debug(`POST /api/chat: Converted ${context.length} context messages.`)
    }

    // 시스템 메시지 또는 첫 프롬프트 구성
    const systemInstruction = 'You are a helpful assistant that analyzes game data and provides advice.'
    let userPromptParts: any[] = [{ type: 'text', text: systemInstruction + "\n\n" + prompt }]

    if (image) {
      console.debug('POST /api/chat: Image detected. Setting model to gemini-pro-vision and adding image content.')
      model = 'gemini-pro-vision'
      const parts = image.split(';base64,')
      const mimeType = parts[0].split(':')[1]
      const base64Data = parts[1]

      userPromptParts = [
        { text: prompt || 'Analyze this image and provide advice.' }, // 이미지가 있을 때 프롬프트가 비어있으면 기본 텍스트 사용
        { inline_data: { mime_type: mimeType, data: base64Data } },
      ]
    } else {
      console.debug('POST /api/chat: No image detected. Using gemini-pro for text content.')
      userPromptParts = [{ text: prompt }]
    }

    contents.push({ role: 'user', parts: userPromptParts })

    const googleApiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      }),
    })

    const data = await googleApiResponse.json()
    console.debug(`POST /api/chat: Google Gemini response status: ${googleApiResponse.status}`)

    if (!googleApiResponse.ok) {
      console.debug('POST /api/chat: Google Gemini response not OK. Returning error.')
      return NextResponse.json({ error: data }, { status: googleApiResponse.status })
    }

    const message = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    console.debug(`POST /api/chat: Successfully got message from Google Gemini. Message length: ${message.length}`)
    console.debug('POST /api/chat: Function exit (success).')
    return NextResponse.json({ message })

  } catch (error: any) {
    console.debug(`POST /api/chat: Caught error: ${error.message}. Returning 500.`)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 