import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB_NAME || 'interview_prep';

// Helper: get a date N days ago from today
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── SURYA GANESH's attempts (improving arc: 58 → 94) ───────────────────────

function getSuryaAttempts(userId: string) {
  const attempts = [
    // Day 19 - first day, rough start
    {
      userId, id: makeId('att'), questionId: 'comm-1', module: 'communication',
      rawText: "Uh hello, my name is Surya. I have done React and some Node. I built a few projects. I want to join a good company and learn from senior engineers. Thank you.",
      submittedAt: daysAgo(19),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 58,
        dimensionScores: [
          { name: 'Grammar & Fluency', score: 2, description: 'Very short, lacks professional depth, uses filler "Uh".' },
          { name: 'Structure/Storytelling Arc', score: 2, description: 'No clear past-present-future structure.' },
          { name: 'Clarity & Conciseness', score: 3, description: 'Too brief, misses key achievements.' },
          { name: 'Filler-word density', score: 2, description: 'Starts with "Uh", overall informal.' },
          { name: 'Vocabulary/Register', score: 3, description: 'Basic vocabulary, not professional register.' }
        ],
        strengths: ['Mentioned relevant tech stack (React, Node).', 'Direct and to the point.'],
        improvements: ['Eliminate filler words like "Uh".', 'Add a past→present→future arc to your intro.', 'Mention at least one quantified achievement.'],
        rewrittenSentence: "My name is Surya Ganesh, a full-stack developer specializing in React and Node.js, with hands-on experience delivering production-grade web applications.",
        evaluatedAt: daysAgo(19)
      }
    },
    // Day 18 - HR
    {
      userId, id: makeId('att'), questionId: 'hr-2', module: 'hr',
      rawText: "There was a teammate who wasn't doing his work. I told the professor eventually. It kind of worked out but was awkward.",
      submittedAt: daysAgo(18),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 55,
        dimensionScores: [
          { name: 'Situation clarity', score: 2, description: 'Context is extremely vague — no project, timeframe, or stakes mentioned.' },
          { name: 'Task/goal clarity', score: 2, description: 'Challenge not articulated at all.' },
          { name: 'Action specificity & ownership', score: 2, description: 'Escalated to professor without trying peer-level resolution first.' },
          { name: 'Result/impact', score: 2, description: '"Kind of worked out" is not a measurable result.' },
          { name: 'Structure & conciseness', score: 3, description: 'No STAR structure whatsoever.' },
          { name: 'Self-awareness/reflection', score: 2, description: 'No learning mentioned.' }
        ],
        strengths: ['Honestly acknowledged the situation was uncomfortable.'],
        improvements: ['Use explicit STAR labels in your answer.', 'Try to resolve peer conflicts directly before escalating.', 'Quantify the outcome (grade, deadline, team morale).'],
        followUpQuestion: "Before involving the professor, what specific steps did you take to directly address the conflict with your teammate?",
        evaluatedAt: daysAgo(18)
      }
    },
    // Day 17 - Technical brute force
    {
      userId, id: makeId('att'), questionId: 'tech-1', module: 'technical',
      rawText: "I'll use nested loops to check every pair.", code: `function twoSum(nums: number[], target: number): number[] {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i+1; j < nums.length; j++) {\n      if (nums[i]+nums[j] === target) return [i,j];\n    }\n  }\n  return [];\n}`,
      thinkAloudText: "I'll use nested loops to check every pair. Time is O(N^2), space O(1). Not optimal but it works.",
      submittedAt: daysAgo(17),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 62,
        dimensionScores: [
          { name: 'Problem Comprehension', score: 3, description: 'Understood the problem but skipped edge case discussion.' },
          { name: 'Approach & Trade-off reasoning', score: 2, description: 'Only mentioned brute force without discussing hash map optimization.' },
          { name: 'Implementation correctness & code quality', score: 4, description: 'Correct brute-force implementation.' },
          { name: 'Testing rigor & edge cases', score: 2, description: 'No edge cases (empty array, no solution) discussed.' },
          { name: 'Communication', score: 3, description: 'Brief explanation, lacks depth.' }
        ],
        strengths: ['Correct working solution.', 'Acknowledged time complexity.'],
        improvements: ['Optimize to O(N) using a HashMap.', 'Discuss edge cases like empty input.', 'Talk through your approach before coding.'],
        suggestedCodeSolution: `function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp)!, i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
        evaluatedAt: daysAgo(17)
      }
    },
    // Day 15 - Communication improving
    {
      userId, id: makeId('att'), questionId: 'comm-2', module: 'communication',
      rawText: "A database is like a giant filing cabinet. Each drawer is a table, and each folder inside is a row of data. When you search for something, the computer opens the right drawer based on a label called an index. Without the index, it would have to open every single drawer to find what you need.",
      submittedAt: daysAgo(15),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 70,
        dimensionScores: [
          { name: 'Grammar & Fluency', score: 4, description: 'Smooth delivery, no filler words this time.' },
          { name: 'Structure/Storytelling Arc', score: 3, description: 'Good analogy but no real narrative arc.' },
          { name: 'Clarity & Conciseness', score: 4, description: 'Clear and easy to follow.' },
          { name: 'Filler-word density', score: 4, description: 'No fillers detected — solid improvement.' },
          { name: 'Vocabulary/Register', score: 3, description: 'Appropriate but could use richer vocabulary.' }
        ],
        strengths: ['Excellent filing cabinet analogy.', 'Introduced index concept naturally.'],
        improvements: ['Extend the analogy to explain relationships between tables.', 'Add a closing sentence that brings it back to a real-world app example.'],
        rewrittenSentence: "A database resembles a meticulously organized filing cabinet where each labeled drawer represents a data table, and an index acts as a smart directory that pinpoints the exact folder without searching every drawer.",
        evaluatedAt: daysAgo(15)
      }
    },
    // Day 13 - HR with STAR structure attempt
    {
      userId, id: makeId('att'), questionId: 'hr-1', module: 'hr',
      rawText: "Situation: During my final year project, our REST API was returning 500 errors randomly under load. Task: Fix the issue before the client demo in 48 hours. Action: I profiled the server and found memory leaks in our MongoDB connection pooling. I refactored the connection logic to reuse a single pooled instance. Result: API response time dropped from 2400ms to 180ms. Reflection: I learned that performance bugs require systematic profiling, not guesswork.",
      submittedAt: daysAgo(13),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 75,
        dimensionScores: [
          { name: 'Situation clarity', score: 4, description: 'Clear, time-pressured context with specific tech details.' },
          { name: 'Task/goal clarity', score: 4, description: 'Specific deadline and deliverable stated.' },
          { name: 'Action specificity & ownership', score: 4, description: 'Used "I" and described specific technical actions taken.' },
          { name: 'Result/impact', score: 4, description: 'Excellent quantified result — 2400ms → 180ms.' },
          { name: 'Structure & conciseness', score: 3, description: 'STAR structure used, good progress from last attempt.' },
          { name: 'Self-awareness/reflection', score: 3, description: 'Generic reflection, could be more specific.' }
        ],
        strengths: ['Strong quantified result (92% latency reduction).', 'Technical credibility with MongoDB connection pooling detail.'],
        improvements: ['Add what tools you used for profiling (e.g., clinic.js, New Relic).', 'Make reflection more unique to your personal growth.'],
        followUpQuestion: "You reduced latency significantly — did you set up any ongoing monitoring or alerting to prevent this from recurring in production?",
        evaluatedAt: daysAgo(13)
      }
    },
    // Day 11 - Technical optimal
    {
      userId, id: makeId('att'), questionId: 'tech-2', module: 'technical',
      rawText: "Use a stack. Push opens, pop and verify on close.", code: `function isValid(s: string): boolean {\n  const stack: string[] = [];\n  const map: Record<string,string> = { ')':'(', '}':'{', ']':'[' };\n  for (const c of s) {\n    if ('({['.includes(c)) stack.push(c);\n    else if (stack.pop() !== map[c]) return false;\n  }\n  return stack.length === 0;\n}`,
      thinkAloudText: "This is a classic stack problem. When I see an opening bracket, push it. When I see a closing bracket, pop the top and check if it's the matching opener. If stack is empty at the end, it's valid. O(N) time, O(N) space.",
      submittedAt: daysAgo(11),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 80,
        dimensionScores: [
          { name: 'Problem Comprehension', score: 4, description: 'Immediately identified stack as the right data structure.' },
          { name: 'Approach & Trade-off reasoning', score: 4, description: 'Correctly stated O(N) time and space.' },
          { name: 'Implementation correctness & code quality', score: 5, description: 'Clean, concise, correct solution.' },
          { name: 'Testing rigor & edge cases', score: 3, description: 'Did not discuss edge cases like empty string or unbalanced start.' },
          { name: 'Communication', score: 3, description: 'Explained approach before coding — good improvement.' }
        ],
        strengths: ['Optimal O(N) solution with clean code.', 'Explained approach before diving in.'],
        improvements: ['Mention edge cases: empty string, only openers, only closers.', 'Walk through a small example trace while coding.'],
        suggestedCodeSolution: `function isValid(s: string): boolean {\n  const stack: string[] = [];\n  const pairs = new Map([[')', '('], ['}', '{'], [']', '[']]);\n  for (const c of s) {\n    if (!pairs.has(c)) { stack.push(c); continue; }\n    if (stack.pop() !== pairs.get(c)) return false;\n  }\n  return stack.length === 0;\n}`,
        evaluatedAt: daysAgo(11)
      }
    },
    // Day 9 - Communication high score
    {
      userId, id: makeId('att'), questionId: 'comm-4', module: 'communication',
      rawText: "During our university hackathon last month, our deployment lead suddenly fell ill six hours before submission. No one else had touched AWS. I immediately volunteered, spent four hours reading ECS documentation and watching tutorials, containerized our Flask backend with Docker, and deployed it to a live EC2 instance. We submitted with twenty minutes to spare and won second place. That weekend taught me that pressure is just compressed opportunity.",
      submittedAt: daysAgo(9),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 85,
        dimensionScores: [
          { name: 'Grammar & Fluency', score: 5, description: 'Excellent grammar, zero fillers, very professional.' },
          { name: 'Structure/Storytelling Arc', score: 4, description: 'Strong conflict-action-resolution arc.' },
          { name: 'Clarity & Conciseness', score: 5, description: 'Dense with information yet perfectly concise.' },
          { name: 'Filler-word density', score: 5, description: 'Zero filler words — great improvement from week 1.' },
          { name: 'Vocabulary/Register', score: 4, description: 'Professional vocabulary with vivid phrases.' }
        ],
        strengths: ['Powerful closing line ("pressure is compressed opportunity").', 'Specific timeline adds credibility.'],
        improvements: ['Mention the business impact beyond winning — e.g. user signups, judges\' feedback.'],
        rewrittenSentence: "Confronted with a deployment crisis six hours before submission, I rapidly self-taught Docker and AWS ECS, successfully containerizing and launching our backend to secure second place.",
        evaluatedAt: daysAgo(9)
      }
    },
    // Day 7 - HR strong
    {
      userId, id: makeId('att'), questionId: 'hr-3', module: 'hr',
      rawText: "Situation: I noticed juniors in our lab wasting hours each week fighting Git merge conflicts they didn't understand. Task: Reduce this friction before the semester deadline crunch hit. Action: I designed a two-hour interactive 'Git Sandbox' workshop, created a shared playground repo where people could intentionally create and resolve conflicts safely, and presented visual diagrams of branch models. I ran the session voluntarily on a Saturday. Result: Forty-two students attended. Lab TAs reported a fifty-five percent drop in repo-related help tickets the following month. Reflection: Proactive teaching creates compound returns — each person I helped went on to help two others.",
      submittedAt: daysAgo(7),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 88,
        dimensionScores: [
          { name: 'Situation clarity', score: 5, description: 'Crystal clear systemic problem identified.' },
          { name: 'Task/goal clarity', score: 5, description: 'Specific goal: reduce friction before crunch period.' },
          { name: 'Action specificity & ownership', score: 5, description: 'Detailed, voluntary, structured initiative.' },
          { name: 'Result/impact', score: 5, description: '42 students, 55% drop in support tickets — outstanding metrics.' },
          { name: 'Structure & conciseness', score: 4, description: 'Very clean STAR structure.' },
          { name: 'Self-awareness/reflection', score: 4, description: 'Insightful reflection about compound teaching returns.' }
        ],
        strengths: ['Superb quantified impact.', 'Voluntary initiative demonstrates genuine leadership.'],
        improvements: ['Mention whether you documented this workshop for future semesters.'],
        followUpQuestion: "If you were scaling this to the entire engineering department next semester, what would you automate or delegate first?",
        evaluatedAt: daysAgo(7)
      }
    },
    // Day 5 - Technical DP
    {
      userId, id: makeId('att'), questionId: 'tech-4', module: 'technical',
      rawText: "Fibonacci pattern. O(N) time O(1) space with two variables.", code: `function climbStairs(n: number): number {\n  if (n <= 2) return n;\n  let a = 1, b = 2;\n  for (let i = 3; i <= n; i++) {\n    [a, b] = [b, a + b];\n  }\n  return b;\n}`,
      thinkAloudText: "Climbing stairs is the Fibonacci sequence — ways(n) = ways(n-1) + ways(n-2). Naive recursion is O(2^N). I'll use bottom-up DP with constant space, keeping only the last two values. O(N) time, O(1) space. Base cases: 1 step → 1 way, 2 steps → 2 ways.",
      submittedAt: daysAgo(5),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 91,
        dimensionScores: [
          { name: 'Problem Comprehension', score: 5, description: 'Immediately spotted the Fibonacci pattern.' },
          { name: 'Approach & Trade-off reasoning', score: 5, description: 'Compared recursive O(2^N) vs iterative O(N) — excellent.' },
          { name: 'Implementation correctness & code quality', score: 5, description: 'Elegant destructured swap, perfectly clean.' },
          { name: 'Testing rigor & edge cases', score: 4, description: 'Covered base cases n=1 and n=2.' },
          { name: 'Communication', score: 4, description: 'Confident, logical explanation throughout.' }
        ],
        strengths: ['Elegant one-liner swap using destructuring.', 'Proactively compared recursive vs iterative trade-offs.'],
        improvements: ['Mention memoization as an alternative approach between pure recursion and bottom-up DP.'],
        suggestedCodeSolution: `// Bottom-up DP O(N) time, O(1) space\nfunction climbStairs(n: number): number {\n  if (n <= 2) return n;\n  let prev = 1, curr = 2;\n  for (let i = 3; i <= n; i++) [prev, curr] = [curr, prev + curr];\n  return curr;\n}`,
        evaluatedAt: daysAgo(5)
      }
    },
    // Day 3 - HR near perfect
    {
      userId, id: makeId('att'), questionId: 'hr-4', module: 'hr',
      rawText: "Situation: My capstone partner insisted on a monolithic Express server while I advocated for microservices, stalling our architecture for a week. Task: Break the deadlock and submit our design doc before the faculty deadline. Action: Instead of debating opinions, I built two mini-prototypes in a weekend — one monolith, one microservice skeleton — and ran load tests with Artillery. I compiled the data into a shared Notion doc showing latency, complexity, and deployment cost trade-offs. I then proposed a pragmatic middle path: a modular monolith with clear domain boundaries we could extract later. Result: My partner immediately aligned. We submitted our doc four days early, and the faculty advisor highlighted it as a model architecture proposal. Reflection: I learned that the best way to win a technical argument is to replace the argument with data.",
      submittedAt: daysAgo(3),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 93,
        dimensionScores: [
          { name: 'Situation clarity', score: 5, description: 'Precise conflict with real architectural stakes.' },
          { name: 'Task/goal clarity', score: 5, description: 'Hard faculty deadline creates genuine urgency.' },
          { name: 'Action specificity & ownership', score: 5, description: 'Built actual prototypes and load-tested — exceptional.' },
          { name: 'Result/impact', score: 5, description: 'Submitted early, faculty recognition — stellar.' },
          { name: 'Structure & conciseness', score: 5, description: 'Flawless STAR with zero filler.' },
          { name: 'Self-awareness/reflection', score: 4, description: 'Sharp reflection with memorable phrasing.' }
        ],
        strengths: ['Replaced subjective debate with empirical load-test data.', 'Proposed a creative compromise (modular monolith) that satisfied both parties.'],
        improvements: ['Share what tools you used for load testing (Artillery/k6) to further demonstrate technical depth.'],
        followUpQuestion: "Brilliant approach. Would you apply this same data-driven prototype strategy if you only had 24 hours instead of a weekend?",
        evaluatedAt: daysAgo(3)
      }
    },
    // Day 1 - latest, near perfect
    {
      userId, id: makeId('att'), questionId: 'comm-3', module: 'communication',
      rawText: "Generative AI is not a threat to software engineering — it is the most powerful force multiplier since the compiler. Every abstraction shift in our field, from assembly to C to Python, sparked identical fears of obsolescence. Each time, the tool eliminated drudgery and elevated the engineer's scope. Today, AI handles boilerplate; tomorrow, it will co-author scaffolding. Our job is evolving from syntactical writers to architectural orchestrators. Engineers who embrace this shift — using AI as a reasoning partner rather than a replacement fear — will build in a month what previously took a year. The threat isn't AI. The threat is refusing to evolve.",
      submittedAt: daysAgo(1),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 94,
        dimensionScores: [
          { name: 'Grammar & Fluency', score: 5, description: 'Impeccable grammar, authoritative professional voice.' },
          { name: 'Structure/Storytelling Arc', score: 5, description: 'Historical → present → future arc perfectly executed.' },
          { name: 'Clarity & Conciseness', score: 5, description: 'Dense, powerful sentences with zero waste.' },
          { name: 'Filler-word density', score: 5, description: 'Absolutely zero fillers — remarkable improvement since day 1.' },
          { name: 'Vocabulary/Register', score: 4, description: 'Elevated vocabulary ("force multiplier", "architectural orchestrators").' }
        ],
        strengths: ['Exceptional closing line: "The threat is refusing to evolve."', 'Masterful historical contextualization of abstraction shifts.'],
        improvements: ['Briefly acknowledge potential risks (hallucinations, security) for a fully balanced argument.'],
        rewrittenSentence: "Generative AI is not a threat to software engineers — it is the most powerful abstraction shift since the compiler, elevating our role from syntactical writers to architectural orchestrators.",
        evaluatedAt: daysAgo(1)
      }
    }
  ];
  return attempts;
}

