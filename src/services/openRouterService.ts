import axios from 'axios';
import { IdeaGenerationParams } from '../types/idea';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Rate limiting configuration
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 10000; // 10s base delay for retries
const RATE_LIMIT_REQUESTS = 2; // 2 requests per minute
const MIN_DELAY_MS = Math.ceil((60 * 1000) / RATE_LIMIT_REQUESTS); // 30000ms (30s)
const REQUEST_TIMEOUT = 60000; // 60s timeout
const MAX_CONCURRENT_REQUESTS = 2; // Limit concurrent requests

// Request queue and lock
const requestQueue: number[] = [];
const MAX_QUEUE_SIZE = RATE_LIMIT_REQUESTS;
let isProcessing = false;
interface PendingRequest {
  messages: Array<{ role: string; content: string }>;
  model: string;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  retryCount?: number;
}

const pendingRequests: PendingRequest[] = [];
const responseCache: Map<string, any> = new Map(); // Cache successful responses

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Calculate delay based on the request queue
const calculateDelay = (): number => {
  const now = Date.now();
  if (requestQueue.length < MAX_QUEUE_SIZE) {
    return 0;
  }
  const oldestRequest = requestQueue[0];
  const timeSinceOldest = now - oldestRequest;
  return Math.max(0, MIN_DELAY_MS - timeSinceOldest);
};

// Maintain the queue
const updateQueue = () => {
  const now = Date.now();
  requestQueue.push(now);
  while (requestQueue.length > 0 && now - requestQueue[0] >= 60 * 1000) {
    requestQueue.shift();
  }
  if (requestQueue.length > MAX_QUEUE_SIZE) {
    requestQueue.shift();
  }
};

// Process the next request in the queue
const processNextRequest = async () => {
  if (pendingRequests.length === 0 || isProcessing) return;

  isProcessing = true;
  const request = pendingRequests.shift()!;
  const { messages, model, resolve, reject } = request;

  try {
    const cacheKey = JSON.stringify({ messages, model });
    if (responseCache.has(cacheKey)) {
      console.log('Returning cached response for:', cacheKey.slice(0, 50) + '...');
      resolve(responseCache.get(cacheKey));
      isProcessing = false;
      processNextRequest();
      return;
    }

    const delayMs = calculateDelay();
    if (delayMs > 0) {
      console.log(`Rate limiting: waiting ${delayMs}ms before making request...`);
      await sleep(delayMs);
    }

    console.log('Making API request to OpenRouter...');
    console.log('Messages:', JSON.stringify(messages, null, 2));
    console.log('Current queue size:', requestQueue.length);

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3001',
          'Content-Type': 'application/json',
          'X-Title': 'Business Plan Generator'
        },
        timeout: REQUEST_TIMEOUT
      }
    );

    updateQueue();
    console.log('Request queue size after success:', requestQueue.length);

    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response format from OpenRouter API');
    }

    if (response.data.error) {
      throw new Error(`API Error: ${response.data.error.message || 'Unknown error'}`);
    }

    if (!response.data.choices || response.data.choices.length === 0) {
      throw new Error('Empty response from OpenRouter API');
    }

    const content = response.data.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid response format from AI');
    }

    responseCache.set(cacheKey, response.data); // Cache successful response
    resolve(response.data);
  } catch (error: any) {
    console.error('OpenRouter API error:', error.response?.data || error.message);

    if (error.response?.status === 429) {
      const currentRetryCount = (request?.retryCount || 0) + 1;
      if (currentRetryCount < MAX_RETRIES) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, currentRetryCount - 1);
        console.log(`Rate limit exceeded. Retrying in ${delayMs}ms (attempt ${currentRetryCount}/${MAX_RETRIES})...`);
        await sleep(delayMs);
        pendingRequests.unshift({ messages, model, resolve, reject, retryCount: currentRetryCount }); // Retry by re-queueing
      } else {
        console.error('Max retries reached. Giving up.');
        reject(new Error('API Error: Rate limit exceeded after maximum retries'));
      }
    } else {
      if (error.response?.status === 402) {
        reject(new Error('OpenRouter API requires credits. Please visit https://openrouter.ai/settings/credits to add credits.'));
      } else if (error.response?.status === 401) {
        reject(new Error('Invalid OpenRouter API key. Please check your configuration.'));
      } else if (error.response?.status === 404) {
        reject(new Error('Selected AI model is not available. Please try again.'));
      } else if (error.response?.status === 408 || error.code === 'ECONNABORTED') {
        reject(new Error('Request timed out. Please try again.'));
      } else {
        reject(new Error(error.message || 'Failed to make OpenRouter request'));
      }
    }
  } finally {
    isProcessing = false;
    processNextRequest();
  }
};

