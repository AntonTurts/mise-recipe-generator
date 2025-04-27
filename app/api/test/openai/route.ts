// app/api/test/openai/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    // Log environment variables (redacted for security)
    const apiKey = process.env.OPENAI_API_KEY;
    console.log("OpenAI API Key exists:", !!apiKey);
    console.log("API Key first 4 chars:", apiKey?.substring(0, 4));
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Make a simple test API call
    const result = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use a more widely available model for testing
      messages: [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Say hello, this is a test."}
      ],
      max_tokens: 10,
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "OpenAI API is working correctly!", 
      result: {
        content: result.choices[0].message.content,
        model: result.model
      }
    });
  } catch (error) {
    console.error("Error testing OpenAI API:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      note: "Check your API key and environment variables."
    }, { status: 500 });
  }
}