// ─── JASWANTH's attempts (different arc: technical-heavy, improving comm) ────

function getJaswanthAttempts(userId: string) {
  const attempts = [
    // Day 20 - rough comm start
    {
      userId, id: makeId('att'), questionId: 'comm-1', module: 'communication',
      rawText: "Hi. I am Jaswanth. I know Java and Spring Boot and did some internship. I made a backend for a college project. I want to work in a good company with smart people.",
      submittedAt: daysAgo(20),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 54,
        dimensionScores: [
          { name: 'Grammar & Fluency', score: 2, description: 'Very short and choppy sentences, no professional flow.' },
          { name: 'Structure/Storytelling Arc', score: 2, description: 'No structure — reads like a list.' },
          { name: 'Clarity & Conciseness', score: 3, description: 'Clear but far too sparse on substance.' },
          { name: 'Filler-word density', score: 3, description: 'No fillers but no depth either.' },
          { name: 'Vocabulary/Register', score: 2, description: 'Very basic vocabulary, lacks professional register.' }
        ],
        strengths: ['Mentioned specific technologies (Java, Spring Boot).', 'Concise.'],
        improvements: ['Build a past→present→future narrative.', 'Mention one specific achievement with a number.', 'Use professional vocabulary — "I am passionate about distributed systems" vs "I like coding".'],
        rewrittenSentence: "I am Jaswanth Kuchipudi, a backend engineer specializing in Java and Spring Boot, with internship experience building high-throughput REST APIs serving thousands of daily active users.",
        evaluatedAt: daysAgo(20)
      }
    },
    // Day 19 - technical strong start
    {
      userId, id: makeId('att'), questionId: 'tech-1', module: 'technical',
      rawText: "HashMap approach. O(N) time, O(N) space.", code: `function twoSum(nums: number[], target: number): number[] {\n  const seen = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need)!, i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}`,
      thinkAloudText: "Classic HashMap problem. For each element, I compute the complement and check if it exists in our map. Single pass — O(N) time, O(N) space. Edge case: guaranteed one solution per problem, so no duplicate handling needed here.",
      submittedAt: daysAgo(19),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 82,
        dimensionScores: [
          { name: 'Problem Comprehension', score: 5, description: 'Immediately jumped to optimal solution.' },
          { name: 'Approach & Trade-off reasoning', score: 4, description: 'Mentioned O(N)/O(N), could compare with brute force.' },
          { name: 'Implementation correctness & code quality', score: 5, description: 'Perfect HashMap solution, clean variable naming.' },
          { name: 'Testing rigor & edge cases', score: 3, description: 'Mentioned guaranteed solution but skipped negative numbers edge case.' },
          { name: 'Communication', score: 3, description: 'Very brief think-aloud, should elaborate more.' }
        ],
        strengths: ['Immediately went to optimal O(N) — shows strong DSA foundation.', 'Clean, readable code.'],
        improvements: ['Compare with brute force O(N^2) to show trade-off awareness.', 'Elaborate more while typing — narrate each line.'],
        suggestedCodeSolution: `// O(N) time, O(N) space - HashMap approach\nfunction twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>(); // complement -> index\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement)!, i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
        evaluatedAt: daysAgo(19)
      }
    },
    // Day 17 - HR weak
    {
      userId, id: makeId('att'), questionId: 'hr-1', module: 'hr',
      rawText: "We had a bug in production. I fixed it. The team was happy.",
      submittedAt: daysAgo(17),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 48,
        dimensionScores: [
          { name: 'Situation clarity', score: 1, description: 'No context whatsoever — what project, team, or stakes?' },
          { name: 'Task/goal clarity', score: 1, description: 'Not described.' },
          { name: 'Action specificity & ownership', score: 2, description: '"I fixed it" — zero technical or process detail.' },
          { name: 'Result/impact', score: 1, description: '"Team was happy" is not a business result.' },
          { name: 'Structure & conciseness', score: 2, description: 'Three sentences is too brief for a behavioral question.' },
          { name: 'Self-awareness/reflection', score: 1, description: 'No reflection at all.' }
        ],
        strengths: ['Straight to the point (but too brief).'],
        improvements: ['Use the full STAR framework.', 'Describe the technical nature of the bug.', 'Quantify the impact (downtime avoided, users affected, revenue impact).'],
        followUpQuestion: "Can you describe the specific nature of the bug, how you diagnosed it, and what the business impact would have been if it wasn't fixed?",
        evaluatedAt: daysAgo(17)
      }
    },
    // Day 15 - Technical merging intervals
    {
      userId, id: makeId('att'), questionId: 'tech-3', module: 'technical',
      rawText: "Sort by start, then scan and merge overlapping ones.", code: `function mergeIntervals(intervals: number[][]): number[][] {\n  intervals.sort((a,b) => a[0]-b[0]);\n  const res: number[][] = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    const last = res[res.length-1];\n    if (intervals[i][0] <= last[1]) {\n      last[1] = Math.max(last[1], intervals[i][1]);\n    } else {\n      res.push(intervals[i]);\n    }\n  }\n  return res;\n}`,
      thinkAloudText: "Sort intervals by start time. Then iterate — if the current start is within the previous end, extend the end. Otherwise push as new interval. O(N log N) for sorting, O(N) for merging. Total O(N log N).",
      submittedAt: daysAgo(15),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 85,
        dimensionScores: [
          { name: 'Problem Comprehension', score: 5, description: 'Immediately grasped sorting prerequisite.' },
          { name: 'Approach & Trade-off reasoning', score: 4, description: 'Correctly broke down O(N log N) complexity.' },
          { name: 'Implementation correctness & code quality', score: 5, description: 'Correct, concise, clean implementation.' },
          { name: 'Testing rigor & edge cases', score: 3, description: 'Did not address edge case: single interval input.' },
          { name: 'Communication', score: 4, description: 'Improving narration — explaining each step now.' }
        ],
        strengths: ['Optimal sort-and-scan approach.', 'Clean variable naming.'],
        improvements: ['Add guard for empty or single-element array.', 'Trace through an example with overlapping and non-overlapping intervals.'],
        suggestedCodeSolution: `function mergeIntervals(intervals: number[][]): number[][] {\n  if (!intervals.length) return [];\n  intervals.sort((a, b) => a[0] - b[0]);\n  const result = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    const prev = result[result.length - 1];\n    if (intervals[i][0] <= prev[1]) prev[1] = Math.max(prev[1], intervals[i][1]);\n    else result.push(intervals[i]);\n  }\n  return result;\n}`,
        evaluatedAt: daysAgo(15)
      }
    },
    // Day 13 - Communication improving
    {
      userId, id: makeId('att'), questionId: 'comm-2', module: 'communication',
      rawText: "A database is like a school timetable. Each subject has a fixed room and a fixed teacher. When a student wants to find where Math class is, they look at the timetable and instantly get the room number. If there were no timetable, the student would have to check every room in the school one by one. The timetable is the index that makes lookups fast.",
      submittedAt: daysAgo(13),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 72,
        dimensionScores: [
          { name: 'Grammar & Fluency', score: 4, description: 'Clean, fluent sentences.' },
          { name: 'Structure/Storytelling Arc', score: 3, description: 'Good analogy but slightly mechanical delivery.' },
          { name: 'Clarity & Conciseness', score: 4, description: 'Very clear and relatable analogy.' },
          { name: 'Filler-word density', score: 4, description: 'No filler words.' },
          { name: 'Vocabulary/Register', score: 3, description: 'Appropriate but could be richer.' }
        ],
        strengths: ['Creative timetable analogy.', 'Naturally introduced the concept of indexing.'],
        improvements: ['Extend the analogy to CRUD operations (adding a new subject, removing one).', 'Vary sentence lengths to sound more natural.'],
        rewrittenSentence: "A database is like a school timetable — a precisely organized index where every subject, room, and teacher is retrievable in an instant, eliminating the chaos of searching every classroom one by one.",
        evaluatedAt: daysAgo(13)
      }
    },
    // Day 11 - HR better
    {
      userId, id: makeId('att'), questionId: 'hr-2', module: 'hr',
      rawText: "Situation: During our 6-person backend project, one member kept missing standups and his assigned API endpoints weren't progressing. Task: Unblock our integration phase which depended on his authentication module. Action: I had a private Slack call with him and discovered he was stuck on JWT refresh token logic and felt embarrassed to ask. I spent two hours pair-programming the refresh flow with him and documented the pattern in our shared Confluence. Result: His module was merged within 36 hours. We hit our sprint deadline. Reflection: I learned that blockers are usually knowledge gaps, not attitude problems.",
      submittedAt: daysAgo(11),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 78,
        dimensionScores: [
          { name: 'Situation clarity', score: 4, description: 'Clear team context with specific blocker stated.' },
          { name: 'Task/goal clarity', score: 4, description: 'Integration dependency makes stakes clear.' },
          { name: 'Action specificity & ownership', score: 4, description: 'Direct, empathetic, and technically specific action.' },
          { name: 'Result/impact', score: 4, description: 'Merged in 36h, hit sprint deadline — good metrics.' },
          { name: 'Structure & conciseness', score: 4, description: 'Solid STAR structure.' },
          { name: 'Self-awareness/reflection', score: 4, description: 'Insightful reflection about root causes of blockers.' }
        ],
        strengths: ['Empathy-driven resolution without escalation.', 'Created lasting documentation artifact in Confluence.'],
        improvements: ['Mention how you created a psychological safety norm so teammates ask for help earlier next time.'],
        followUpQuestion: "You resolved this well. How did you change the team culture afterward to ensure people feel safe asking for help earlier?",
        evaluatedAt: daysAgo(11)
      }
    },
    // Day 9 - System Design
    {
      userId, id: makeId('att'), questionId: 'tech-5', module: 'technical',
      rawText: "API: POST /shorten, GET /:key. DB: Redis for hot URLs, PostgreSQL for persistence. Hash: MD5 first 6 chars, collision retry. Scale reads with CDN.", code: `# URL Shortener Design\n\n## APIs\n- POST /api/shorten { url } -> { shortKey }\n- GET /:shortKey -> 302 redirect\n\n## Database\n- PostgreSQL: id, short_key, long_url, created_at, clicks\n- Redis cache: shortKey -> longUrl (TTL 24h)\n\n## Key Generation\n- Hash longUrl with MD5, take first 6 chars\n- On collision: append counter and rehash\n\n## Scale\n- Read-heavy: CDN caches redirects at edge\n- Write: single writer, horizontal read replicas\n- Analytics: async Kafka events -> ClickHouse`,
      thinkAloudText: "URL shortener is read-heavy so I'll cache aggressively with Redis. Writes go to Postgres. I'll generate keys by hashing the URL and taking 6 chars — on collision I'll append an incrementing counter. For scale, a CDN handles the 302 redirects at edge, cutting latency. Analytics are async via Kafka so they don't block the redirect path.",
      submittedAt: daysAgo(9),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 86,
        dimensionScores: [
          { name: 'Problem Comprehension', score: 5, description: 'Correctly identified read-heavy nature immediately.' },
          { name: 'Approach & Trade-off reasoning', score: 4, description: 'Good Redis+Postgres split, could discuss sharding.' },
          { name: 'Implementation correctness & code quality', score: 4, description: 'Well-structured markdown with all key components.' },
          { name: 'Testing rigor & edge cases', score: 4, description: 'Mentioned collision handling and CDN caching.' },
          { name: 'Communication', score: 4, description: 'Clear explanation of architectural decisions.' }
        ],
        strengths: ['Async analytics via Kafka shows mature production thinking.', 'CDN for edge redirects is an excellent scale optimization.'],
        improvements: ['Discuss Base62 encoding as a better key generation approach than MD5 truncation.', 'Mention rate limiting to prevent abuse.'],
        suggestedCodeSolution: `# URL Shortener - Optimal Design\n\n## Key Generation (Base62 > MD5)\n- Auto-increment ID from DB -> encode in Base62\n- Guaranteed unique, no collision handling needed\n- Example: ID 12345 -> "dnh"\n\n## Read Path (optimized)\n1. Check Redis cache (< 1ms)\n2. If miss: Postgres lookup -> cache for 24h\n3. Return 302 redirect\n\n## Scale Bottlenecks\n- Rate limit writes: 100 URLs/min per IP\n- Shard Postgres by short_key range at 1B+ records\n- Multi-region Redis for global sub-10ms lookups`,
        evaluatedAt: daysAgo(9)
      }
    },
    // Day 7 - Communication strong
    {
      userId, id: makeId('att'), questionId: 'comm-3', module: 'communication',
      rawText: "The engineers who fear AI are making the same mistake as scribes who feared the printing press. The press didn't eliminate writers — it multiplied the reach of ideas. AI doesn't replace engineers — it multiplies their throughput. A mid-level engineer with strong prompting and architectural skills will soon outperform a senior engineer who refuses to adapt. The real competitive edge is no longer knowing every syntax rule — it is knowing what to build, why to build it, and how to verify AI-generated output for correctness and security.",
      submittedAt: daysAgo(7),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 87,
        dimensionScores: [
          { name: 'Grammar & Fluency', score: 5, description: 'Polished, flowing sentences with strong cadence.' },
          { name: 'Structure/Storytelling Arc', score: 4, description: 'Historical analogy → present reality → future advantage — excellent.' },
          { name: 'Clarity & Conciseness', score: 5, description: 'Every sentence earns its place.' },
          { name: 'Filler-word density', score: 5, description: 'Zero fillers — huge improvement from day 1.' },
          { name: 'Vocabulary/Register', score: 4, description: 'Strong register with memorable phrasing.' }
        ],
        strengths: ['Printing press analogy is original and memorable.', 'Clear actionable takeaway for the audience.'],
        improvements: ['Mention one concrete tool (Copilot, Gemini) to ground the abstract argument.'],
        rewrittenSentence: "Just as the printing press amplified writers rather than replacing them, AI amplifies engineers — and those who master architectural judgment over syntactical memorization will dominate the next decade.",
        evaluatedAt: daysAgo(7)
      }
    },
    // Day 5 - HR leadership strong
    {
      userId, id: makeId('att'), questionId: 'hr-3', module: 'hr',
      rawText: "Situation: Our college technical club's annual hackathon had zero corporate sponsors and was at risk of cancellation two months out. Task: Secure at least three sponsors to fund venue, prizes, and catering for 200 participants. Action: I cold-emailed forty-two local tech companies with a tailored pitch deck I built in Canva, highlighting our participant demographics and past projects. I followed up personally with each within 72 hours. I also negotiated a student discount with the venue by offering them a banner placement at the event. Result: Secured five sponsors totaling ₹1.8 lakhs, the hackathon ran successfully with 210 participants, and two sponsors offered internship interviews to top performers. Reflection: I discovered that leadership is often about removing the obstacles nobody else wants to deal with.",
      submittedAt: daysAgo(5),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 92,
        dimensionScores: [
          { name: 'Situation clarity', score: 5, description: 'High-stakes, concrete problem with real deadline.' },
          { name: 'Task/goal clarity', score: 5, description: 'Specific and measurable goal (3+ sponsors).' },
          { name: 'Action specificity & ownership', score: 5, description: '42 cold emails, 72h followups, venue negotiation — all owned.' },
          { name: 'Result/impact', score: 5, description: '5 sponsors, ₹1.8L, 210 participants, internship opportunities — exceptional.' },
          { name: 'Structure & conciseness', score: 5, description: 'Flawless STAR, excellent pacing.' },
          { name: 'Self-awareness/reflection', score: 4, description: 'Strong reflection on proactive obstacle removal.' }
        ],
        strengths: ['Exceptional quantified results across multiple dimensions.', 'Resourceful venue negotiation shows business acumen.'],
        improvements: ['Mention how you motivated other club members during the stressful sponsorship phase.'],
        followUpQuestion: "With five sponsors for one event, how did you manage each relationship simultaneously and ensure all their expectations were met on the day?",
        evaluatedAt: daysAgo(5)
      }
    },
    // Day 2 - Technical near perfect
    {
      userId, id: makeId('att'), questionId: 'tech-4', module: 'technical',
      rawText: "Fibonacci. Bottom-up, O(1) space.", code: `function climbStairs(n: number): number {\n  if (n <= 2) return n;\n  let prev = 1, curr = 2;\n  for (let i = 3; i <= n; i++) {\n    const next = prev + curr;\n    prev = curr;\n    curr = next;\n  }\n  return curr;\n}`,
      thinkAloudText: "Ways to reach step n = ways(n-1) + ways(n-2) because you can arrive from one step below or two steps below. This is Fibonacci. Naive recursion is O(2^N) — terrible. Bottom-up DP with a rolling window gives us O(N) time and O(1) space. Base: n=1 is 1 way, n=2 is 2 ways. I'll trace n=5: 1,2,3,5,8 — yes, 8 ways. Correct.",
      submittedAt: daysAgo(2),
      evaluation: {
        id: makeId('ev'), responseId: makeId('r'), overallScore: 94,
        dimensionScores: [
          { name: 'Problem Comprehension', score: 5, description: 'Instantly recognized the recurrence relation.' },
          { name: 'Approach & Trade-off reasoning', score: 5, description: 'Explicitly rejected O(2^N) and justified O(N)/O(1) choice.' },
          { name: 'Implementation correctness & code quality', score: 5, description: 'Clean, correct, minimal code.' },
          { name: 'Testing rigor & edge cases', score: 5, description: 'Manually traced n=5 to verify — excellent test habit.' },
          { name: 'Communication', score: 4, description: 'Narrated every step clearly.' }
        ],
        strengths: ['Manual trace verification during the interview — shows methodical thinking.', 'Explicitly compared naive recursion to justify optimization.'],
        improvements: ['Mention the matrix exponentiation O(log N) approach as a bonus for extra credit.'],
        suggestedCodeSolution: `// Optimal: O(N) time, O(1) space\nfunction climbStairs(n: number): number {\n  if (n <= 2) return n;\n  let [a, b] = [1, 2];\n  for (let i = 3; i <= n; i++) [a, b] = [b, a + b];\n  return b;\n}`,
        evaluatedAt: daysAgo(2)
      }
    }
  ];
  return attempts;
}

