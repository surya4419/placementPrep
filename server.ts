import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// ── MongoDB connection (cached) ───────────────────────────────────────────────
let cachedClient: MongoClient | null = null;

async function getDb() {
  if (!cachedClient) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI environment variable is not set');
    cachedClient = await MongoClient.connect(uri);
  }
  return cachedClient.db(process.env.MONGODB_DB_NAME || 'interview_prep');
}

// Auth Middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Auth Routes
// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await usersCollection.insertOne({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    });

    // Create JWT token
    const token = jwt.sign({ userId: result.insertedId.toString() }, JWT_SECRET, { expiresIn: '30d' });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return res.json({
      user: {
        id: result.insertedId.toString(),
        name,
        email: email.toLowerCase()
      },
      token
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Signup failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last active
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastActive: new Date().toISOString() } }
    );

    // Create JWT token
    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '30d' });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const db = await getDb();
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ _id: new ObjectId(req.userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to get user' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully' });
});

// Forgot password (request reset)
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If an account exists, a reset link will be sent' });
    }

    // Generate reset token (in production, send this via email)
    const resetToken = jwt.sign({ userId: user._id.toString(), purpose: 'reset' }, JWT_SECRET, { expiresIn: '1h' });

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { resetToken, resetTokenExpiry: new Date(Date.now() + 3600000).toISOString() } }
    );

    // In production, send email here
    // For now, return token (remove this in production!)
    return res.json({ 
      message: 'If an account exists, a reset link will be sent',
      resetToken // Remove in production!
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const decoded: any = jwt.verify(resetToken, JWT_SECRET);
    if (decoded.purpose !== 'reset') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { password: hashedPassword },
        $unset: { resetToken: '', resetTokenExpiry: '' }
      }
    );

    return res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(401).json({ error: 'Invalid or expired reset token' });
  }
});

// User Data Routes (Protected)
// Save user's attempt
app.post('/api/user/attempts', authenticateToken, async (req: any, res) => {
  try {
    const { attempt } = req.body;
    const db = await getDb();
    
    await db.collection('attempts').insertOne({
      ...attempt,
      userId: req.userId,
      createdAt: new Date().toISOString()
    });

    return res.json({ message: 'Attempt saved successfully' });
  } catch (error: any) {
    console.error('Save attempt error:', error);
    return res.status(500).json({ error: 'Failed to save attempt' });
  }
});

// Get user's attempts
app.get('/api/user/attempts', authenticateToken, async (req: any, res) => {
  try {
    const db = await getDb();
    const attempts = await db.collection('attempts')
      .find({ userId: req.userId })
      .sort({ submittedAt: 1 })
      .toArray();

    return res.json({ attempts });
  } catch (error: any) {
    console.error('Get attempts error:', error);
    return res.status(500).json({ error: 'Failed to get attempts' });
  }
});

// Save STAR story
app.post('/api/user/stories', authenticateToken, async (req: any, res) => {
  try {
    const { story } = req.body;
    const db = await getDb();
    
    // Upsert by questionId
    await db.collection('stories').updateOne(
      { userId: req.userId, questionId: story.questionId },
      { $set: { ...story, userId: req.userId, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );

    return res.json({ message: 'Story saved successfully' });
  } catch (error: any) {
    console.error('Save story error:', error);
    return res.status(500).json({ error: 'Failed to save story' });
  }
});

// Get user's stories
app.get('/api/user/stories', authenticateToken, async (req: any, res) => {
  try {
    const db = await getDb();
    const stories = await db.collection('stories')
      .find({ userId: req.userId })
      .sort({ lastUpdated: -1 })
      .toArray();

    return res.json({ stories });
  } catch (error: any) {
    console.error('Get stories error:', error);
    return res.status(500).json({ error: 'Failed to get stories' });
  }
});

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
