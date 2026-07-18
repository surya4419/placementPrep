import { ResponseAttempt, STARStory } from '../types';

// Let's programmatically generate 17 days of structured, realistic practice attempts ending on July 18, 2026.
// This ensures they align with the 17-day streak requirements, and show progressive learning (scores going from ~60% to ~95%).

export const generateMockData = (): { attempts: ResponseAttempt[]; starStories: STARStory[] } => {
  const attempts: ResponseAttempt[] = [];
  const starStories: STARStory[] = [];

  const baseDate = new Date(); // This represents July 18, 2026 (current time in container is 2026-07-18)
  
  // High quality realistic transcripts & code submissions for each day
  const dailyScenarios = [
    {
      // July 2, 2026 (17 days ago)
      dayOffset: 16,
      module: 'communication' as const,
      questionId: 'comm-1',
      topic: 'Self-Introduction',
      overallScore: 62,
      rawText: "Uh, so, hello. My name is Alex and I'm a software engineer student. I really like computers and I have done some React. I guess I built a weather app which was pretty cool and taught me some JavaScript. I wanted to apply to this job because, well, it's a famous company and I want to learn more from experts. That is all about me, thank you.",
      dimensionScores: [
        { name: 'Vocabulary & Style', score: 3, description: 'Basic vocabulary, heavily reliant on informal words ("pretty cool", "I guess").' },
        { name: 'Structure & Delivery', score: 3, description: 'Lacks a structured conclusion; introductory hook is weak.' },
        { name: 'Grammar & Clarity', score: 3, description: 'Frequent verbal pauses ("uh", "well") and trailing sentences.' },
        { name: 'Fluency & Pace', score: 3, description: 'Slightly rushed delivery with multiple fillers.' }
      ],
      strengths: [
        'Expressed clear enthusiasm for joining the industry.',
        'Successfully mentioned a relevant framework (React).'
      ],
      improvements: [
        'Eliminate filler phrases like "Uh", "well", and "I guess" to appear more authoritative.',
        'Use the chronological method (Past -> Present -> Future) to introduce your experience.'
      ],
      rewrittenSentence: "My name is Alex, a computer science graduate specializing in frontend development with React. I am eager to apply my skills to build high-performance user interfaces on your engineering team."
    },
    {
      // July 3, 2026 (16 days ago)
      dayOffset: 15,
      module: 'hr' as const,
      questionId: 'hr-1',
      topic: 'Problem-Solving',
      overallScore: 64,
      rawText: "There was a project where our database kept crashing during testing. I didn't know what to do at first because the error logs were super messy. But then I looked online and realized we forgot to index our foreign keys which was slowing down the queries. I ran a script to add indexes, and the database stopped crashing. Everyone was happy.",
      dimensionScores: [
        { name: 'STAR Alignment', score: 3, description: 'Lacks deep description of the Situation and specific Actions taken.' },
        { name: 'Leadership & Impact', score: 3, description: 'Passive voice. Quantitative impact is not stated.' },
        { name: 'Conflict & Resolution', score: 3, description: 'Simple resolution without structural reflection.' },
        { name: 'Professional Presence', score: 3, description: 'Very informal story description.' }
      ],
      strengths: [
        'Identified the correct root cause (database indexing).',
        'Demonstrated self-reliance in searching for solutions online.'
      ],
      improvements: [
        'Structure the answer using explicit STAR phases (Situation, Task, Action, Result).',
        'State the quantitative improvement (e.g., query speed reduced by 80%).'
      ],
      followUpQuestion: "Can you elaborate on how you monitored the database before making the change, and what steps you took to verify index performance?"
    },
    {
      // July 4, 2026 (15 days ago)
      dayOffset: 14,
      module: 'technical' as const,
      questionId: 'tech-1',
      topic: 'Arrays & Hash Maps',
      overallScore: 66,
      code: `function twoSum(nums: number[], target: number): number[] {
  // Simple brute force solution
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}`,
      thinkAloudText: "For Two Sum, I am going to loop through each number in the array using a nested loop, and then check if the sum equals the target. This will take O(N^2) time complexity, which is not optimal, but it is easy to write and verify correctness. Space is O(1).",
      dimensionScores: [
        { name: 'Code Correctness', score: 5, description: 'Perfect brute-force correctness that satisfies all edge cases.' },
        { name: 'Algorithm Optimal Quality', score: 2, description: 'Brute-force O(N^2) solution is highly sub-optimal; Hash Map O(N) is expected.' },
        { name: 'Analytical Thinking', score: 3, description: 'Correctly evaluated the Time and Space complexity of the brute force.' },
        { name: 'Think-Aloud Verbalization', score: 3, description: 'Silent while coding; only explained the approach briefly.' }
      ],
      strengths: [
        'Accurately calculated O(N^2) time and O(1) space constraints.',
        'Wrote extremely clean nested loops without syntax errors.'
      ],
      improvements: [
        'Optimize time complexity to O(N) by storing visited complements inside a Hash Map / JavaScript Object.',
        'Verbalize your thoughts as you write code, not just at the very beginning and end.'
      ],
      suggestedCodeSolution: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`
    },
    {
      // July 5, 2026 (14 days ago)
      dayOffset: 13,
      module: 'communication' as const,
      questionId: 'comm-2',
      topic: "Explain Like I'm 5",
      overallScore: 70,
      rawText: "A database is like a really big chest of drawers. Imagine you have hundreds of toys. Instead of leaving them scattered on the floor where they get lost, you put them in labeled boxes in your closet. When you want to find your Lego spaceship, you look at the drawer labeled 'Star Wars toys' and open it instantly. That is how computers keep track of millions of profiles without getting confused.",
      dimensionScores: [
        { name: 'Analogy Accuracy', score: 4, description: 'Clear analogy that matches structured schema concepts.' },
        { name: 'Vocabulary & Style', score: 3.5, description: 'Simple words, very appropriate for a kid.' },
        { name: 'Structure & Delivery', score: 3.5, description: 'Fluid narrative flow from problem to solution.' },
        { name: 'Fluency & Pace', score: 4, description: 'Excellent conversational tone.' }
      ],
      strengths: [
        'Creative analogy of the labeled drawers for table keys.',
        'Strong introductory scenario of toys on the floor (unstructured data).'
      ],
      improvements: [
        'Explain how someone searches for items or updates them to extend the analogy further.',
        'Refined vocabulary can add structural sophistication while keeping the concept child-safe.'
      ],
      rewrittenSentence: "A database is like a magical toy box with designated labels; when you ask for your blue toy, the box instantly slides open the exact drawer containing it."
    },
    {
      // July 6, 2026 (13 days ago)
      dayOffset: 12,
      module: 'hr' as const,
      questionId: 'hr-2',
      topic: 'Teamwork',
      overallScore: 72,
      rawText: "Situation: In our group project last semester, one teammate completely stopped writing his share of backend routes. Task: We were 4 days away from the submission deadline and missing our auth routes. Action: Instead of accusing him in our group chat, I scheduled a brief call. It turned out he was struggling with JWT session cookies and felt embarrassed. I paired up with him for two hours to explain cookie headers and we co-authored the routing logic. Result: We completed the auth system on time and secured an A grade. Reflection: I realized that communication blocks are often caused by anxiety rather than laziness.",
      dimensionScores: [
        { name: 'STAR Alignment', score: 4, description: 'Very clear divisions corresponding to Situation, Task, Action, and Result.' },
        { name: 'Leadership & Impact', score: 3.5, description: 'Strong leadership in resolving the blocking issue collaboratively.' },
        { name: 'Conflict & Resolution', score: 4, description: 'Empathy-driven conflict resolution.' },
        { name: 'Professional Presence', score: 3.5, description: 'Calm, mature, and professional tone throughout.' }
      ],
      strengths: [
        'Used a constructive approach rather than complaining to the advisor.',
        'Extremely logical structure with clear headers.'
      ],
      improvements: [
        'Highlight the long-term benefit (e.g., did that teammate continue contributing after you mentored him?).',
        'State how you might establish early warning checks in future projects to avoid eleventh-hour panics.'
      ],
      followUpQuestion: "That's a very empathetic approach. How did this incident change how you establish team expectations or progress checks at the start of new projects?",
      starStory: {
        competency: 'Teamwork',
        situation: ' তেammate stopped contributing auth routes 4 days before project deadline.',
        task: 'Deliver the secure authorization module on time to pass the course.',
        action: 'Conducted an empathetic one-on-one call, discovered a technical block, and paired up for two hours to mentor and co-author the logic.',
        result: 'Successfully deployed the authentication system on schedule, leading to an overall A grade.',
        reflection: 'Learned that underperformance is often driven by technical blocks or anxiety, and mentoring always yields better results than confrontation.'
      }
    },
    {
      // July 7, 2026 (12 days ago)
      dayOffset: 11,
      module: 'technical' as const,
      questionId: 'tech-2',
      topic: 'Strings & Stacks',
      overallScore: 75,
      code: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    ')': '(',
    '}': '{',
    ']': '['
  };
  
  for (let char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (pairs[char]) {
      if (stack.pop() !== pairs[char]) {
        return false;
      }
    }
  }
  return stack.length === 0;
}`,
      thinkAloudText: "To solve the Valid Parentheses problem, I'll use a stack to keep track of open brackets. As we iterate through the characters of the string, if we encounter an opening bracket, we push it onto our stack. If we see a closing bracket, we check if the stack is empty or if the top of the stack matches its corresponding opening bracket. If it does, we pop it; otherwise, return false. Time complexity is O(N) and space is O(N).",
      dimensionScores: [
        { name: 'Code Correctness', score: 5, description: 'Fully correct O(N) solution using a stack data structure.' },
        { name: 'Algorithm Optimal Quality', score: 4.5, description: 'Excellent linear time and space complexity solution.' },
        { name: 'Analytical Thinking', score: 4, description: 'Correctly analyzed why stack is appropriate for nested structures.' },
        { name: 'Think-Aloud Verbalization', score: 3.5, description: 'Walked through code logic smoothly, but could discuss bounding constraints.' }
      ],
      strengths: [
        'Used a clean hash map / record to map closing brackets to opening brackets.',
        'Correctly checked if the stack is completely empty at the end of execution.'
      ],
      improvements: [
        'Consider explaining the worst-case space constraints (e.g. string with only opening brackets like "[[[").'
      ],
      suggestedCodeSolution: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: { [key: string]: string } = {
    '(': ')',
    '[': ']',
    '{': '}'
  };
  
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (map[char]) {
      stack.push(map[char]);
    } else {
      if (stack.pop() !== char) return false;
    }
  }
  return stack.length === 0;
}`
    },
    {
      // July 8, 2026 (11 days ago)
      dayOffset: 10,
      module: 'communication' as const,
      questionId: 'comm-4',
      topic: 'Storytelling',
      overallScore: 78,
      rawText: "Last semester during our hackathon, our teammate who designed our AWS deployment crashed his car and couldn't attend. We had exactly forty-eight hours to deploy a complex Flask server connected to PostgreSQL. No one on the team had ever touched cloud instances. I volunteered to learn Docker and AWS ECS over the weekend. I spent eighteen hours reading docs, watching tutorials, and wrestling with security group rules. By Sunday morning, I got our dockerized containers running on ECS. We placed third in the hackathon, and I gained absolute confidence in my capacity to self-educate under intense pressure.",
      dimensionScores: [
        { name: 'Story Narrative Curve', score: 4, description: 'Excellent pacing, immediately hooks the listener with high-stakes conflict.' },
        { name: 'Vocabulary & Style', score: 4, description: 'Rich descriptions ("wrestling with security group rules", "absolute confidence").' },
        { name: 'Structure & Delivery', score: 4, description: 'Great progression of event timeline.' },
        { name: 'Fluency & Pace', score: 4, description: 'Strong, articulate verbal presentation.' }
      ],
      strengths: [
        'High-stakes hook that emphasizes immediate critical problems.',
        'Exceptional demonstration of proactive continuous learning.'
      ],
      improvements: [
        'Elaborate slightly on the specific Docker concepts you learned (e.g. multi-stage builds) to reinforce technical depth.'
      ],
      rewrittenSentence: "Confronted with an eleventh-hour deployment block during a hackathon, I taught myself Docker and AWS ECS within forty-eight hours, successfully launching our production containers and securing third place."
    },
    {
      // July 9, 2026 (10 days ago)
      dayOffset: 9,
      module: 'hr' as const,
      questionId: 'hr-3',
      topic: 'Leadership',
      overallScore: 80,
      rawText: "Situation: I noticed that new computer science students struggled immensely with Git and GitHub during labs, frequently overwriting each other's branches. Task: Create an accessible repository workshop to onboard forty students and reduce lab pipeline blocks. Action: I proposed a hands-on 'Git Sandbox' session to our faculty advisor. I designed interactive visual slides showing merge conflicts, and set up a playground repository where students could intentionally trigger and resolve conflicts. Result: Over forty-five students attended. Lab assistants reported a sixty percent drop in repository-related support requests. Reflection: I learned that leadership is about identifying systemic friction and designing educational tools to eliminate it.",
      dimensionScores: [
        { name: 'STAR Alignment', score: 4.5, description: 'Flawless STAR structure with clear markers.' },
        { name: 'Leadership & Impact', score: 4.5, description: 'Proactive solution to a widespread campus friction.' },
        { name: 'Conflict & Resolution', score: 3.5, description: 'Resolved systemic confusion smoothly.' },
        { name: 'Professional Presence', score: 4, description: 'Extremely confident, professional, and impact-oriented.' }
      ],
      strengths: [
        'Outstanding quantitative metrics (45+ students, 60% drop in issues).',
        'Demonstrates initiative outside of mandatory coursework.'
      ],
      improvements: [
        'Explain if you open-sourced the slides or created a persistent documentation page for future classes.'
      ],
      followUpQuestion: "This is a stellar initiative. If you were to scale this workshop to the entire engineering department, what automated tooling or CI checks would you suggest incorporating into student pipelines?",
      starStory: {
        competency: 'Leadership',
        situation: 'New students frequently encountered severe Git merge conflicts that slowed down shared lab assignments.',
        task: 'Onboard 40+ engineering students onto Git collaboration protocols.',
        action: 'Designed and hosted an interactive hands-on Git Sandbox workshop, including a playground repository for resolving merge conflicts safely.',
        result: 'Onboarded 45 students, causing a 60% reduction in lab repository issues reported by teaching assistants.',
        reflection: 'Discovered that true leadership is about addressing systemic friction points with highly accessible educational interventions.'
      }
    },
    {
      // July 10, 2026 (9 days ago)
      dayOffset: 8,
      module: 'technical' as const,
      questionId: 'tech-3',
      topic: 'Arrays & Sorting',
      overallScore: 82,
      code: `function mergeIntervals(intervals: number[][]): number[][] {
  if (intervals.length <= 1) return intervals;
  
  // Sort intervals by their start points
  intervals.sort((a, b) => a[0] - b[0]);
  
  const merged: number[][] = [intervals[0]];
  
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const lastMerged = merged[merged.length - 1];
    
    // Check if current interval overlaps with last merged interval
    if (current[0] <= lastMerged[1]) {
      lastMerged[1] = Math.max(lastMerged[1], current[1]);
    } else {
      merged.push(current);
    }
  }
  
  return merged;
}`,
      thinkAloudText: "To merge overlapping intervals, the key observation is that sorting the intervals by their start time simplifies comparison. If interval B starts after interval A ends, they don't overlap, and we can append B. Otherwise, they overlap, and we merge them by extending the end time of A to the maximum of A and B's endpoints. Sorting takes O(N log N) time, and merging takes O(N) linear scan, making overall time complexity O(N log N). Space complexity is O(N) for the output array.",
      dimensionScores: [
        { name: 'Code Correctness', score: 5, description: 'Perfect and robust. Correctly handles boundary condition overlaps.' },
        { name: 'Algorithm Optimal Quality', score: 4.5, description: 'Very efficient sorting approach with minimal extra space.' },
        { name: 'Analytical Thinking', score: 4.5, description: 'Articulated overlap condition beautifully.' },
        { name: 'Think-Aloud Verbalization', score: 4, description: 'Explains variables clearly as they are declared.' }
      ],
      strengths: [
        'Explicitly checked for array length boundaries at the start of execution.',
        'Wrote very clean code with intuitive descriptive variable names.'
      ],
      improvements: [
        'Mention the space complexity implications of in-place sorting vs generating a new array depending on the JS engine.'
      ],
      suggestedCodeSolution: `function mergeIntervals(intervals: number[][]): number[][] {
  if (intervals.length === 0) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const result: number[][] = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const prev = result[result.length - 1];
    const curr = intervals[i];
    if (curr[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], curr[1]);
    } else {
      result.push(curr);
    }
  }
  return result;
}`
    },
    {
      // July 11, 2026 (8 days ago)
      dayOffset: 7,
      module: 'communication' as const,
      questionId: 'comm-5',
      topic: "Explain Like I'm 5",
      overallScore: 84,
      rawText: "Think of the Internet like a worldwide postal service. When you visit a website like YouTube, your computer writes a letter asking for a video. Your computer slides this letter into a digital envelope with YouTube's unique physical address. This envelope travels through multiple local post offices, called routers, and arrives at YouTube's warehouse. YouTube's computer opens it, pack the video frames into thousands of tiny envelopes, and mails them right back. Your computer receives these envelopes, arranges them in order, and displays the video.",
      dimensionScores: [
        { name: 'Analogy Accuracy', score: 5, description: 'Masterful use of the postal service analogy to represent packets, IP addresses, and routers.' },
        { name: 'Vocabulary & Style', score: 4, description: 'Extremely vivid and accessible language for a general audience.' },
        { name: 'Structure & Delivery', score: 4.5, description: 'Maintains logical flow from request to packet reception.' },
        { name: 'Fluency & Pace', score: 4, description: 'Fluid speed with highly conversational pauses.' }
      ],
      strengths: [
        'Brilliant conceptualization of packets as envelopes and routers as local sorting offices.',
        'Covers bidirectional data flows (request and response) seamlessly.'
      ],
      improvements: [
        'Introduce the term "IP address" as a "digital house address" to bridge the analogy to standard CS terminology.'
      ],
      rewrittenSentence: "The internet acts like an instant global post office; your laptop mails digital letters requesting photos, and web servers mail thousands of tiny picture slices back to be compiled on your screen."
    },
    {
      // July 12, 2026 (7 days ago)
      dayOffset: 6,
      module: 'hr' as const,
      questionId: 'hr-4',
      topic: 'Conflict Resolution',
      overallScore: 85,
      rawText: "Situation: During our capstone architecture design, the lead UI developer insisted on writing custom client-side cache handlers, while I argued for leveraging React Query. The debate stalled the architecture draft for five days. Task: Resolve the design disagreement before the advisor checkpoint. Action: Rather than relying on opinion, I built a fast benchmark sandbox demonstrating both setups. I simulated network latencies and showed that React Query managed edge cases (like offline retry pipelines and polling) out-of-the-box with ninety percent fewer lines of code. I scheduled a coffee meeting to present this objective telemetry data. Result: My teammate agreed to use React Query, and we open-sourced our telemetry benchmark. Reflection: I learned that engineering conflicts should be resolved with unbiased telemetry rather than subjective debates.",
      dimensionScores: [
        { name: 'STAR Alignment', score: 5, description: 'A flawless, complete STAR layout.' },
        { name: 'Leadership & Impact', score: 4, description: 'Demonstrated exceptional technical decision-making and project pacing.' },
        { name: 'Conflict & Resolution', score: 5, description: 'Replaced personal pride with objective benchmark testing.' },
        { name: 'Professional Presence', score: 4.5, description: 'High emotional intelligence (EQ) and collaborative maturity.' }
      ],
      strengths: [
        'Excellent strategy of using empirical benchmarks to resolve arguments.',
        'Highly mature reflection focusing on telemetry over ego.'
      ],
      improvements: [
        'Mention how you ensured the UI developer still felt highly valued and in control of frontend cache boundaries.'
      ],
      followUpQuestion: "This is a classic engineering conflict resolved beautifully. How did you ensure your colleague stayed motivated and engaged with the caching strategy after selecting React Query?",
      starStory: {
        competency: 'Conflict Resolution',
        situation: 'A five-day architectural deadlock occurred between a peer desiring custom client cache code and myself advocating for React Query.',
        task: 'Resolve the dispute and finalize the project framework before the advisor review.',
        action: 'Built a benchmark sandbox simulating network latency and showing React Query handles automatic retries and reduces custom code by 90%. Hosted a non-confrontational data-sharing session.',
        result: 'Colleague adopted React Query enthusiastically, and we submitted our architectural blueprint on schedule with zero friction.',
        reflection: 'Discovered that technical disagreements should be resolved through objective prototyping and metrics rather than verbal persuasion.'
      }
    },
    {
      // July 13, 2026 (6 days ago)
      dayOffset: 5,
      module: 'technical' as const,
      questionId: 'tech-4',
      topic: 'Dynamic Programming',
      overallScore: 86,
      code: `function climbStairs(n: number): boolean | number {
  if (n <= 2) return n;
  
  let first = 1;
  let second = 2;
  
  for (let i = 3; i <= n; i++) {
    const third = first + second;
    first = second;
    second = third;
  }
  
  return second;
}`,
      thinkAloudText: "To find the number of ways to climb stairs, we can notice that the number of ways to reach step n is the sum of ways to reach step (n-1) and step (n-2). This is because we can only take 1 or 2 steps to arrive at n. This is mathematically equivalent to the Fibonacci sequence. Instead of using recursion which takes O(2^N) time, I will use an iterative approach with O(1) space, maintaining only the last two results. The time complexity is O(N) and space is O(1).",
      dimensionScores: [
        { name: 'Code Correctness', score: 5, description: 'Perfect space-optimized iterative solution.' },
        { name: 'Algorithm Optimal Quality', score: 5, description: 'Highly optimal O(N) time and O(1) space.' },
        { name: 'Analytical Thinking', score: 4.5, description: 'Clearly mapped step combinations to mathematical recurrences.' },
        { name: 'Think-Aloud Verbalization', score: 4.5, description: 'Spoke confidently about the exponential complexity of the recursive alternative.' }
      ],
      strengths: [
        'Optimized space down to O(1) directly, avoiding the need for an intermediate O(N) storage array.',
        'Extremely logical breakdown of base bounds.'
      ],
      improvements: [
        'Discuss what happens when N is extremely large and could result in integer overflow in TypeScript/JavaScript.'
      ],
      suggestedCodeSolution: `function climbStairs(n: number): number {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}`
    },
    {
      // July 14, 2026 (5 days ago)
      dayOffset: 4,
      module: 'communication' as const,
      questionId: 'comm-3',
      topic: 'Extempore',
      overallScore: 89,
      rawText: "Generative AI is not a structural threat to software engineering careers; instead, it represents an empowering cognitive catalyst. Historically, every shift in abstraction—from raw assembly code to high-level languages like C++ and Python—sparked fears of programmer obsolescence. In reality, these shifts increased developer leverage. Today, code generation tools handle boilerplates and routine syntactical writing, freeing engineers to focus on architectural topology, security boundaries, and user specifications. The role of an engineer is evolving from a syntactical 'coder' to an architectural 'orchestrator'. Those who master this collaborative co-pilot relationship will produce secure, feature-rich platforms at ten times their current velocity.",
      dimensionScores: [
        { name: 'Argument Structure', score: 5, description: 'Superb classical argumentation. Contrasts historical shifts with modern reality.' },
        { name: 'Vocabulary & Style', score: 4.5, description: 'Rich, elevated industry terms ("cognitive catalyst", "architectural topology", "abstraction").' },
        { name: 'Structure & Delivery', score: 4.5, description: 'Persuasive structural layout with clear opening, transition, and conclusion.' },
        { name: 'Fluency & Pace', score: 4.5, description: 'Strong, rhythmic professional delivery.' }
      ],
      strengths: [
        'Outstanding historical context comparing LLMs to compilers.',
        'Extremely authoritative tone with no reliance on verbal fillers.'
      ],
      improvements: [
        'Briefly mention potential drawbacks like hallucinated vulnerabilities to present a more balanced analysis.'
      ],
      rewrittenSentence: "Rather than threatening software engineering, generative AI acts as a cognitive catalyst, elevating the developer's role from a syntactical writer to an architectural orchestrator."
    },
    {
      // July 15, 2026 (4 days ago)
      dayOffset: 3,
      module: 'hr' as const,
      questionId: 'hr-5',
      topic: 'Adaptability',
      overallScore: 88,
      rawText: "Situation: Our university hackathon team had worked twenty hours on a mobile recipe finder. Suddenly, the open-source cooking API we relied on revoked its public key due to a heavy DDoS attack. We had six hours left and no way to fetch recipes. Task: Salvage our core features without rewriting our entire SwiftUI interface. Action: I proposed shifting our app's value proposition from search to offline cookbook authoring. I quickly set up a local SQLite database inside the iOS container and loaded it with sixty seed recipes I scraped from open-source text files in ninety minutes. I rewired our network requests to fetch from this local cache. Result: We submitted our app on time as an offline recipe archive with zero broken UI states. We won the 'Best Offline Experience' sponsor award. Reflection: I learned that adaptability means embracing hard limits and focusing purely on user utility rather than original developer plans.",
      dimensionScores: [
        { name: 'STAR Alignment', score: 5, description: 'Excellent situational framing with high-stakes timeline.' },
        { name: 'Leadership & Impact', score: 4.5, description: 'Pivoted project successfully during a critical infrastructure collapse.' },
        { name: 'Conflict & Resolution', score: 4, description: 'Managed team panic and kept execution calm and focused.' },
        { name: 'Professional Presence', score: 4.5, description: 'Highly pragmatic and resilient mindset.' }
      ],
      strengths: [
        'Outstanding pivot to local SQLite databases under tight time constraints.',
        'Winning a sponsor award directly demonstrates the success of the pivot.'
      ],
      improvements: [
        'Detail how you divided the scraping and database wiring tasks among teammates to highlight delegation skills.'
      ],
      followUpQuestion: "A brilliant, high-pacing salvage! How did you communicate this massive change to your teammates to ensure everyone remained motivated and aligned during those final hours?",
      starStory: {
        competency: 'Adaptability',
        situation: 'Public API key was revoked six hours before a hackathon deadline, leaving the app unable to fetch online recipe data.',
        task: 'Redesign the application value proposition and source alternative data immediately.',
        action: 'Pivoted the application into an offline-first recipe manager. Integrated a local SQLite container and seeded it with 60 scraped recipe records.',
        result: 'Successfully completed the application, securing the Best Offline Experience sponsor award.',
        reflection: 'Learned that software engineers must remain unattached to initial architectures and prioritize functional user utility above all.'
      }
    },
    {
      // July 16, 2026 (3 days ago)
      dayOffset: 2,
      module: 'technical' as const,
      questionId: 'tech-5',
      topic: 'System Design',
      overallScore: 90,
      code: `# URL Shortener System Design Architecture