// ─── STAR STORIES ─────────────────────────────────────────────────────────────

function getSuryaStories(userId: string): any[] {
  return [
    {
      userId, id: makeId('story'), competency: 'Leadership', questionId: 'hr-3', questionText: 'Tell me about a time you took the initiative or led a project.',
      situation: 'Juniors in our lab wasted hours fighting Git merge conflicts they didn\'t understand.',
      task: 'Reduce this friction before the semester deadline crunch hit.',
      action: 'Designed a two-hour interactive Git Sandbox workshop with a playground repo and visual branch diagrams. Ran it voluntarily on a Saturday.',
      result: '42 students attended. Lab TAs reported a 55% drop in repo-related help tickets the following month.',
      reflection: 'Proactive teaching creates compound returns — each person I helped went on to help two others.',
      lastUpdated: daysAgo(7), updatedAt: daysAgo(7)
    },
    {
      userId, id: makeId('story'), competency: 'Conflict Resolution', questionId: 'hr-4', questionText: 'Describe a time you had a major professional disagreement.',
      situation: 'My capstone partner wanted a monolithic Express server; I advocated for microservices. Stalled architecture for a week.',
      task: 'Break the deadlock and submit our design doc before the faculty deadline.',
      action: 'Built two mini-prototypes in a weekend and ran Artillery load tests. Compiled data into a shared Notion doc. Proposed a pragmatic modular monolith as a middle path.',
      result: 'Partner aligned immediately. Submitted design doc 4 days early. Faculty advisor highlighted it as a model proposal.',
      reflection: 'The best way to win a technical argument is to replace the argument with data.',
      lastUpdated: daysAgo(3), updatedAt: daysAgo(3)
    }
  ];
}

