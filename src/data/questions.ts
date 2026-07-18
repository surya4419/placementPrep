import { Question } from '../types';

export const STARTER_QUESTIONS: Question[] = [
  // --- COMMUNICATION LAB ---
  {
    id: 'comm-1',
    module: 'communication',
    topic: 'Self-Introduction',
    difficulty: 'easy',
    promptText: 'Introduce yourself as if you are starting a technical job interview. Highlight your background, key achievements, and what excites you about software engineering.',
    rubricId: 'comm-rubric'
  },
  {
    id: 'comm-2',
    module: 'communication',
    topic: 'Explain Like I\'m 5',
    difficulty: 'medium',
    promptText: 'Explain the concept of "Database" to a 5-year-old child using a relatable analogy (e.g., a toy box, a library, etc.). Avoid any technical jargon.',
    rubricId: 'comm-rubric'
  },
  {
    id: 'comm-3',
    module: 'communication',
    topic: 'Extempore',
    difficulty: 'hard',
    promptText: 'Speak for 1-2 minutes on: "Is generative AI a threat or an empowering tool for modern software engineering careers?"',
    rubricId: 'comm-rubric'
  },
  {
    id: 'comm-4',
    module: 'communication',
    topic: 'Storytelling',
    difficulty: 'medium',
    promptText: 'Tell a brief story about a time you had to learn a completely new tool or skill over a weekend to solve a sudden problem.',
    rubricId: 'comm-rubric'
  },
  {
    id: 'comm-5',
    module: 'communication',
    topic: 'Explain Like I\'m 5',
    difficulty: 'medium',
    promptText: 'Explain how "The Internet" works to a non-programmer using an everyday analogy (e.g., mailing letters, phone calls).',
    rubricId: 'comm-rubric'
  },
  {
    id: 'comm-6',
    module: 'communication',
    topic: 'Extempore',
    difficulty: 'easy',
    promptText: 'Argue for or against: "Should remote work remain the default setting for software engineering teams?"',
    rubricId: 'comm-rubric'
  },
  {
    id: 'comm-7',
    module: 'communication',
    topic: 'Explain Like I\'m 5',
    difficulty: 'hard',
    promptText: 'Explain the concept of "Recursion" in programming to someone who has never written a single line of code.',
    rubricId: 'comm-rubric'
  },

  // --- HR INTERVIEW SIMULATOR ---
  {
    id: 'hr-1',
    module: 'hr',
    topic: 'Problem-Solving',
    difficulty: 'medium',
    promptText: 'Tell me about a time you faced a difficult technical challenge during a project. What was the situation, and how did you resolve it?',
    rubricId: 'hr-rubric',
    companyStyle: 'Google'
  },
  {
    id: 'hr-2',
    module: 'hr',
    topic: 'Teamwork',
    difficulty: 'easy',
    promptText: 'Describe a situation where you had to work with a difficult teammate or peer. How did you manage the relationship to ensure the project\'s success?',
    rubricId: 'hr-rubric',
    companyStyle: 'Amazon'
  },
  {
    id: 'hr-3',
    module: 'hr',
    topic: 'Leadership',
    difficulty: 'medium',
    promptText: 'Can you tell me about a time you took the initiative or led a project/initiative? What drove you to do so, and what was the ultimate impact?',
    rubricId: 'hr-rubric',
    companyStyle: 'Meta'
  },
  {
    id: 'hr-4',
    module: 'hr',
    topic: 'Conflict Resolution',
    difficulty: 'hard',
    promptText: 'Describe a time you had a major professional disagreement with a peer, stakeholder, or supervisor. How did you mediate the conflict and arrive at a solution?',
    rubricId: 'hr-rubric',
    companyStyle: 'Netflix'
  },
  {
    id: 'hr-5',
    module: 'hr',
    topic: 'Adaptability',
    difficulty: 'medium',
    promptText: 'Tell me about a time when the requirements of a project or assignment changed suddenly at the eleventh hour. How did you adapt your plan?',
    rubricId: 'hr-rubric',
    companyStyle: 'Apple'
  },
  {
    id: 'hr-6',
    module: 'hr',
    topic: 'Motivation & Fit',
    difficulty: 'easy',
    promptText: 'Why are you interested in joining our engineering team, and what makes you uniquely qualified to excel in this specific role?',
    rubricId: 'hr-rubric',
    companyStyle: 'Microsoft'
  },
  {
    id: 'hr-7',
    module: 'hr',
    topic: 'Self-Awareness',
    difficulty: 'medium',
    promptText: 'What is your greatest technical or professional weakness, and what concrete steps have you taken over the past year to address and improve it?',
    rubricId: 'hr-rubric',
    companyStyle: 'Stripe'
  },
  {
    id: 'hr-8',
    module: 'hr',
    topic: 'Resilience',
    difficulty: 'hard',
    promptText: 'Tell me about a time you failed to deliver on a commitment or experienced a project failure. What happened, and what did you learn from that experience?',
    rubricId: 'hr-rubric',
    companyStyle: 'Uber'
  },

  // --- TECHNICAL SIMULATOR ---
  {
    id: 'tech-1',
    module: 'technical',
    topic: 'Arrays & Hash Maps',
    difficulty: 'easy',
    promptText: 'Given an array of integers "nums" and an integer "target", return indices of the two numbers such that they add up to "target". You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    rubricId: 'tech-rubric',
    language: 'typescript',
    codeTemplate: `function twoSum(nums: number[], target: number): number[] {
  // Write your code here
  return [];
}`
  },
  {
    id: 'tech-2',
    module: 'technical',
    topic: 'Strings & Stacks',
    difficulty: 'easy',
    promptText: 'Given a string "s" containing just the characters \'( \', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets, and open brackets are closed in the correct order.',
    rubricId: 'tech-rubric',
    language: 'typescript',
    codeTemplate: `function isValid(s: string): boolean {
  // Write your code here
  return false;
}`
  },
  {
    id: 'tech-3',
    module: 'technical',
    topic: 'Arrays & Sorting',
    difficulty: 'medium',
    promptText: 'Given an array of "intervals" where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
    rubricId: 'tech-rubric',
    language: 'typescript',
    codeTemplate: `function mergeIntervals(intervals: number[][]): number[][] {
  // Write your code here
  return [];
}`
  },
  {
    id: 'tech-4',
    module: 'technical',
    topic: 'Dynamic Programming',
    difficulty: 'medium',
    promptText: 'You are climbing a staircase. It takes "n" steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    rubricId: 'tech-rubric',
    language: 'typescript',
    codeTemplate: `function climbStairs(n: number): number {
  // Write your code here
  return 0;
}`
  },
  {
    id: 'tech-5',
    module: 'technical',
    topic: 'System Design',
    difficulty: 'hard',
    promptText: 'Design a highly scalable URL Shortening service (like bit.ly). Explain: 1. API Endpoints required. 2. Database schema and choice of DB. 3. Handling hash collisions and scaling read traffic. Write down your architectural breakdown and pseudocode below.',
    rubricId: 'tech-rubric',
    language: 'markdown',
    codeTemplate: `# URL Shortener Design

## 1. Requirements & Core APIs
- Shorten: POST /api/v1/shorten -> returns short URL
- Redirect: GET /{shortKey} -> redirects 302 to original URL

## 2. Database Schema
- [Write database schema & choice here]

## 3. High Level Architecture
- [Describe scaling, caching, key generation service here]`
  },
  {
    id: 'tech-6',
    module: 'technical',
    topic: 'Computer Science Fundamentals',
    difficulty: 'medium',
    promptText: 'Explain the fundamental differences between a "Process" and a "Thread". Detail how they manage memory, share state, and the performance implications of Multi-processing vs Multi-threading in modern backend engines.',
    rubricId: 'tech-rubric',
    language: 'markdown',
    codeTemplate: `# Process vs Thread Analysis

## 1. Memory and Resources
- Process: 
- Thread: 

## 2. State Sharing and Context Switching
- [Explain communication & latency here]

## 3. Practical Scenarios
- [When to choose multi-processing vs multi-threading]`
  },
  {
    id: 'tech-7',
    module: 'technical',
    topic: 'Linked Lists',
    difficulty: 'easy',
    promptText: 'Given the head of a singly linked list, reverse the list, and return its reversed head. Write an in-place iterative or recursive solution.',
    rubricId: 'tech-rubric',
    language: 'typescript',
    codeTemplate: `class ListNode {
    val: number
    next: ListNode | null
    constructor(val?: number, next?: ListNode | null) {
        this.val = (val===undefined ? 0 : val)
        this.next = (next===undefined ? null : next)
    }
}

function reverseList(head: ListNode | null): ListNode | null {
  // Write your code here
  return null;
}`
  }
];
