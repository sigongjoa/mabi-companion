import { NextRequest, NextResponse } from 'next/server';
import fsPromises from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const cpFilePath = path.join(process.cwd(), 'public/data/rag-cp-chunks.json');
    const skillFilePath = path.join(process.cwd(), 'public/data/rag-skill-chunks.json');

    const cpJsonData = await fsPromises.readFile(cpFilePath, 'utf-8');
    const skillJsonData = await fsPromises.readFile(skillFilePath, 'utf-8');

    const cpChunks = JSON.parse(cpJsonData);
    const skillChunks = JSON.parse(skillJsonData);

    const allChunks = [...cpChunks, ...skillChunks];

    const relevantChunks = allChunks.filter((chunk: any) =>
      chunk.content.toLowerCase().includes(query.toLowerCase())
    );

    // Return an array of relevant document contents
    const responseDocuments = relevantChunks.map((chunk: any) => chunk.content);

    return NextResponse.json({ response: responseDocuments });
  } catch (error) {
    console.error('Error in RAG chat API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}