function getJaswanthStories(userId: string): any[] {
  return [
    {
      userId, id: makeId('story'), competency: 'Teamwork', questionId: 'hr-2', questionText: 'Describe a situation where you had to work with a difficult teammate.',
      situation: 'A backend teammate kept missing standups and his JWT authentication module wasn\'t progressing, blocking our integration phase.',
      task: 'Unblock the authentication module within the sprint window.',
      action: 'Had a private Slack call, discovered he was stuck on refresh token logic. Spent 2 hours pair-programming the solution and documented the pattern in Confluence.',
      result: 'Module merged within 36 hours. Sprint deadline met.',
      reflection: 'Blockers are usually knowledge gaps, not attitude problems. Creating a safe space to ask for help is a leadership act.',
      lastUpdated: daysAgo(11), updatedAt: daysAgo(11)
    },
    {
      userId, id: makeId('story'), competency: 'Leadership', questionId: 'hr-3', questionText: 'Tell me about a time you took the initiative or led a project.',
      situation: 'Our college hackathon had zero sponsors and was at risk of cancellation two months before the event.',
      task: 'Secure at least 3 sponsors to fund venue, prizes, and catering for 200 participants.',
      action: 'Cold-emailed 42 tech companies with a custom pitch deck. Followed up within 72 hours with each. Negotiated a student discount with the venue in exchange for banner placement.',
      result: '5 sponsors secured, ₹1.8 lakhs raised. Hackathon ran with 210 participants. 2 sponsors offered internship interviews to top performers.',
      reflection: 'Leadership is often about removing the obstacles nobody else wants to deal with.',
      lastUpdated: daysAgo(5), updatedAt: daysAgo(5)
    }
  ];
}

