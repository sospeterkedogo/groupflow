import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/utils/supabase/server'

const OPENAI_API_URL = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1'
const OPENAI_API_KEY = process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY

export async function POST(req: Request) {
  if (!OPENAI_API_KEY) {
    return new NextResponse(JSON.stringify({ error: 'AI Gateway is not configured.' }), { status: 500 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Authentication required.' }), { status: 401 })
  }

  try {
    const { question, correctAnswer, userResponse } = await req.json()
    
    const prompt = `Act as an academic examiner for GroupFlow.
Question: "${question}"
Reference Answer: "${correctAnswer}"
Student's Response: "${userResponse}"

Evaluate the student's response for accuracy, depth, and clarity.
Respond ONLY with a JSON object:
{
  "score": number (0 to 100),
  "isCorrect": boolean (true if score > 70),
  "critique": "A brief (15 word max) punchy feedback about their answer."
}`

    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a rigorous but fair academic skirmish judge.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) throw new Error('Grading flux interrupted.')

    const data = await response.json()
    const result = JSON.parse(data?.choices?.[0]?.message?.content)

    return new NextResponse(JSON.stringify(result), { status: 200 })
  } catch (err: any) {
    console.error('Grading Error:', err)
    return new NextResponse(JSON.stringify({ error: 'Evaluation failed.' }), { status: 500 })
  }
}
