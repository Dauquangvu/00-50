import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { history, apiKey, model } = body

    if (!apiKey) return NextResponse.json({ error: 'Missing API key' }, { status: 400 })
    if (!history || history.length < 3) return NextResponse.json({ error: 'Need at least 3 colors' }, { status: 400 })

    const cR = history.filter((c: string) => c === 'red').length
    const cB = history.filter((c: string) => c === 'blue').length
    const cG = history.filter((c: string) => c === 'green').length

    const prompt = `Bạn là AI phân tích pattern màu trong trò chơi.

Lịch sử (${history.length} lần): ${history.join(', ')}
10 lần gần nhất: ${history.slice(-10).join(', ')}
Đỏ:${cR} Xanh:${cB} Lá:${cG}

Dự đoán màu TIẾP THEO. Trả lời JSON duy nhất, không thêm gì khác:
{"color":"red|blue|green","confidence":0-100,"reason":"lý do ngắn ≤80 ký tự"}`

    const res = await fetch('https://1gw.gwai.cloud/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-haiku-20241022',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const rawText = await res.text()
    console.log('Proxy response status:', res.status)
    console.log('Proxy response:', rawText)

    let data
    try { data = JSON.parse(rawText) }
    catch { return NextResponse.json({ error: 'Invalid JSON from proxy: ' + rawText.slice(0, 200) }, { status: 500 }) }

    if (data.error) return NextResponse.json({ error: JSON.stringify(data.error) }, { status: 500 })

    // Support Anthropic format
    let text = ''
    if (data.content?.[0]?.text) text = data.content[0].text
    else if (data.choices?.[0]?.message?.content) text = data.choices[0].message.content

    const match = text.match(/\{[\s\S]*?\}/)
    if (!match) return NextResponse.json({ error: 'No JSON in response: ' + text.slice(0, 100) }, { status: 500 })

    const parsed = JSON.parse(match[0])
    return NextResponse.json(parsed)

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