// ─── MAIN SEED FUNCTION ───────────────────────────────────────────────────────

async function seed() {
  console.log('Connecting to MongoDB...');
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);

  const users = db.collection('users');
  const attemptsCol = db.collection('attempts');
  const storiesCol = db.collection('stories');

  const password = await bcrypt.hash('123123', 10);
  const now = new Date().toISOString();

  const demoUsers = [
    { name: 'Surya Ganesh',       email: 'ganeshh4419@gmail.com',      password, createdAt: daysAgo(20), lastActive: daysAgo(1) },
    { name: 'Jaswanth Kuchipudi', email: 'kuchipudijaswanth1@gmail.com', password, createdAt: daysAgo(21), lastActive: daysAgo(2) }
  ];

  for (const demo of demoUsers) {
    // Remove existing user + their data
    const existing = await users.findOne({ email: demo.email });
    if (existing) {
      await attemptsCol.deleteMany({ userId: existing._id.toString() });
      await storiesCol.deleteMany({ userId: existing._id.toString() });
      await users.deleteOne({ email: demo.email });
      console.log(`Removed existing user: ${demo.email}`);
    }

    const result = await users.insertOne(demo);
    const userId = result.insertedId.toString();
    console.log(`Created user: ${demo.name} (${userId})`);

    const userAttempts = demo.email === 'ganeshh4419@gmail.com'
      ? getSuryaAttempts(userId)
      : getJaswanthAttempts(userId);

    const userStories = demo.email === 'ganeshh4419@gmail.com'
      ? getSuryaStories(userId)
      : getJaswanthStories(userId);

    if (userAttempts.length) {
      await attemptsCol.insertMany(userAttempts);
      console.log(`  Inserted ${userAttempts.length} attempts`);
    }

    if (userStories.length) {
      await storiesCol.insertMany(userStories);
      console.log(`  Inserted ${userStories.length} STAR stories`);
    }
  }

  console.log('\n✅ Demo users seeded successfully!');
  console.log('  Email: ganeshh4419@gmail.com       | Password: 123123');
  console.log('  Email: kuchipudijaswanth1@gmail.com | Password: 123123');

  await client.close();
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