export const makeOpenRouterRequest = (
  messages: Array<{ role: string; content: string }>,
  model = 'qwen/qwen2.5-vl-72b-instruct:free'
): Promise<any> => {
  return new Promise((resolve, reject) => {
    pendingRequests.push({ messages, model, resolve, reject });
    if (pendingRequests.length <= MAX_CONCURRENT_REQUESTS) {
      processNextRequest();
    }
  });
};

// Patch: Add a wrapper for better error logging and propagation
export async function makeOpenRouterRequestWithDebug(
  messages: Array<{ role: string; content: string }>,
  model = 'qwen/qwen2.5-vl-72b-instruct:free'
): Promise<any> {
  try {
    return await makeOpenRouterRequest(messages, model);
  } catch (err: any) {
    // Log and propagate the actual error message
    const errorMsg = err?.message || JSON.stringify(err) || 'Unknown OpenRouter error';
    console.error('[OpenRouter DEBUG] Error:', errorMsg);
    throw new Error('[OpenRouter] ' + errorMsg);
  }
}

export const generateBusinessIdea = async (params: IdeaGenerationParams): Promise<string> => {
  // Helper to extract section content
  function extractSection(label: string, text: string): string {
    const regex = new RegExp(`${label}\\s*([\\s\\S]*?)(?=\n[A-Z][\\w ]+:|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  const requiredSections = [
    'Title:', 'Description:', 'Market Analysis:', 'Required Skills:', 'Idea Fitness:',
    'MVP Features:', 'Differentiation:', 'Revenue Model:', 'Scalability Plan:', 'Deep Insights:', 'Cost Breakdown:'
  ];

  const systemMessage = `You are an expert startup advisor and business strategist. Your task is to generate innovative, practical business ideas that STRICTLY match the user's constraints, especially their budget.\n\nCRITICAL RULES:\n1. If you omit or leave blank ANY required section, your response is invalid and will be rejected.\n2. NEVER suggest ideas requiring more capital than the user's specified budget\n3. Focus on lean, bootstrappable ideas when budget is under $5K\n4. Suggest only realistic features and plans that can be executed within the budget\n5. Consider cost-effective alternatives and minimal viable solutions\n6. If budget is low, emphasize digital products, services, or low-overhead businesses\n7. Always explain how the idea can be started within the specified budget range\n8. Include specific cost breakdowns in the analysis\n9. Format your response according to the exact template provided.\n10. If you do not include ALL required sections, you will NOT get credit for this task.\n`;

  const prompt = `Generate a practical, budget-conscious business idea based on the following parameters:\n\nSTRICT BUDGET CONSTRAINT: $${params.budget[0]} - $${params.budget[1]}\nThis budget limit is ABSOLUTE - do not suggest anything requiring more capital.\n\nConsider:\n- User Type: ${params.userType}\n- Industries of Interest: ${params.industries.join(', ')}\n- Technical Skills: ${params.technicalSkills.join(', ')}\n- Time Available: ${params.timeCommitment}\n- Risk Tolerance: ${params.riskLevel}\n- Key Challenges: ${params.challenges.join(', ')}\n${params.focusNiche ? `- Target Niche: ${params.focusNiche}` : ''}\n${params.suggestTrending ? '- Consider current market trends and emerging technologies' : ''}\n${params.suggestCompetitors ? '- Include competitor analysis' : ''}\n\nFormat the response as follows:\n\nTitle: [Practical, budget-friendly product/service name]\n\nDescription: [Two sentences: First describing the core offering, second explaining how it fits within the budget]\n\nMarket Analysis:\n- Market Size: [High/Medium/Low]\n- Competition Level: [High/Medium/Low]\n- Industry: [Single-word category]\n- Business Model: [Specific revenue model]\n- Initial Investment: [Must be within $${params.budget[0]} - $${params.budget[1]}]\n\nRequired Skills:\n- [Technical Skill]\n- [Business Skill]\n- [Optional Additional Skill]\n\nIdea Fitness:\n[3-4 sentences: First on market fit, second on skill match, third on budget feasibility, optional fourth on growth potential]\n\nMVP Features:\n1. [Essential Feature Name - Include approximate cost]\nDescription: [One sentence explaining the feature and its budget-conscious implementation]\n2. [Core Feature Name - Include approximate cost]\nDescription: [One sentence explaining the feature and its budget-conscious implementation]\n3. [Basic Feature Name - Include approximate cost]\nDescription: [One sentence explaining the feature and its budget-conscious implementation]\n\nDifferentiation:\n1. [Cost-effective Unique Selling Point]\nDescription: [One sentence on competitive advantage within budget constraints]\n2. [Resource-efficient Unique Selling Point]\nDescription: [One sentence on lean implementation approach]\n3. [Market-focused Unique Selling Point]\nDescription: [One sentence on customer value proposition]\n\nRevenue Model:\nPrimary Revenue: [Main revenue stream with ROI timeline]\nSecondary Revenue: [Additional revenue stream requiring minimal extra investment]\n\nScalability Plan:\n1. [Launch Phase - First 3 months]\n- Timeline: [Specific milestones]\n- Costs: [Breakdown of initial expenses]\n- Goals: [Measurable targets]\n\n2. [Growth Phase - Months 4-12]\n- Expansion: [Key growth areas]\n- Investment: [Profit reinvestment strategy]\n- Metrics: [Success indicators]\n\n3. [Scale Phase - Year 2+]\n- Market: [Target market expansion]\n- Operations: [Team and process scaling]\n- Technology: [Platform/service improvements]\n\nDeep Insights:\n1. Market Demand:\n[2-3 sentences analyzing:\n- Target market size and demographics\n- Current market gaps and needs\n- Growth potential within budget constraints]\n\n2. Technological Feasibility:\n[2-3 sentences covering:\n- Required technical infrastructure\n- Implementation complexity\n- Available tools and resources within budget]\n\n3. Customer Retention:\n[2-3 sentences explaining:\n- User engagement strategies\n- Loyalty program implementation\n- Cost-effective retention tactics]\n\n4. Growth Strategy:\n[2-3 sentences detailing:\n- Initial market entry approach\n- Scaling roadmap\n- Resource allocation plan]\n\nCost Breakdown:\nInitial Setup ($${params.budget[0]} max):\n- Technology: [Software/tools costs]\n- Marketing: [Initial promotion budget]\n- Legal/Admin: [Registration/compliance costs]\n- Emergency Fund: [10-20% of total budget]\n\nMonthly Operations:\n- Fixed Costs: [List with amounts]\n- Variable Costs: [List with estimates]\n- Marketing Budget: [Monthly allocation]\n- Profit Margin: [Expected percentage]\n\nCRITICAL RULES:\n1. All costs MUST stay within $${params.budget[0]} - $${params.budget[1]}\n2. Each deep insight section MUST be detailed and actionable\n3. Scalability plan MUST be realistic for the budget\n4. All features and strategies MUST be implementable with available resources`;

  const messages = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: prompt }
  ];

  console.log('=== AI REQUEST START ===');
  console.log('Sending messages to AI:', JSON.stringify(messages, null, 2));

  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await makeOpenRouterRequest(messages);
      const content = response?.choices?.[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        throw new Error('Invalid response format from AI');
      }

      // Patch: Fill missing or empty sections with 'N/A' instead of error
      let patchedContent = content;
      const missingOrEmptySections = requiredSections.filter(section => {
        const sectionContent = extractSection(section, content);
        return !sectionContent || sectionContent.length < 5;
      });
      if (missingOrEmptySections.length > 0) {
        missingOrEmptySections.forEach(section => {
          const regex = new RegExp(`${section}\s*([\s\S]*?)(?=\n[A-Z][\w ]+:|$)`, 'i');
          if (!regex.test(patchedContent)) {
            patchedContent += `\n${section} N/A`;
          } else {
            patchedContent = patchedContent.replace(regex, `${section}\nN/A`);
          }
        });
      }
      return patchedContent;
    } catch (error: any) {
      lastError = error;
      if (attempt === 3) {
        console.error('AI failed after 3 attempts:', error.message);
        throw new Error('Failed to generate a complete business idea after 3 attempts. Please try again later. Details: ' + error.message);
      }
      // Wait a bit before retrying
      await new Promise(res => setTimeout(res, 1500));
    }
  }
  throw lastError;
};

// Updated technology plan prompt (used in businessPlanService.ts, but shown here for context)
export const generateTechnologyPlanPrompt = (title: string, ideaFitness: string) => {
  return [
    {
      role: 'user',
      content: `You are a technical architect. Generate a technology plan for this business idea in this exact JSON format:
{
  "coreStack": [
    {
      "category": "string",
      "description": "string"
    }
  ],
  "integrationCapabilities": {
    "description": "string",
    "categories": ["string"],
    "security": ["string"]
  }
}

Analyze this business idea:
Title: ${title}
Idea Fitness: ${ideaFitness}

Rules:
1. Core stack must include 4-5 key technology categories (e.g., AI/ML, Backend, Frontend, Data Processing)
2. Each category must have a detailed description of specific technologies
3. Integration capabilities must list 6-8 key integration categories in the "categories" array
4. Security must list 4-5 key security measures and compliance standards in the "security" array
5. "security" must be an array directly under "integrationCapabilities", NOT a separate object
6. Return ONLY the JSON object with no additional text`
    }
  ];
};