## 1. Functional & Non-Functional Requirements
- Shorten: Take URL -> Return short code (e.g. tiny.url/ab3C4)
- Redirect: Take short code -> 302 Redirect to original target URL
- Scale: 100M new URLs shortened/month. Read-to-write ratio of 100:1.
- Latency: Redirection must be sub-30ms.

## 2. API Design & Signature
- \`POST /api/v1/shorten\`
  - Request: \`{ longUrl: string, customAlias?: string }\`
  - Response: \`{ shortUrl: string }\`
- \`GET /{shortCode}\` -> Returns HTTP 302 Redirect Location header.

## 3. Database Selection & Database Schema
We will select a NoSQL key-value store like **MongoDB or Cassandra** because we require high-throughput key-value lookups without deep relational joins.

### Schema (Table: url_mapping)
- \`short_code\` (string, Partition Key)
- \`long_url\` (string)
- \`created_at\` (timestamp)
- \`expires_at\` (timestamp)

## 4. Hash Generation Service (KGS)
To generate unique 7-character hashes securely, we can use Base62 encoding:
- \`62^7 = 3.5 Trillion\` unique combinations, which is more than enough.
- To avoid hash collisions, we can run a dedicated **Key Generation Service (KGS)** that pre-allocates blocks of unique keys in memory using Apache ZooKeeper to coordinate node ranges.

## 5. Scaling & Latency (Caching Layer)
Since the system is read-heavy, we will mount a **Redis Caching Layer** in front of the database:
- We will cache the top 20% most active redirect URLs (the 80/20 rule).
- Cache Eviction Policy: Least Recently Used (LRU).
- Database is partitioned by a hash of the \`short_code\` to scale horizontally.`,
      thinkAloudText: "For this URL shortener system design, I have structured my requirements, APIs, and database schemas. Because we are dealing with massive scale (100:1 read ratio), I'm prioritizing sub-30ms read latency. I will select MongoDB as our persistent layer, and use Redis as an LRU-cache holding our hottest keys. For key generation, I rejected online md5 hashing to avoid collisions; instead, I'm proposing an offline Key Generation Service coordinate with Zookeeper to hand out pre-reserved ranges of Base62 keys.",
      dimensionScores: [
        { name: 'System Completeness', score: 5, description: 'Exhaustive design covering functional scales, ZooKeeper, and caching topologies.' },
        { name: 'Infrastructure Selection', score: 4.5, description: 'Solid justifications for NoSQL and Redis cached layers.' },
        { name: 'Scalability & Tradeoffs', score: 4.5, description: 'Excellent discussion of KGS and Apache ZooKeeper key ranges.' },
        { name: 'Communication & Structuring', score: 5, description: 'Extremely clear Markdown structuring with beautiful modular sections.' }
      ],
      strengths: [
        'Excellent mathematical analysis of Base62 7-character scales (3.5T keys).',
        'Incredibly detailed KGS/ZooKeeper coordination explanation to bypass standard hashing collisions.'
      ],
      improvements: [
        'Add a brief description of how you would handle analytics (e.g. click counts) without blocking the hot redirect path.'
      ],
      suggestedCodeSolution: `// No code recommended for architectural designs. System setup is stellar!`
    },
    {
      // July 17, 2026 (2 days ago)
      dayOffset: 1,
      module: 'communication' as const,
      questionId: 'comm-6',
      topic: 'Extempore',
      overallScore: 92,
      rawText: "Remote work should remain the default setting for software engineering teams, primarily because code quality, architectural review, and documentation clarity thrive in asynchronous cultures. When teams are distributed, they are forced to establish rigorous, written technical specifications instead of relying on informal, ephemeral water-cooler chats. Every system design is committed to a wiki, and pull requests require deep, written, peer-reviewed rationale. Furthermore, remote work opens talent access to a global pool, allowing teams to hire specialized engineers regardless of geography. While real-time collaboration requires deliberate scheduling, the resulting focus blocks and reduction in commuting exhaustion yield happier, highly focused, and incredibly productive engineering organizations.",
      dimensionScores: [
        { name: 'Argument Structure', score: 5, description: 'Extremely compelling argument focusing on code-review hygiene and async cultures.' },
        { name: 'Vocabulary & Style', score: 4.5, description: 'Highly formal, professional prose ("asynchronous cultures", "ephemeral water-cooler chats").' },
        { name: 'Structure & Delivery', score: 4.5, description: 'Flawless progression.' },
        { name: 'Fluency & Pace', score: 5, description: 'Eloquent, clear, and perfectly articulated.' }
      ],
      strengths: [
        'Unique perspective linking remote work to improved technical documentation standards.',
        'Superb vocabulary and elegant rhetorical execution.'
      ],
      improvements: [
        'Briefly acknowledge the onboarding friction for fresh graduates and how a remote team can mitigate it.'
      ],
      rewrittenSentence: "By shifting communication from ephemeral office chats to rigorous asynchronous documentation, remote work significantly elevates software engineering and code review standards."
    },
    {
      // July 18, 2026 (Today, 0 days ago)
      dayOffset: 0,
      module: 'technical' as const,
      questionId: 'tech-7',
      topic: 'Linked Lists',
      overallScore: 94,
      code: `function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr: ListNode | null = head;
  
  while (curr !== null) {
    const nextNode: ListNode | null = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextNode;
  }
  
  return prev;
}`,
      thinkAloudText: "To reverse a singly linked list in-place, we can iterate through the list while maintaining references to the previous node, current node, and next node. During each step, we save the next node to avoid losing our link. We then point our current node's next pointer to the previous node, slide the previous pointer up to current, and current up to the saved next node. This iterative solution runs in O(N) linear time and O(1) auxiliary space, which is optimal.",
      dimensionScores: [
        { name: 'Code Correctness', score: 5, description: 'Perfect in-place pointer reversal logic.' },
        { name: 'Algorithm Optimal Quality', score: 5, description: 'O(1) auxiliary space is fully optimal.' },
        { name: 'Analytical Thinking', score: 4.5, description: 'Demonstrated complete control of pointer reassignment steps.' },
        { name: 'Think-Aloud Verbalization', score: 5, description: 'Brilliant step-by-step description of pointer modification flow.' }
      ],
      strengths: [
        'Excellent avoidance of temporary node allocations.',
        'Wrote robust type guards for TypeScript compatibility.'
      ],
      improvements: [
        'Mention the recursive alternative and highlight its O(N) call-stack space trade-off.'
      ],
      suggestedCodeSolution: `function reverseList(head: ListNode | null): ListNode | null {
  let prev = null;
  let curr = head;
  while (curr) {
    let nextTemp = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextTemp;
  }
  return prev;
}`
    }
  ];

  // Map dailyScenarios to ResponseAttempt list
  dailyScenarios.forEach((scenario) => {
    const targetDate = new Date(baseDate);
    targetDate.setDate(baseDate.getDate() - scenario.dayOffset);
    // Add realistic hours/minutes differences
    targetDate.setHours(10 + (scenario.dayOffset % 5), 15 + (scenario.dayOffset * 3) % 45, 0);

    const submissionTime = targetDate.toISOString();
    const responseId = `resp-${scenario.module}-${1000 + scenario.dayOffset}-${targetDate.getTime()}`;
    const evalId = `eval-${scenario.module}-${1000 + scenario.dayOffset}-${targetDate.getTime()}`;

    const evaluation = {
      id: evalId,
      responseId: responseId,
      overallScore: scenario.overallScore,
      dimensionScores: scenario.dimensionScores,
      strengths: scenario.strengths,
      improvements: scenario.improvements,
      evaluatedAt: submissionTime,
      ...(scenario.module === 'communication' && { rewrittenSentence: (scenario as any).rewrittenSentence }),
      ...(scenario.module === 'hr' && { followUpQuestion: (scenario as any).followUpQuestion }),
      ...(scenario.module === 'technical' && { suggestedCodeSolution: (scenario as any).suggestedCodeSolution })
    };

    const attempt: ResponseAttempt = {
      id: responseId,
      questionId: scenario.questionId,
      module: scenario.module,
      rawText: scenario.rawText || '',
      submittedAt: submissionTime,
      evaluation: evaluation,
      ...(scenario.module === 'technical' && { 
        code: (scenario as any).code,
        thinkAloudText: (scenario as any).thinkAloudText
      })
    };

    attempts.push(attempt);

    // If there is an associated STAR story, add it to the list
    if (scenario.module === 'hr' && (scenario as any).starStory) {
      const ss = (scenario as any).starStory;
      starStories.push({
        id: `story-${scenario.questionId}`,
        competency: ss.competency,
        questionId: scenario.questionId,
        questionText: `[${scenario.topic}] Tell me about a time when...`,
        situation: ss.situation,
        task: ss.task,
        action: ss.action,
        result: ss.result,
        reflection: ss.reflection,
        lastUpdated: submissionTime
      });
    }
  });

  return { attempts, starStories };
};
