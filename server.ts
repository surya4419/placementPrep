import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy init the GoogleGenAI SDK to prevent startup crashes if GEMINI_API_KEY is missing.
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is missing. Please configure it in your Secrets panel.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Evaluation API Endpoint
app.post('/api/evaluate', async (req, res) => {
  try {
    const { module, questionText, responseText, code, thinkAloudText } = req.body;

    if (!module || !questionText) {
      return res.status(400).json({ error: 'Missing required parameters: module, questionText' });
    }

    const ai = getAiClient();

    let systemPrompt = '';
    let contentsPrompt = '';

    if (module === 'communication') {
      systemPrompt = `You are an expert Executive Communication Coach and Speech Pathologist.
Your task is to grade the user's spoken or written response to a communication exercise prompt.
Grade the user STRICTLY on the following five dimensions, scoring each from 1 (poor) to 5 (excellent):
1. Grammar & Fluency (accuracy of sentence construction, flow)
2. Structure/Storytelling Arc (clear opening, logical sequence, and conclusion)
3. Clarity & Conciseness (directness, getting to the point, avoiding rambling)
4. Filler-word density (identifying overuses of "um", "like", "basically", "you know", "actually")
5. Vocabulary/Register (appropriateness of vocabulary choice for a professional workplace setting)

Provide an overall score (1 to 100), detailed feedback for each dimension, 2-3 precise strengths, and 2-3 constructive improvement items.
Also, find EXACTLY ONE sentence from the user's answer that was grammatically weak, repetitive, or filled with filler words, and rewrite it into a highly polished, professional, and powerful version. Return this rewritten sentence in "rewrittenSentence".
Be encouraging but highly honest and detailed. Avoid generic praise.`;

      contentsPrompt = `Question Prompt: "${questionText}"
User Answer: "${responseText || '[No response provided]'}"`;

    } else if (module === 'hr') {
      systemPrompt = `You are a Senior HR Director and Behavioral Interview Specialist.
Your task is to grade the user's response to a behavioral/HR interview question using the STAR (Situation, Task, Action, Result) methodology.
Grade the user STRICTLY on the following six dimensions, scoring each from 1 (poor) to 5 (excellent):
1. Situation clarity (did they lay out the clear background context?)
2. Task/goal clarity (was the specific challenge or goal defined?)
3. Action specificity & ownership (what did they actually do? Look for ownership and "I" vs "we")
4. Result/impact (was there a measurable outcome, quantified with numbers/stats where possible?)
5. Structure & conciseness (overall delivery, layout, and STAR flow)
6. Self-awareness/reflection (did they share what they learned or would do differently?)

Provide an overall score (1 to 100), detailed feedback for each dimension, 2-3 precise strengths, and 2-3 constructive improvement items.
Crucially, generate ONE realistic, professional, probing interviewer follow-up question in the "followUpQuestion" field. 
This follow-up question should probe the weakest, vaguest, or most incomplete part of their response. For example:
- If Result has no numbers: "You mentioned the system went live successfully—what were the measurable metrics or business outcomes of that launch?"
- If Action focuses too much on the team: "You used 'we' a lot in your explanation—what was your exact personal contribution to resolving that dispute?"
- If reflection is missing: "Looking back at that failure now, what is the single biggest lesson you took into your next project?"
Keep the tone professional and conversational, as if a real interviewer is sitting across from them.`;

      contentsPrompt = `Behavioral Question: "${questionText}"
User Response: "${responseText || '[No response provided]'}"`;

    } else if (module === 'technical') {
      systemPrompt = `You are a Principal Software Engineer and Technical DSA Interview Specialist at a Tier-1 tech company.
Your task is to grade the user's technical interview performance. The user has provided a code solution AND an explanation of their approach ("Think Aloud" text).
Remember: Candidates are judged on how they communicate and walk through trade-offs, not just code correctness.
Grade the user STRICTLY on the following five dimensions, scoring each from 1 (poor) to 5 (excellent):
1. Problem Comprehension (did they clarify constraints, edge cases, inputs/outputs?)
2. Approach & Trade-off reasoning (did they discuss time/space complexity? Did they compare brute force vs optimal?)
3. Implementation correctness & code quality (is the code clean, readable, syntactically correct, and does it solve the problem?)
4. Testing rigor & edge cases (did they trace or talk about handling empty arrays, null inputs, boundaries, very large numbers?)
5. Communication (was the "thinking aloud" or explanation of their approach clear, structured, and easy to follow?)

Provide an overall score (1 to 100), detailed feedback for each dimension, 2-3 precise strengths, and 2-3 constructive improvement items.
Also, in the "suggestedCodeSolution" field, provide a beautifully commented, clean, and optimal code solution resolving the problem in the language requested. Include a brief complexity commentary at the top of the code as comments.`;

      contentsPrompt = `DSA Question: "${questionText}"
User Code Solution:
\`\`\`
${code || '[No code provided]'}
\`\`\`
User's "Think Aloud" Explanation of their Approach:
"${thinkAloudText || '[No explanation provided]'}"`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contentsPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: {
              type: Type.INTEGER,
              description: 'Overall score (1 to 100) calculated based on average performance.'
            },
            dimensionScores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'The exact name of the rubric dimension.' },
                  score: { type: Type.INTEGER, description: 'Score from 1 to 5.' },
                  description: { type: Type.STRING, description: 'Explanation of why this score was awarded.' }
                },
                required: ['name', 'score', 'description']
              }
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 to 3 bullet points highlighting positive aspects of their response.'
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 to 3 bullet points suggesting specific ways to improve.'
            },
            rewrittenSentence: {
              type: Type.STRING,
              description: 'Communication lab ONLY: Rewritten, highly professional version of a weak/filler-ridden sentence from user answer.'
            },
            followUpQuestion: {
              type: Type.STRING,
              description: 'HR simulator ONLY: Probing, realistic single follow-up question targeting the weakest part of user response.'
            },
            suggestedCodeSolution: {
              type: Type.STRING,
              description: 'Technical simulator ONLY: Complete, perfectly commented optimal solution.'
            }
          },
          required: ['overallScore', 'dimensionScores', 'strengths', 'improvements']
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('Gemini returned an empty response.');
    }

    const evaluationResult = JSON.parse(textOutput.trim());
    return res.json(evaluationResult);

  } catch (error: any) {
    console.error('Evaluation API Error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred during evaluation.' });
  }
});

// Configure Vite middleware / Serve static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
