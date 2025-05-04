import { makeOpenRouterRequest, makeOpenRouterRequestWithDebug } from './openRouterService';
import { safeJsonParse } from '../utils/jsonRepair';

interface MarketShareData {
  name: string;
  value: number;
}

type SwotCategory = 'strengths' | 'weaknesses' | 'opportunities' | 'threats';

interface SwotAnalysisResponse {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  [key: string]: string[];
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface BusinessPlanData {
  title: string;
  ideaFitness: string;
}

interface UspResponse {
  mainUsp: string;
  supportingPoints: string[];
}

interface HowItWorksResponse {
  overview: string;
  steps: Array<{
    title: string;
    description: string;
  }>;
}

export const generateUsp = async (params: BusinessPlanData): Promise<UspResponse> => {
  try {
    const prompt = `You are a business strategist. Generate a unique selling proposition (USP) in this exact JSON format:
{
  "mainUsp": "string",
  "supportingPoints": ["string"]
}

Analyze this business idea and generate a compelling USP:
Title: ${params.title}
Idea Fitness: ${params.ideaFitness}

Rules:
1. Create a clear, concise main USP that highlights the key differentiator
2. Include 3-5 supporting points that reinforce the USP
3. Focus on unique benefits and value proposition
4. Keep language customer-centric and benefit-focused
5. Return ONLY the JSON object with no additional text`;


    const response = await makeOpenRouterRequest(
      [{ role: "user", content: prompt }],
      "mistralai/mistral-small-3.1-24b-instruct:free"
    ) as OpenRouterResponse;

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Empty response from OpenRouter API');
    }

    const content = response.choices[0].message.content;
    const cleanedContent = content.replace(/^```json\n|\n```$|^```|```$/g, '').trim();
    
    if (!cleanedContent) {
      throw new Error('Empty content after cleaning response');
    }

    let parsedResponse: UspResponse;
    try {
      parsedResponse = safeJsonParse<UspResponse>(cleanedContent);

      if (!parsedResponse || typeof parsedResponse !== 'object') {
        throw new Error('Invalid response format: not a JSON object');
      }

      if (typeof parsedResponse.mainUsp !== 'string' || !parsedResponse.mainUsp.trim()) {
        throw new Error('Invalid response: mainUsp must be a non-empty string');
      }

      if (!Array.isArray(parsedResponse.supportingPoints) || parsedResponse.supportingPoints.length < 3) {
        throw new Error('Invalid response: supportingPoints must be an array with at least 3 items');
      }

      parsedResponse.supportingPoints = parsedResponse.supportingPoints
        .map(point => String(point).trim())
        .filter(point => point.length > 0);

      return parsedResponse;
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      console.error('Failed to parse USP:', errorMessage, { rawContent: content });
      throw new Error(`Failed to parse USP: ${errorMessage}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating USP:', errorMessage, { error });
    throw new Error(`Failed to generate USP: ${errorMessage}`);
  }
};

export const generateHowItWorks = async (params: BusinessPlanData): Promise<HowItWorksResponse> => {
  try {
    const prompt = `You are a product expert. Generate a clear explanation of how the product/service works in this exact JSON format:
{
  "overview": "string",
  "steps": [
    {
      "title": "string",
      "description": "string"
    }
  ]
}

Analyze this business idea and explain how it works:
Title: ${params.title}
Idea Fitness: ${params.ideaFitness}

Rules:
1. Write a clear, concise overview of how the product/service works
2. Break down the process into 4-6 logical steps
3. Each step should have a clear title and detailed description
4. Use simple, user-friendly language
5. Return ONLY the JSON object with no additional text`;

    const response = await makeOpenRouterRequest(
      [{ role: "user", content: prompt }],
      "mistralai/mistral-small-3.1-24b-instruct:free"
    ) as OpenRouterResponse;

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Empty response from OpenRouter API');
    }

    const content = response.choices[0].message.content;
    const cleanedContent = content.replace(/^```json\n|\n```$|^```|```$/g, '').trim();
    
    if (!cleanedContent) {
      throw new Error('Empty content after cleaning response');
    }

    let parsedResponse: HowItWorksResponse;
    try {
      parsedResponse = safeJsonParse<HowItWorksResponse>(cleanedContent);

      if (!parsedResponse || typeof parsedResponse !== 'object') {
        throw new Error('Invalid response format: not a JSON object');
      }

      if (typeof parsedResponse.overview !== 'string' || !parsedResponse.overview.trim()) {
        throw new Error('Invalid response: overview must be a non-empty string');
      }

      if (!Array.isArray(parsedResponse.steps) || parsedResponse.steps.length < 4) {
        throw new Error('Invalid response: steps must be an array with at least 4 items');
      }

      parsedResponse.steps = parsedResponse.steps.map((step, index) => {
        if (!step || typeof step !== 'object') {
          throw new Error(`Invalid step format at index ${index}`);
        }

        const title = String(step.title || '').trim();
        const description = String(step.description || '').trim();

        if (!title) {
          throw new Error(`Missing title for step ${index + 1}`);
        }

        if (!description) {
          throw new Error(`Missing description for step ${index + 1}`);
        }

        return { title, description };
      });

      return parsedResponse;
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      console.error('Failed to parse How It Works:', errorMessage, { rawContent: content });
      throw new Error(`Failed to parse How It Works: ${errorMessage}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating How It Works:', errorMessage, { error });
    throw new Error(`Failed to generate How It Works: ${errorMessage}`);
  }
};

export interface ProblemOpportunityResponse {
  problemPoints: string[];
  opportunityPoints: string[];
}

export interface MarketSizeData {
  year: string;
  totalMarket: number;
  targetSegment: number;
  ourShare: number;
}

export interface MarketSizeResponse {
  marketSizeData: MarketSizeData[];
}

export interface ProductFeature {
  title: string;
  description: string;
}

export interface ProductOfferingResponse {
  features: ProductFeature[];
}

export interface SellingPoint {
  title: string;
  description: string;
}

export interface WorkflowStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface SolutionDetailsResponse {
  sellingPoints: SellingPoint[];
  workflowSteps: WorkflowStep[];
}

export interface BusinessPlanResponse {
  title: string;
  introduction: string;
  investmentOpportunity: string;
  metrics: any;
  swot: any;
  competitorAnalysis: any;
  marketSize: any;
  productOffering: any;
  solutionDetails: any;
  subscriptionPlans: any;
  growthProjections: any;
  status?: 'success' | 'error';
  message?: string;
}

export interface PlanFeature {
  feature: string;
  included: boolean;
}

export interface SubscriptionPlan {
  name: string;
  price: number;
  isPopular?: boolean;
  features: PlanFeature[];
}

export interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[];
}

export interface CustomerSegment {
  segment: string;
  description: string;
  characteristics: string[];
  needs: string[];
  marketSize: string;
}

export interface CustomerSegmentsResponse {
  segments: CustomerSegment[];
  marketAnalysis: {
    totalMarketSize: string;
    growthRate: string;
    keyTrends: string[];
  };
}

export const generateSolutionDetails = async (params: BusinessPlanData): Promise<SolutionDetailsResponse> => {
  try {
    console.log('Generating solution details for:', params.title);
    
    const messages = [
      {
        role: 'system',
        content: `You are an expert business strategist. Generate unique selling propositions and workflow steps for this business idea.
        Return ONLY a JSON object with this exact structure (no markdown, no code blocks, no extra text):
        {
          "sellingPoints": [
            {
              "title": "string",
              "description": "string"
            }
          ],
          "workflowSteps": [
            {
              "stepNumber": number,
              "title": "string",
              "description": "string"
            }
          ]
        }

        Rules:
        1. Exactly 3 selling points
        2. Exactly 4 workflow steps (not more, not less!)
        3. Step numbers must be sequential (1,2,3,4)
        4. No empty strings
        5. No duplicate titles
        6. Return ONLY the JSON object, no other text
        7. Double-check that you return exactly 4 workflow steps before responding. If you generate more or less, correct it before sending the response.`
      },
      {
        role: 'user',
        content: `Generate unique selling propositions and workflow steps for this business idea:
        Title: ${params.title}
        Fitness Assessment: ${params.ideaFitness}
        
        Format as a single JSON object with:
        - Exactly 3 selling points highlighting key advantages
        - Exactly 4 workflow steps showing how it works (not more, not less!)
        
        Double-check that you return exactly 4 workflow steps before responding. If you generate more or less, correct it before sending the response.
        
        Return ONLY the JSON object, no other text.`
      }
    ];

    const response = await makeOpenRouterRequest(messages);
    const content = response.choices[0].message.content.trim();
    
    try {
      const cleanedContent = content.replace(/^```json\n|\n```$/g, '').trim();
      const parsedContent = safeJsonParse<SolutionDetailsResponse>(cleanedContent);
      
      if (!Array.isArray(parsedContent.sellingPoints) || !Array.isArray(parsedContent.workflowSteps)) {
        throw new Error('Invalid response format: Missing required arrays');
      }
      
      if (parsedContent.sellingPoints.length !== 3) {
        throw new Error('Invalid response: Must have exactly 3 selling points');
      }
      // Make workflow steps robust: always return 4 valid steps
      let validSteps = (parsedContent.workflowSteps
        .map((step: any) => ({
          stepNumber: Number(step.stepNumber),
          title: String(step.title || '').trim(),
          description: String(step.description || '').trim()
        }))
        .filter(step => [1,2,3,4].includes(step.stepNumber) && step.title && step.description)
        .sort((a, b) => a.stepNumber - b.stepNumber)
      );
      // If too many, take first 4; if too few, fill with placeholders
      const placeholders = [
        { stepNumber: 1, title: 'Step 1', description: 'Describe step 1.' },
        { stepNumber: 2, title: 'Step 2', description: 'Describe step 2.' },
        { stepNumber: 3, title: 'Step 3', description: 'Describe step 3.' },
        { stepNumber: 4, title: 'Step 4', description: 'Describe step 4.' }
      ];
      for (let i = validSteps.length; i < 4; i++) {
        validSteps.push(placeholders[i]);
      }
      validSteps = validSteps.slice(0, 4);
      parsedContent.workflowSteps = validSteps;
      
      parsedContent.sellingPoints = (parsedContent.sellingPoints
        .map((point: any) => ({
          title: String(point.title || '').trim(),
          description: String(point.description || '').trim()
        }))
        .filter(point => point.title && point.description)) as SellingPoint[];

      const stepMap = new Map<number, WorkflowStep>();
      parsedContent.workflowSteps.forEach((step: any) => {
        const n = Number(step.stepNumber);
        if ([1,2,3,4].includes(n) && step.title && step.description) {
          stepMap.set(n, {
            stepNumber: n,
            title: String(step.title).trim(),
            description: String(step.description).trim()
          });
        }
      });
      // Fill in missing steps with placeholders
      const workflowSteps: WorkflowStep[] = [];
      for (let i = 1; i <= 4; i++) {
        if (stepMap.has(i)) {
          workflowSteps.push(stepMap.get(i)!);
        } else {
          workflowSteps.push({
            stepNumber: i,
            title: `Step ${i}`,
            description: `Describe step ${i}.`
          });
        }
      }
      parsedContent.workflowSteps = workflowSteps;
      
      const isValid = parsedContent.sellingPoints.every((point: SellingPoint) => 
        point.title.length > 0 && point.description.length > 0
      ) && parsedContent.workflowSteps.every((step: WorkflowStep) =>
        step.title.length > 0 && step.description.length > 0
      );
      
      if (!isValid) {
        throw new Error('Invalid response: Contains empty strings');
      }
      
      return parsedContent;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to parse solution details:', errorMessage, { rawContent: content });
      throw new Error(`Failed to parse solution details: ${errorMessage}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating solution details:', errorMessage, { error });
    throw new Error(`Failed to generate solution details: ${errorMessage}`);
  }
};

export const generateProductOffering = async (params: BusinessPlanData): Promise<ProductOfferingResponse> => {
  try {
    console.log('Generating product offering for:', params.title);
    
    const messages = [
      {
        role: 'system',
        content: 'You are a product strategist. Generate core product features for this business idea.'
      },
      {
        role: 'user',
        content: `Generate 3 core product features for this business idea:

Title: ${params.title}
Fitness Assessment: ${params.ideaFitness}

Provide the response in this EXACT format (no additional text or formatting):
{
  "features": [
    {
      "title": "Feature Name",
      "description": "Clear description of the feature and its value"
    }
  ]
}`
      }
    ];

    const response = await makeOpenRouterRequest(messages, "mistralai/mistral-small-3.1-24b-instruct:free");

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenRouter API');
    }

    const content = response.choices[0].message.content;
    console.log('Raw AI response:', content);

    // Clean the response
    const cleanedContent = content
      .replace(/^```json\s*|```$/g, '') // Remove code blocks
      .replace(/\\n/g, ' ')  // Replace escaped newlines
      .replace(/\\(?!["{}\[\]])/g, '') // Remove invalid escapes except for JSON syntax
      .trim();

    console.log('Cleaned content:', cleanedContent);

    try {
      const parsedContent = safeJsonParse<ProductOfferingResponse>(cleanedContent);

      // Validate the structure
      if (!parsedContent || typeof parsedContent !== 'object') {
        throw new Error('Invalid response format: not a JSON object');
      }

      if (!Array.isArray(parsedContent.features)) {
        throw new Error('Invalid response format: features must be an array');
      }

      // Validate each feature
      parsedContent.features = parsedContent.features.map(feature => {
        if (!feature.title || !feature.description) {
          throw new Error('Invalid feature format: missing title or description');
        }
        return {
          title: String(feature.title).trim(),
          description: String(feature.description).trim()
        };
      });

      return parsedContent;
    } catch (error) {
      const parseError = error instanceof Error ? error.message : 'Unknown parsing error';
      console.error('Parse error:', parseError, '\nContent:', content);
      throw new Error(`Failed to parse product offering: ${parseError}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating product offering:', errorMessage);
    throw new Error(`Failed to generate product offering: ${errorMessage}`);
  }
};

export const generateMarketSize = async (params: BusinessPlanData): Promise<MarketSizeResponse> => {
  try {
    console.log('Generating market size projections for:', params.title);
    
    const currentYear = new Date().getUTCFullYear();
    const years = Array.from({length: 5}, (_, i) => (currentYear + i).toString());
    
    const prompt = `Generate 5-year market size projections for this business idea:

Title: ${params.title}
Idea Fitness Assessment: ${params.ideaFitness}

Provide market size data for years ${years.join(', ')} in the following JSON format only, with no additional text:
{
  "marketSizeData": [
    {
      "year": "${years[0]}",
      "totalMarket": 1000000,
      "targetSegment": 200000,
      "ourShare": 10000
    },
    ...
  ]
}

Ensure:
- Values are in dollars
- Total market represents the entire addressable market
- Target segment is a subset of total market that we can realistically target
- Our share is our projected market capture
- Show realistic growth progression over the years
- Base the numbers on current market research and industry trends`;

    const response = await makeOpenRouterRequest([
      {
        role: 'system',
        content: 'You are a market research analyst specializing in market size projections. Provide data in strict JSON format with no additional text.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    console.log('Raw AI response:', response?.choices?.[0]?.message?.content);

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid or empty response');
    }

    const content = response.choices[0].message.content.trim();
    let parsedContent: MarketSizeResponse;

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      
      const cleanedContent = jsonStr.replace(/^```json\n|\n```$/g, '').trim();
      parsedContent = safeJsonParse(cleanedContent);
      
      if (!Array.isArray(parsedContent.marketSizeData)) {
        throw new Error('Response missing marketSizeData array');
      }
      
      if (parsedContent.marketSizeData.length === 0) {
        throw new Error('Market size data array is empty');
      }
      
      parsedContent.marketSizeData = parsedContent.marketSizeData.map(item => ({
        year: String(item.year),
        totalMarket: Number(item.totalMarket),
        targetSegment: Number(item.targetSegment),
        ourShare: Number(item.ourShare)
      }));
      
      for (const item of parsedContent.marketSizeData) {
        if (isNaN(item.totalMarket) || isNaN(item.targetSegment) || isNaN(item.ourShare)) {
          throw new Error('Invalid numeric values in market size data');
        }
        if (item.targetSegment > item.totalMarket || item.ourShare > item.targetSegment) {
          throw new Error('Invalid market size relationships: segments must be subsets');
        }
      }
      
      return parsedContent;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to parse market size:', errorMessage, { rawContent: content });
      throw new Error(`Failed to parse market size data: ${errorMessage}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating market size projections:', errorMessage, { error });
    throw new Error(`Failed to generate market size projections: ${errorMessage}`);
  }
};

export const generateProblemOpportunity = async (params: BusinessPlanData): Promise<ProblemOpportunityResponse> => {
  try {
    const prompt = `Based on this business idea, generate two lists of bullet points for a business plan:

Title: ${params.title}
Idea Fitness Assessment: ${params.ideaFitness}

Provide your response in the following JSON format only, with no additional text or explanation:
{
  "problemPoints": [
    "Problem point 1",
    "Problem point 2",
    "Problem point 3",
    "Problem point 4"
  ],
  "opportunityPoints": [
    "Opportunity point 1",
    "Opportunity point 2",
    "Opportunity point 3",
    "Opportunity point 4"
  ]
}

IMPORTANT: Only list problems that are extremely painful for the target users, are not yet solved by any major existing solution, and have little or no execution in the market. Avoid generic, basic, or already-solved problems. Every problem must be novel, impactful, and represent a true unmet need or gap in the market. Think like a world-class innovation strategist—do not repeat common or obvious issues. Ensure each point is specific, data-driven, and relevant to the business idea. The problemPoints should focus on current market challenges and pain points, while opportunityPoints should highlight market validation and growth potential.`;

    const response = await makeOpenRouterRequest([
      {
        role: 'system',
        content: 'You are a market research analyst. Your task is to generate business analysis in a strict JSON format. Only output valid JSON without any additional text or explanation.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    console.log('Raw AI response:', response?.choices?.[0]?.message?.content);

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid or empty response');
    }

    const content = response.choices[0].message.content.trim();
    let parsedContent: ProblemOpportunityResponse;

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      
      const cleanedContent = jsonStr.replace(/^```json\n|\n```$/g, '').trim();
      parsedContent = safeJsonParse(cleanedContent);
      
      let attempts = 0;
      while ((
        !Array.isArray(parsedContent.problemPoints) ||
        !Array.isArray(parsedContent.opportunityPoints) ||
        parsedContent.problemPoints.length === 0 ||
        parsedContent.opportunityPoints.length === 0
      ) && attempts < 3) {
        attempts++;
        // Re-call the LLM (OpenRouter) for a new response
        const retryResponse = await makeOpenRouterRequest([
          { role: 'system', content: 'You are a business strategist. Generate a business plan problem and opportunity section. Output ONLY valid JSON.' },
          { role: 'user', content: prompt }
        ]);
        const retryContent = retryResponse?.choices?.[0]?.message?.content?.trim() || '';
        const retryMatch = retryContent.match(/\{[\s\S]*\}/);
        const retryJson = retryMatch ? retryMatch[0] : retryContent;
        const retryClean = retryJson.replace(/^```json\n|\n```$/g, '').trim();
        try {
          parsedContent = safeJsonParse(retryClean);
        } catch (e) {
          // Log parse failure and continue
          console.error('Problem/Opportunity retry parse failed', {attempts, retryContent, retryClean});
        }
      }
      if (!Array.isArray(parsedContent.problemPoints) || parsedContent.problemPoints.length === 0) {
        parsedContent.problemPoints = ['No problem statement available.'];
      }
      if (!Array.isArray(parsedContent.opportunityPoints) || parsedContent.opportunityPoints.length === 0) {
        parsedContent.opportunityPoints = ['No market opportunity available.'];
      }
      parsedContent.problemPoints = parsedContent.problemPoints.map(point => String(point).trim());
      parsedContent.opportunityPoints = parsedContent.opportunityPoints.map(point => String(point).trim());
      
      parsedContent.problemPoints = parsedContent.problemPoints.filter(point => point.length > 0);
      parsedContent.opportunityPoints = parsedContent.opportunityPoints.filter(point => point.length > 0);
      
      return parsedContent;
      if (parsedContent.problemPoints.length === 0 || parsedContent.opportunityPoints.length === 0) {
        throw new Error('All points were empty or invalid');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to parse problem/opportunity:', errorMessage, { rawContent: content });
      throw new Error(`Failed to parse AI response: ${errorMessage}`);
    }

    return parsedContent;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating problem and opportunity statements:', errorMessage, { error });
    throw new Error(`Failed to generate problem and opportunity statements: ${errorMessage}`);
  }
};

export const generateBusinessPlan = async (params: BusinessPlanData): Promise<BusinessPlanResponse> => {
  // Helper for bulletproof JSON repair
  function sanitizeAndRepairJson(raw: string): string {
    let s = raw;
    s = s.replace(/```[a-zA-Z]*\n?|```/g, '');
    s = s.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
    s = s.replace(/,\s*([}\]])/g, '$1');
    s = s.replace(/"([^"]+)":([\s\S]*?)"\1":/g, '');
    s = s.replace(/("[^"]+":\s*[^,}\]]+,)(\s*"[^"]+":)/g, '$2');
    let open = (s.match(/\{/g) || []).length;
    let close = (s.match(/\}/g) || []).length;
    if (open > close) s += '}'.repeat(open - close);
    if (close > open) s = s.replace(/\}$/g, (m, i, str) => i >= str.length - (close - open) ? '' : m);
    return s.trim();
  }
  function parseIfString<T>(val: T|string): T {
    if (typeof val === 'string') {
      try {
        let cleaned = sanitizeAndRepairJson(val);
        return safeJsonParse(cleaned);
      } catch (e) {
        try {
          let cleaned = sanitizeAndRepairJson(val);
          return safeJsonParse(cleaned);
        } catch (err) {
          console.error('Failed to repair/parse value', { raw: val });
          return {} as T;
        }
      }
    }
    return val as T;
  }
  function isEmpty(val: any): boolean {
    if (val == null) return true;
    if (typeof val === 'string') return val.trim().length === 0;
    if (Array.isArray(val)) return val.length === 0 || val.every(isEmpty);
    if (typeof val === 'object') return Object.keys(val).length === 0 || Object.values(val).every(isEmpty);
    return false;
  }
  function defaultForField(field: string) {
    switch (field) {
      case 'title':
      case 'introduction':
      case 'investmentOpportunity':
        return '';
      case 'metrics':
      case 'swot':
      case 'competitorAnalysis':
      case 'marketSize':
      case 'productOffering':
      case 'solutionDetails':
      case 'subscriptionPlans':
      case 'growthProjections':
        return {};
      default:
        return '';
    }
  }
  try {
    console.log('Generating business plan for:', params.title);
    let introduction = '';
    let investmentOpportunity = '';
    let metrics = {};
    let swot = {};
    let competitorAnalysis = {};
    let marketSize = {};
    let productOffering = {};
    let solutionDetails = {};
    let subscriptionPlans = {};
    let growthProjections = {};
    // 1. Introduction
    try {
      const introPrompt = `Write a very brief business introduction (max 3-5 sentences) for this idea:\n\nTitle: ${params.title}\nIdea Fitness Assessment:\n${params.ideaFitness}\n\nFocus on the core concept and its unique value proposition. Be concise and professional.`;
      const introResponse = await makeOpenRouterRequestWithDebug([
        { role: 'system', content: 'You are a business analyst. Write very brief and concise business introductions in 2-3 sentences.' },
        { role: 'user', content: introPrompt }
      ]);
      introduction = introResponse?.choices?.[0]?.message?.content?.trim() || '';
    } catch (e) { console.error('Failed to generate introduction', e); introduction = ''; }
    // 2. Investment Opportunity
    try {
      const investmentPrompt = `Based on this business idea, generate a compelling investment opportunity section that includes the funding amount needed, equity offered, projected returns, and timeline. Make it concise but compelling.\n\nTitle: ${params.title}\nIdea Fitness Assessment:\n${params.ideaFitness}\n\nFormat your response like this example, but with appropriate values for this specific business:\n"We're seeking $X in seed funding to [key objectives]. Investors will receive Y% equity with projected returns of Zx within N years based on [justification]."\n\nBe realistic and specific with the numbers.`;
      const investmentResponse = await makeOpenRouterRequestWithDebug([
        { role: 'system', content: 'You are a venture capital analyst. Generate realistic and specific investment proposals.' },
        { role: 'user', content: investmentPrompt }
      ]);
      investmentOpportunity = investmentResponse?.choices?.[0]?.message?.content?.trim() || '';
    } catch (e) { console.error('Failed to generate investmentOpportunity', e); investmentOpportunity = ''; }
    // 3. Metrics
    try { metrics = await generateMetrics(params); } catch (e) { console.error('Failed to generate metrics', e); metrics = {}; }
    // 4. SWOT Analysis
    try { swot = await generateSwotAnalysis(params); } catch (e) { console.error('Failed to generate swot', e); swot = {}; }
    // 5. Competitor Analysis
    try { competitorAnalysis = await generateCompetitorAnalysis(params); } catch (e) { console.error('Failed to generate competitorAnalysis', e); competitorAnalysis = {}; }
    // 6. Market Size
    try { marketSize = await generateMarketSize(params); } catch (e) { console.error('Failed to generate marketSize', e); marketSize = {}; }
    // 7. Product Offering
    try { productOffering = parseIfString(await generateProductOffering(params)); } catch (e) { console.error('Failed to generate productOffering', e); productOffering = {}; }
    // 8. Solution Details
    try { solutionDetails = parseIfString(await generateSolutionDetails(params)); } catch (e) { console.error('Failed to generate solutionDetails', e); solutionDetails = {}; }
    // 9. Subscription Plans
    try { subscriptionPlans = parseIfString(await generateSubscriptionPlans(params)); } catch (e) { console.error('Failed to generate subscriptionPlans', e); subscriptionPlans = {}; }
    // 10. Growth Projections
    try { growthProjections = parseIfString(await generateGrowthProjections(params)); } catch (e) { console.error('Failed to generate growthProjections', e); growthProjections = {}; }
    // Always return all required fields, filling missing with defaults
    const requiredFields = {
      title: params.title || '',
      introduction,
      investmentOpportunity,
      metrics,
      swot,
      competitorAnalysis,
      marketSize,
      productOffering,
      solutionDetails,
      subscriptionPlans,
      growthProjections
    };
    // Fill any missing/empty fields with default values
    Object.keys(requiredFields).forEach((key) => {
      if (isEmpty((requiredFields as any)[key])) {
        (requiredFields as any)[key] = defaultForField(key);
      }
    });
    return {
      ...requiredFields,
      status: 'success',
      message: 'Successfully generated the business plan.'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating business plan:', errorMessage, { error });
    // Even on error, return all fields with defaults
    return {
      title: params.title || '',
      introduction: '',
      investmentOpportunity: '',
      metrics: {},
      swot: {},
      competitorAnalysis: {},
      marketSize: {},
      productOffering: {},
      solutionDetails: {},
      subscriptionPlans: {},
      growthProjections: {},
      status: 'error',
      message: `Failed to generate business plan: ${errorMessage}`
    };
  }
};

export const generateSubscriptionPlans = async (params: BusinessPlanData): Promise<SubscriptionPlansResponse> => {
  try {
    const prompt = `Generate subscription plans for this business:
    
Title: ${params.title}
Idea Fitness: ${params.ideaFitness}

Please provide the plans in this exact JSON format:
{
  "plans": [
    {
      "name": "Plan Name",
      "price": 99.99,
      "isPopular": true,
      "features": [
        { "feature": "Feature description", "included": true }
      ]
    }
  ]
}

Ensure the response is properly formatted JSON without any trailing commas.`;

    const response = await makeOpenRouterRequest([
      {
        role: 'system',
        content: 'You are a pricing strategy expert. Always respond with properly formatted JSON that matches the requested structure exactly. Do not include any trailing commas in arrays or objects.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    const content = response?.choices?.[0]?.message?.content;
    
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid response format from AI');
    }

    try {
      const cleanedContent = content.replace(/^```json\n|\n```$/g, '').trim();
      let parsedContent: SubscriptionPlansResponse;
      try {
        parsedContent = JSON.parse(cleanedContent) as SubscriptionPlansResponse;
      } catch (err) {
        // Try to repair JSON if direct parse fails
        try {
          // Dynamically import safeJsonParse to avoid circular deps
          // (or just import at top if no circular dep)
          // import { safeJsonParse } from '../utils/jsonRepair';
          // Use require to avoid TS import hoisting issues
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { safeJsonParse } = require('../utils/jsonRepair');
          parsedContent = safeJsonParse(cleanedContent) as SubscriptionPlansResponse;
          console.warn('[SubscriptionPlans] INFO: JSON parse failed, but repair succeeded.');
        } catch (repairErr) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          const repairMessage = repairErr instanceof Error ? repairErr.message : String(repairErr);
          console.error('[SubscriptionPlans] ERROR: Failed to parse and repair subscription plans JSON.', { errorMessage, repairMessage, rawContent: cleanedContent });
          throw new Error('Failed to parse and repair subscription plans JSON.');
        }
      }
      if (!parsedContent || !Array.isArray(parsedContent.plans)) {
        throw new Error('Invalid response format: Missing plans array');
      }
      const validatedResponse: SubscriptionPlansResponse = {
        plans: (parsedContent.plans
          .map((plan: any) => ({
            name: String(plan.name || ''),
            price: Number(plan.price) || 0,
            isPopular: Boolean(plan.isPopular),
            features: Array.isArray(plan.features) ? plan.features.map((feature: any) => ({
              feature: String(feature.feature || ''),
              included: Boolean(feature.included)
            })) : []
          })) as SubscriptionPlan[])
      };
      return validatedResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to parse subscription plans:', errorMessage, { rawContent: content });
      throw new Error(`Failed to parse subscription plans: ${errorMessage}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating subscription plans:', errorMessage, { error });
    throw new Error(`Failed to generate subscription plans: ${errorMessage}`);
  }
};

interface GrowthData {
  month: string;
  users: number;
  revenue: number;
}

interface MarketingStrategy {
  acquisitionStrategy: Array<{
    phase: string;
    title: string;
    description: string;
  }>;
  channelStrategy: Array<{
    channel: string;
    percentage: number;
  }>;
}

interface Challenge {
  title: string;
  description: string;
}

interface RoadmapPhase {
  phase: string;
  title: string;
  description: string;
  goals: string[];
}

interface Milestone {
  title: string;
  month: number;
  description: string;
}

interface StrategicRoadmapResponse {
  roadmapPhases: RoadmapPhase[];
  milestones: Milestone[];
}

interface RiskMitigation {
  title: string;
  description: string;
}

interface ChallengesResponse {
  challenges: Challenge[];
  mitigationStrategies: RiskMitigation[];
}

interface YearlyRevenue {
  revenue: number;
  plans: {
    startup: number;
    growth: number;
    scale: number;
  };
  customers: number;
  arpu: number;
  churnRate: number;
}

interface BurnRate {
  monthlyBurnRate: number;
  runwayMonths: number;
  expenses: {
    engineering: number;
    salesMarketing: number;
    operations: number;
    generalAdmin: number;
  };
}

interface FinancialMilestone {
  month: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
}

interface RevenueProjectionsResponse {
  yearlyRevenue: {
    year1: YearlyRevenue;
    year2: YearlyRevenue;
    year3: YearlyRevenue;
  };
  burnRate: BurnRate;
  milestones: FinancialMilestone[];
}

export interface TechnologyPlanResponse {
  coreStack: Array<{
    category: string;
    description: string;
  }>;
  integrationCapabilities: {
    description: string;
    categories: string[];
    security: string[];
  };
}

interface CoreStackItem {
  category: string;
  description: string;
}

export const generateRevenueProjections = async (params: BusinessPlanData): Promise<RevenueProjectionsResponse> => {
  try {
    const prompt = `You are a financial analyst. Generate revenue projections and financial metrics in this exact JSON format:
{
  "yearlyRevenue": {
    "year1": {
      "revenue": number,
      "plans": {
        "startup": number,
        "growth": number,
        "scale": number
      },
      "customers": number,
      "arpu": number,
      "churnRate": number
    },
    "year2": { same structure as year1 },
    "year3": { same structure as year1 }
  },
  "burnRate": {
    "monthlyBurnRate": number,
    "runwayMonths": number,
    "expenses": {
      "engineering": number,
      "salesMarketing": number,
      "operations": number,
      "generalAdmin": number
    }
  },
  "milestones": [
    {
      "month": number,
      "title": string,
      "description": string,
      "status": "completed" | "in-progress" | "upcoming"
    }
  ]
}

Analyze this business idea and generate realistic financial projections:
Title: ${params.title}
Idea Fitness: ${params.ideaFitness}

Rules:
1. Revenue should show realistic growth trajectory over 3 years
2. Plan distribution should reflect market maturity
3. Customer growth should align with revenue
4. ARPU should reflect market positioning
5. Burn rate and expenses should be realistic for the business model
6. Each expense category MUST be a non-zero percentage:
   - Engineering: 20-35%
   - Sales & Marketing: 25-40%
   - Operations: 20-35%
   - General & Admin: 10-20%
7. The sum of all expense percentages MUST equal 100
8. Include 5-7 key financial milestones
9. Return ONLY the JSON object with no additional text`;

    const response = await makeOpenRouterRequest(
      [{ role: "user", content: prompt }],
      "mistralai/mistral-small-3.1-24b-instruct:free"
    ) as OpenRouterResponse;

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Empty response from OpenRouter API');
    }

    const content = response.choices[0].message.content;
    const cleanedContent = content.replace(/^```json\n|\n```$|^```|```$/g, '').trim();
    
    if (!cleanedContent) {
      throw new Error('Empty content after cleaning response');
    }

    let parsedResponse: RevenueProjectionsResponse;
    try {
      parsedResponse = JSON.parse(cleanedContent) as RevenueProjectionsResponse;

      if (!parsedResponse || typeof parsedResponse !== 'object') {
        throw new Error('Invalid response format: not a JSON object');
      }

      ['year1', 'year2', 'year3'].forEach(year => {
        const yearData = parsedResponse.yearlyRevenue[year as keyof typeof parsedResponse.yearlyRevenue];
        if (!yearData || typeof yearData.revenue !== 'number' || !yearData.plans || typeof yearData.customers !== 'number' || 
            typeof yearData.arpu !== 'number' || typeof yearData.churnRate !== 'number') {
          throw new Error(`Invalid ${year} data structure`);
        }
      });

      if (!parsedResponse.burnRate || typeof parsedResponse.burnRate.monthlyBurnRate !== 'number' || 
          typeof parsedResponse.burnRate.runwayMonths !== 'number' || !parsedResponse.burnRate.expenses) {
        throw new Error('Invalid burn rate data structure');
      }

      // Validate and normalize expense percentages to total 100%
      const expenses = parsedResponse.burnRate.expenses;
      
      // Ensure all expense fields exist and are numbers
      if (typeof expenses.engineering !== 'number' || expenses.engineering === 0) expenses.engineering = 25;
      if (typeof expenses.salesMarketing !== 'number' || expenses.salesMarketing === 0) expenses.salesMarketing = 35;
      if (typeof expenses.operations !== 'number' || expenses.operations === 0) expenses.operations = 25;
      if (typeof expenses.generalAdmin !== 'number' || expenses.generalAdmin === 0) expenses.generalAdmin = 15;

      const totalExpensePercentage = expenses.engineering + expenses.salesMarketing + expenses.operations + expenses.generalAdmin;
      
      if (Math.abs(totalExpensePercentage - 100) > 0.1) { // Allow for small floating point differences
        // Normalize the percentages to total 100%
        const normalizer = 100 / totalExpensePercentage;
        expenses.engineering = Math.round(expenses.engineering * normalizer * 10) / 10;
        expenses.salesMarketing = Math.round(expenses.salesMarketing * normalizer * 10) / 10;
        expenses.operations = Math.round(expenses.operations * normalizer * 10) / 10;
        expenses.generalAdmin = Math.round(expenses.generalAdmin * normalizer * 10) / 10;
      }

      if (!Array.isArray(parsedResponse.milestones) || parsedResponse.milestones.length < 5) {
        throw new Error('Invalid milestones: must be an array with at least 5 items');
      }

      return parsedResponse;
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      console.error('Failed to parse revenue projections:', errorMessage, { rawContent: content });
      throw new Error(`Failed to parse revenue projections: ${errorMessage}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating revenue projections:', errorMessage, { error });
    throw new Error(`Failed to generate revenue projections: ${errorMessage}`);
  }
};

export const generateChallenges = async (params: BusinessPlanData): Promise<ChallengesResponse> => {
  try {
    const prompt = `You are a business strategist. Generate key challenges and risk mitigation strategies in this exact JSON format:
{
  "challenges": [
    {
      "title": "string",
      "description": "string"
    }
  ],
  "mitigationStrategies": [
    {
      "title": "string",
      "description": "string"
    }
  ]
}

Analyze this business idea and identify key challenges and mitigation strategies:
Title: ${params.title}
Idea Fitness: ${params.ideaFitness}

Rules:
1. Identify 4-5 major challenges or risks
2. For each challenge, provide a clear description of its impact
3. Provide corresponding mitigation strategies
4. Focus on realistic and actionable strategies
5. Return ONLY the JSON object with no additional text`;

    const response = await makeOpenRouterRequest(
      [{ role: "user", content: prompt }],
      "mistralai/mistral-small-3.1-24b-instruct:free"
    ) as OpenRouterResponse;

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Empty response from OpenRouter API');
    }

    const content = response.choices[0].message.content;
    const cleanedContent = content.replace(/^```json\n|\n```$|^```|```$/g, '').trim();
    
    if (!cleanedContent) {
      throw new Error('Empty content after cleaning response');
    }

    let parsedResponse: ChallengesResponse;
    try {
      parsedResponse = JSON.parse(cleanedContent) as ChallengesResponse;

      if (!parsedResponse || typeof parsedResponse !== 'object') {
        throw new Error('Invalid response format: not a JSON object');
      }

      if (!Array.isArray(parsedResponse.challenges) || parsedResponse.challenges.length < 4) {
        throw new Error('Invalid challenges: must be an array with at least 4 items');
      }

      if (!Array.isArray(parsedResponse.mitigationStrategies) || parsedResponse.mitigationStrategies.length < 4) {
        throw new Error('Invalid mitigation strategies: must be an array with at least 4 items');
      }

      return parsedResponse;
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      console.error('Failed to parse challenges:', errorMessage, { rawContent: content });
      throw new Error(`Failed to parse challenges: ${errorMessage}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating challenges:', errorMessage, { error });
    throw new Error(`Failed to generate challenges: ${errorMessage}`);
  }
};

export const generateTechnologyPlan = async (params: BusinessPlanData): Promise<TechnologyPlanResponse> => {
  try {
    const prompt = `You are a technical architect. Generate a technology plan for this business idea in this exact JSON format:
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
Title: ${params.title}
Idea Fitness: ${params.ideaFitness}

Rules:
1. Core stack must include 4-5 key technology categories (e.g., AI/ML, Backend, Frontend, Data Processing)
2. Each category must have a detailed description of specific technologies
3. Integration capabilities must list 6-8 key integration categories in the "categories" array
4. Security must list EXACTLY 4-5 key security measures and compliance standards in the "security" array
5. "security" must be an array directly under "integrationCapabilities", NOT a separate object
6. Return ONLY the JSON object with no additional text`;

    const response = await makeOpenRouterRequest(
      [{ role: "user", content: prompt }],
      "mistralai/mistral-small-3.1-24b-instruct:free"
    ) as OpenRouterResponse;

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Empty response from OpenRouter API');
    }

    const content = response.choices[0].message.content;
    const cleanedContent = content.replace(/^```json\n|\n```$/g, '').trim();
    
    if (!cleanedContent) {
      throw new Error('Empty content after cleaning response');
    }

    let parsedResponse: any; // Use any temporarily to handle potential malformed response
    try {
      parsedResponse = JSON.parse(cleanedContent);

      if (!parsedResponse || typeof parsedResponse !== 'object') {
        throw new Error('Invalid response format: not a JSON object');
      }

      // Transform response if security is a separate object
      if (parsedResponse.security && !parsedResponse.integrationCapabilities?.security) {
        console.log('Transforming separate "security" object into integrationCapabilities.security array');
        const securityArray = Array.isArray(parsedResponse.security.categories)
          ? parsedResponse.security.categories.slice(0, 5) // Limit to 5 if present
          : [
              "Data Encryption",
              "Access Controls",
              "Regular Audits",
              "Compliance Standards (HIPAA, GDPR)"
            ]; // Fallback default
        parsedResponse.integrationCapabilities = {
          ...parsedResponse.integrationCapabilities,
          security: securityArray
        };
        delete parsedResponse.security; // Remove the separate security object
      }

      // Validate and adjust coreStack
      if (!Array.isArray(parsedResponse.coreStack) || parsedResponse.coreStack.length < 4 || parsedResponse.coreStack.length > 5) {
        throw new Error(`Invalid response: coreStack must be an array with 4-5 items, got ${parsedResponse.coreStack?.length || 0}`);
      }

      // Validate and adjust integrationCapabilities
      if (!parsedResponse.integrationCapabilities || 
          typeof parsedResponse.integrationCapabilities !== 'object' ||
          !Array.isArray(parsedResponse.integrationCapabilities.categories) || 
          parsedResponse.integrationCapabilities.categories.length < 6 || 
          parsedResponse.integrationCapabilities.categories.length > 8) {
        throw new Error(`Invalid response: integrationCapabilities.categories must have 6-8 items, got ${parsedResponse.integrationCapabilities?.categories?.length || 0}`);
      }

      if (!Array.isArray(parsedResponse.integrationCapabilities.security)) {
        throw new Error('Invalid response: integrationCapabilities.security must be an array');
      }

      // Truncate security array to 5 items if it exceeds the limit
      if (parsedResponse.integrationCapabilities.security.length > 5) {
        console.log(`Security array has ${parsedResponse.integrationCapabilities.security.length} items, truncating to 5`);
        parsedResponse.integrationCapabilities.security = parsedResponse.integrationCapabilities.security.slice(0, 5);
      } else if (parsedResponse.integrationCapabilities.security.length < 4) {
        throw new Error(`Invalid response: integrationCapabilities.security must have 4-5 items, got ${parsedResponse.integrationCapabilities.security.length}`);
      }

      if (typeof parsedResponse.integrationCapabilities.description !== 'string' || 
          !parsedResponse.integrationCapabilities.description.trim()) {
        throw new Error('Invalid response: integrationCapabilities.description must be a non-empty string');
      }

      // Ensure all coreStack items are valid
      parsedResponse.coreStack = (parsedResponse.coreStack
        .map((item: any) => ({
          category: String(item.category || '').trim(),
          description: String(item.description || '').trim()
        }))
        .filter((item: CoreStackItem) => item.category && item.description)) as CoreStackItem[];

      if (parsedResponse.coreStack.length < 4) {
        throw new Error('Invalid response: coreStack must have at least 4 valid items after cleaning');
      }

      // Cast to TechnologyPlanResponse now that it's validated
      return parsedResponse as TechnologyPlanResponse;
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      console.error('Failed to parse technology plan:', errorMessage, { rawContent: content });
      throw new Error(`Failed to parse technology plan: ${errorMessage}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating technology plan:', errorMessage, { error });
    throw new Error(`Failed to generate technology plan: ${errorMessage}`);
  }
};

export const generateMarketingStrategy = async (params: BusinessPlanData): Promise<MarketingStrategy> => {
  try {
    const prompt = `You are a marketing strategist. Generate a marketing and go-to-market strategy in this exact JSON format:
{
  "acquisitionStrategy": [
    {
      "phase": "string",
      "title": "string",
      "description": "string"
    }
  ],
  "channelStrategy": [
    {
      "channel": "string",
      "percentage": number
    }
  ]
}

Analyze this business idea and create a marketing strategy:
Title: ${params.title}
Idea Fitness: ${params.ideaFitness}

Rules:
1. Create exactly 3 phases for the acquisition strategy
2. Each phase should have a clear title and detailed description
3. Create exactly 4 marketing channels with percentage allocation:
   - Social Media (25-35%)
   - Content Marketing (20-30%)
   - Email Marketing (15-25%)
   - Partnerships/Other (15-25%)
4. Channel percentages MUST sum to exactly 100%
5. Use realistic, actionable strategies
6. Return ONLY the JSON object with no additional text`;

    const response = await makeOpenRouterRequest(
      [{ role: "user", content: prompt }],
      "mistralai/mistral-small-3.1-24b-instruct:free"
    ) as OpenRouterResponse;

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Empty response from OpenRouter API');
    }

    const content = response.choices[0].message.content;
    const cleanedContent = content.replace(/^```json\n|\n```$|^```|```$/g, '').trim();
    
    if (!cleanedContent) {
      throw new Error('Empty content after cleaning response');
    }

    let parsedResponse: MarketingStrategy;
    try {
      parsedResponse = JSON.parse(cleanedContent) as MarketingStrategy;

      if (!parsedResponse || typeof parsedResponse !== 'object') {
        throw new Error('Invalid response format: not a JSON object');
      }

      if (!Array.isArray(parsedResponse.acquisitionStrategy)) {
        throw new Error('Invalid response format: acquisitionStrategy must be an array');
      }
      if (parsedResponse.acquisitionStrategy.length !== 3) {
        throw new Error('Invalid response: Must have exactly 3 acquisition phases');
      }

      parsedResponse.acquisitionStrategy = (parsedResponse.acquisitionStrategy
        .map((phase, index) => {
          if (!phase || typeof phase !== 'object') {
            throw new Error(`Invalid phase format at index ${index}`);
          }

          const phaseNum = index + 1;
          return {
            phase: `Phase ${phaseNum}`,
            title: String(phase.title || '').trim(),
            description: String(phase.description || '').trim()
          };
        }) as MarketingStrategy['acquisitionStrategy']);

      if (!Array.isArray(parsedResponse.channelStrategy)) {
        throw new Error('Invalid response format: channelStrategy must be an array');
      }
      if (parsedResponse.channelStrategy.length !== 4) {
        throw new Error('Invalid response: Must have exactly 4 channels');
      }

      parsedResponse.channelStrategy = (parsedResponse.channelStrategy
        .map((channel, index) => {
          if (!channel || typeof channel !== 'object') {
            throw new Error(`Invalid channel format at index ${index}`);
          }

          const percentage = Number(channel.percentage);
          if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            throw new Error(`Invalid percentage for channel ${channel.channel}: ${channel.percentage}`);
          }

          return {
            channel: String(channel.channel || '').trim(),
            percentage
          };
        }) as MarketingStrategy['channelStrategy']);

      const totalPercentage = parsedResponse.channelStrategy.reduce((sum, channel) => sum + channel.percentage, 0);
      if (Math.abs(totalPercentage - 100) > 0.1) {
        throw new Error(`Channel percentages must sum to 100, got ${totalPercentage}`);
      }

      return parsedResponse;
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      console.error('Failed to parse marketing strategy:', errorMessage, { rawContent: content });
      throw new Error(`Failed to parse marketing strategy: ${errorMessage}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating marketing strategy:', errorMessage, { error });
    throw new Error(`Failed to generate marketing strategy: ${errorMessage}`);
  }
};

interface GrowthProjectionResponse {
  growthData: GrowthData[];
}

interface BusinessMetrics {
  annualRevenuePotential: string;
  marketSize: string;
  projectedUsers: string;
  timeToBreakeven: string;
  initialInvestment: string;
  competitiveEdge: string;
}

export const generateMetrics = async (params: BusinessPlanData): Promise<BusinessMetrics> => {
  try {
    const prompt = `You are a business analyst. Generate key business metrics in this exact JSON format:
{
  "annualRevenuePotential": "string (e.g. $500K - $1M)",
  "marketSize": "string (e.g. $5B)",
  "projectedUsers": "string (e.g. 50K - 100K)",
  "timeToBreakeven": "string (e.g. 18-24 months)",
  "initialInvestment": "string (e.g. $250K - $500K)",
  "competitiveEdge": "string (short phrase e.g. AI-Powered Solution)"
}

Analyze this business idea and generate realistic metrics:
Title: ${params.title}
Idea Fitness: ${params.ideaFitness}

Rules:
1. Use realistic ranges for financial metrics
2. Keep responses concise but informative
3. Use standard business abbreviations (K for thousand, M for million, B for billion)
4. Return ONLY the JSON object with no additional text`;

    const response = await makeOpenRouterRequest(
      [{ role: "user", content: prompt }],
      "mistralai/mistral-small-3.1-24b-instruct:free"
    ) as OpenRouterResponse;

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenRouter API');
    }

    const content = response.choices[0].message.content;
    const cleanedContent = content.replace(/^```json\n|\n```$/g, '').trim();
    const parsedResponse = JSON.parse(cleanedContent) as BusinessMetrics;

    // Validate the response
    const requiredFields = ['annualRevenuePotential', 'marketSize', 'projectedUsers', 
                          'timeToBreakeven', 'initialInvestment', 'competitiveEdge'];
    
    for (const field of requiredFields) {
      if (!parsedResponse[field as keyof BusinessMetrics] || typeof parsedResponse[field as keyof BusinessMetrics] !== 'string') {
        throw new Error(`Invalid response format: ${field} must be a non-empty string`);
      }
    }

    return parsedResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating metrics:', errorMessage, { error });
    throw new Error(`Failed to generate metrics: ${errorMessage}`);
  }
};

export const generateGrowthProjections = async (params: BusinessPlanData): Promise<GrowthProjectionResponse> => {
  try {
    const prompt = `You are a business analyst. Generate 12-month growth projections in this exact JSON format:
{
  "growthData": [
    {
      "month": "string",
      "users": number,
      "revenue": number
    }
  ]
}

Analyze this business idea and generate realistic monthly projections for users and revenue:
Title: ${params.title}
Idea Fitness: ${params.ideaFitness}

Rules:
1. Project growth for exactly 12 months
2. Start with realistic initial numbers based on the business type
3. Apply reasonable month-over-month growth rates
4. Consider seasonality and market factors
5. Return ONLY the JSON object with no additional text`;

    const response = await makeOpenRouterRequest(
      [{ role: "user", content: prompt }],
      "mistralai/mistral-small-3.1-24b-instruct:free"
    ) as OpenRouterResponse;

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Empty response from OpenRouter API');
    }

    const content = response.choices[0].message.content;
    const cleanedContent = content.replace(/^```json\n|\n```$|^```|```$/g, '').trim();
    
    if (!cleanedContent) {
      throw new Error('Empty content after cleaning response');
    }

    let parsedResponse: GrowthProjectionResponse;
    try {
      parsedResponse = JSON.parse(cleanedContent) as GrowthProjectionResponse;

      if (!parsedResponse || typeof parsedResponse !== 'object') {
        throw new Error('Invalid response format: not a JSON object');
      }

      if (!Array.isArray(parsedResponse.growthData)) {
        throw new Error('Invalid response format: growthData must be an array');
      }

      if (parsedResponse.growthData.length !== 12) {
        throw new Error('Invalid response: Must have exactly 12 months of projections');
      }

      parsedResponse.growthData = (parsedResponse.growthData
        .map((data, index) => {
          if (!data || typeof data !== 'object') {
            throw new Error(`Invalid data format for month ${index + 1}`);
          }

          const month = String(data.month || '').trim();
          const users = Number(data.users);
          const revenue = Number(data.revenue);

          if (!month) {
            throw new Error(`Missing month name for month ${index + 1}`);
          }

          if (isNaN(users) || users < 0) {
            throw new Error(`Invalid user count for month ${month}: ${data.users}`);
          }

          if (isNaN(revenue) || revenue < 0) {
            throw new Error(`Invalid revenue for month ${month}: ${data.revenue}`);
          }

          return { month, users, revenue };
        }) as GrowthData[]);

      return parsedResponse;
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      console.error('Failed to parse growth projections:', errorMessage, { rawContent: content });
      throw new Error(`Failed to parse growth projections: ${errorMessage}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating growth projections:', errorMessage, { error });
    throw new Error(`Failed to generate growth projections: ${errorMessage}`);
  }
};

interface CompetitorData {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  isOurSolution?: boolean;
}

interface ComparisonData {
  aspect: string;
  us: number;
  competitorA: number;
  competitorB: number;
  competitorC: number;
}

interface CompetitorAnalysis {
  competitors: CompetitorData[];
  comparisonData: ComparisonData[];
}

export const generateCompetitorAnalysis = async (params: BusinessPlanData): Promise<CompetitorAnalysis> => {
  console.log('Starting competitor analysis generation for:', params.title);
  try {
    const prompt = `You are a competitive analysis expert. Given the following business idea (title and fitness assessment), first determine the correct industry or sector for this idea. Then, generate a competitor analysis in this exact JSON format:
{
  "competitors": [
    {
      "name": "string",
      "description": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "isOurSolution": boolean
    }
  ],
  "comparisonData": [
    {
      "aspect": "string",
      "us": number,
      "competitorA": number,
      "competitorB": number,
      "competitorC": number
    }
  ]
}

Analyze this business idea and identify 3 major real-world competitors from the same industry or sector (never from unrelated industries):
Title: ${params.title}
Idea Fitness: ${params.ideaFitness}

Rules:
1. Our solution (${params.title}) should NOT be included in the competitors list
2. Identify and select exactly 3 major, real, well-known competitors from the same industry as the business idea (never from unrelated sectors)
   - Each competitor must be a different company
   - Do not repeat company names
3. For each competitor:
   - Use real company names and accurate, industry-specific information
   - Provide a clear, concise description of their service/product in this industry
   - List 3-4 key strengths that make them competitive
   - List 3-4 key weaknesses or areas they could improve
4. Focus on how our solution stands out:
   - Highlight unique advantages
   - Show clear differentiation from competitors
   - Emphasize innovative features
5. Add comparison data for these aspects:
   - User Interface (ease of use)
   - Features (completeness)
   - Integration (flexibility)
   - Pricing (affordability)
   - Support (quality)
   Each score should be 0-100
6. Keep all responses professional and factual
7. Return ONLY the JSON object with exactly 3 competitors and comparison data
8. Double-check that all competitors are from the correct industry for this idea, and never from unrelated sectors.`;

    const response = await makeOpenRouterRequest(
      [{ role: "user", content: prompt }],
      "mistralai/mistral-small-3.1-24b-instruct:free"
    ) as OpenRouterResponse;

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Empty response from OpenRouter API');
    }

    const content = response.choices[0].message.content;
    console.log('Raw AI response:', content);

    // Extract only the JSON object up to the end of the threats array
    const jsonStart = content.indexOf('{');
    const threatsKey = '"threats"';
    const threatsIndex = content.indexOf(threatsKey, jsonStart);
    let jsonString = '';
    if (jsonStart !== -1 && threatsIndex !== -1) {
      // Find the start and end of the threats array
      const threatsArrayStart = content.indexOf('[', threatsIndex);
      const threatsArrayEnd = content.indexOf(']', threatsArrayStart);
      if (threatsArrayEnd !== -1) {
        // Find the closing } after threats array
        const jsonEnd = content.indexOf('}', threatsArrayEnd);
        if (jsonEnd !== -1) {
          jsonString = content.substring(jsonStart, jsonEnd + 1);
        }
      }
    }
    if (!jsonString) {
      throw new Error('Could not extract valid SWOT JSON from response');
    }
    console.log('Extracted SWOT JSON:', jsonString);

    try {
      const parsedResponse = JSON.parse(jsonString) as CompetitorAnalysis;

      // Validate the structure
      if (!parsedResponse || typeof parsedResponse !== 'object') {
        throw new Error('Invalid response format: not a JSON object');
      }

      // Validate each competitor
      if (!Array.isArray(parsedResponse.competitors) || parsedResponse.competitors.length !== 3) {
        throw new Error('Invalid response: Must have exactly 3 competitors');
      }

      // Validate competitors and comparison data
      if (!Array.isArray(parsedResponse.comparisonData)) {
        throw new Error('Missing or invalid comparison data');
      }

      const requiredAspects = ['User Interface (ease of use)', 'Features (completeness)', 'Integration (flexibility)', 'Pricing (affordability)', 'Support (quality)'];
      if (parsedResponse.comparisonData.length !== requiredAspects.length) {
        throw new Error(`Comparison data must include exactly ${requiredAspects.length} aspects`);
      }

      // Validate each competitor
      parsedResponse.competitors = parsedResponse.competitors.map((comp, index) => {
        if (!comp || typeof comp !== 'object') {
          throw new Error(`Invalid competitor format at index ${index}`);
        }

        if (!comp.name || !comp.description || !Array.isArray(comp.strengths) || !Array.isArray(comp.weaknesses)) {
          throw new Error(`Missing required fields for competitor ${comp.name || index}`);
        }

        if (comp.name.toLowerCase().includes('competitor')) {
          throw new Error('Generic competitor names are not allowed');
        }

        if (comp.strengths.length < 3 || comp.strengths.length > 4) {
          throw new Error(`${comp.name} must have 3-4 strengths`);
        }

        if (comp.weaknesses.length < 3 || comp.weaknesses.length > 4) {
          throw new Error(`${comp.name} must have 3-4 weaknesses`);
        }

        return {
          name: comp.name,
          description: comp.description,
          strengths: comp.strengths,
          weaknesses: comp.weaknesses
        };
      });

      // Validate comparison data with bulletproof aspect repair
      const normalize = (str: string) => str.toLowerCase().replace(/[^a-z]/g, '');
      parsedResponse.comparisonData = parsedResponse.comparisonData
        .map((comp: Partial<ComparisonData>, index: number) => {
          if (!comp || typeof comp !== 'object') {
            throw new Error(`Invalid comparison data format at index ${index}`);
          }

          if (!comp.aspect || typeof comp.aspect !== 'string') {
            throw new Error(`Missing aspect at index ${index}`);
          }

          // Try to find exact or fuzzy match for aspect
          let matchingAspect = requiredAspects.find(aspect => normalize(aspect) === normalize(comp.aspect!));
          if (!matchingAspect) {
            // Fuzzy: find by substring
            matchingAspect = requiredAspects.find(aspect => normalize(comp.aspect!).includes(normalize(aspect)) || normalize(aspect).includes(normalize(comp.aspect!)));
          }
          if (!matchingAspect) {
            // Fuzzy: find by word overlap
            const compWords = new Set(normalize(comp.aspect!).split(' '));
            matchingAspect = requiredAspects.find(aspect => normalize(aspect).split(' ').some(word => compWords.has(word)));
          }
          if (!matchingAspect) {
            // As a last resort, pick the first unused aspect
            const used = parsedResponse.comparisonData.map((c: any) => c.aspect).filter(Boolean);
            matchingAspect = requiredAspects.find(a => !used.includes(a)) || requiredAspects[0];
            console.warn(`[CompetitorAnalysis] WARNING: Could not match aspect '${comp.aspect}' at index ${index}, assigning '${matchingAspect}'`);
          } else if (matchingAspect !== comp.aspect) {
            console.warn(`[CompetitorAnalysis] INFO: Repaired aspect '${comp.aspect}' to '${matchingAspect}' at index ${index}`);
          }
          comp.aspect = matchingAspect;

          const scores = ['us', 'competitorA', 'competitorB', 'competitorC'];
          scores.forEach(score => {
            const value = comp[score as keyof typeof comp];
            if (typeof value !== 'number' || value < 0 || value > 100) {
              throw new Error(`Invalid score for ${score} at index ${index}`);
            }
          });

          return comp as ComparisonData;
        })
        .sort((a, b) => requiredAspects.indexOf(a.aspect) - requiredAspects.indexOf(b.aspect));

      return parsedResponse;

    } catch (parseError: unknown) {
      console.error('Error parsing competitor analysis:', parseError);
      throw new Error(`Failed to parse competitor analysis: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating competitor analysis:', errorMessage, { error });
    throw new Error(`Failed to generate competitor analysis: ${errorMessage}`);
  }
};

export const generateStrategicRoadmap = async (params: BusinessPlanData): Promise<StrategicRoadmapResponse> => {
  try {
    const prompt = `You are a strategic business planner. Generate a strategic roadmap and milestone timeline in this exact JSON format:
{
  "roadmapPhases": [
    {
      "phase": "string (e.g., 'Launch Phase (Months 1-6)')",
      "title": "string",
      "description": "string",
      "goals": ["string"]
    }
  ],
  "milestones": [
    {
      "title": "string",
      "month": number,
      "description": "string"
    }
  ]
}

Analyze this business idea and generate a comprehensive strategic roadmap:
Title: ${params.title}
Idea Fitness: ${params.ideaFitness}

Rules:
1. Create 3 phases: Launch Phase (1-6 months), Growth Phase (7-18 months), Expansion Phase (19-36 months)
2. Each phase should have 4-5 specific goals
3. Include 6-8 key milestones across the timeline
4. Focus on realistic and achievable targets
5. Return ONLY the JSON object with no additional text`;

    const response = await makeOpenRouterRequest(
      [{ role: "user", content: prompt }],
      "mistralai/mistral-small-3.1-24b-instruct:free"
    ) as OpenRouterResponse;

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenRouter API');
    }

    const content = response.choices[0].message.content;
    const cleanedContent = content.replace(/^```json\n|\n```$/g, '').trim();
    const parsedResponse = JSON.parse(cleanedContent) as StrategicRoadmapResponse;

    if (!parsedResponse.roadmapPhases || !Array.isArray(parsedResponse.roadmapPhases)) {
      throw new Error('Invalid response format: Missing roadmapPhases array');
    }

    if (!parsedResponse.milestones || !Array.isArray(parsedResponse.milestones)) {
      throw new Error('Invalid response format: Missing milestones array');
    }

    return parsedResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating strategic roadmap:', errorMessage, { error });
    throw new Error(`Failed to generate strategic roadmap: ${errorMessage}`);
  }
};

export const generateSwotAnalysis = async (params: BusinessPlanData): Promise<SwotAnalysisResponse> => {
  try {
    console.log('Generating SWOT analysis for:', params.title);

    const messages = [
      {
        role: 'system',
        content: 'You are a business strategist. Generate a SWOT analysis with clear, actionable insights.'
      },
      {
        role: 'user',
        content: `Analyze this business idea and provide a SWOT analysis:

Title: ${params.title}
Fitness Assessment: ${params.ideaFitness}

Provide the response in this EXACT format (no additional text or formatting):
{
  "strengths": [
    "First strength point",
    "Second strength point",
    "Third strength point"
  ],
  "weaknesses": [
    "First weakness point",
    "Second weakness point",
    "Third weakness point"
  ],
  "opportunities": [
    "First opportunity point",
    "Second opportunity point",
    "Third opportunity point"
  ],
  "threats": [
    "First threat point",
    "Second threat point",
    "Third threat point"
  ]
}`
      }
    ];

    const response = await makeOpenRouterRequest(
      messages,
      "mistralai/mistral-small-3.1-24b-instruct:free"
    ) as OpenRouterResponse;

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenRouter API');
    }

    const content = response.choices[0].message.content;
    console.log('Raw AI response:', content);

    // Extract only the JSON object up to the end of the threats array
    const jsonStart = content.indexOf('{');
    const threatsKey = '"threats"';
    const threatsIndex = content.indexOf(threatsKey, jsonStart);
    let jsonString = '';
    if (jsonStart !== -1 && threatsIndex !== -1) {
      // Find the start and end of the threats array
      const threatsArrayStart = content.indexOf('[', threatsIndex);
      const threatsArrayEnd = content.indexOf(']', threatsArrayStart);
      if (threatsArrayEnd !== -1) {
        // Find the closing } after threats array
        const jsonEnd = content.indexOf('}', threatsArrayEnd);
        if (jsonEnd !== -1) {
          jsonString = content.substring(jsonStart, jsonEnd + 1);
        }
      }
    }
    if (!jsonString) {
      throw new Error('Could not extract valid SWOT JSON from response');
    }
    console.log('Extracted SWOT JSON:', jsonString);

    try {
      const parsedResponse = JSON.parse(jsonString) as SwotAnalysisResponse;

      // Validate the structure
      if (!parsedResponse || typeof parsedResponse !== 'object') {
        throw new Error('Invalid response format: not a JSON object');
      }

      // Validate each SWOT category
      const categories: SwotCategory[] = ['strengths', 'weaknesses', 'opportunities', 'threats'];
      categories.forEach(category => {
        if (!Array.isArray(parsedResponse[category]) || parsedResponse[category].length < 1) {
          throw new Error(`Invalid response format: ${category} must be a non-empty array`);
        }

        // Clean and validate each point
        parsedResponse[category] = parsedResponse[category]
          .map(point => String(point).trim())
          .filter(point => point.length > 0);
      });

      return parsedResponse;
    } catch (error) {
      const parseError = error instanceof Error ? error.message : 'Unknown parsing error';
      console.error('Parse error:', parseError, '\nContent:', content);
      throw new Error(`Failed to parse SWOT analysis: ${parseError}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating SWOT analysis:', errorMessage);
    throw new Error(`Failed to generate SWOT analysis: ${errorMessage}`);
  }
};

export const generateMarketShare = async (title: string, ideaFitness: string): Promise<MarketShareData[]> => {
  try {
    const prompt = `You are a market research analyst. Given this business idea and its fitness assessment, generate a market share analysis in percentage terms. Return ONLY a JSON array with each object having 'name' and 'value' properties. The value should be a number representing percentage market share. Include our solution (use the exact title), 3-4 major real competitors (use well-known company names, never generic names like 'Competitor A', 'Competitor B', etc.), plus an 'Others' category. Total should equal 100.

Rules:
- Competitor names must be real companies in the same sector (e.g., Cisco, Palo Alto Networks, Zscaler, etc.)
- Never use generic names like 'Competitor A', 'Competitor B', etc.
- If you cannot find a real competitor, skip it rather than use a placeholder.

Business Idea: ${title}
Fitness Assessment: ${ideaFitness}`;

    const response = await makeOpenRouterRequest(
      [{ role: "user", content: prompt }],
      "mistralai/mistral-small-3.1-24b-instruct:free"
    ) as OpenRouterResponse;

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenRouter API');
    }

    const content = response.choices[0].message.content;
    const cleanedContent = content.replace(/^```json\n|\n```$/g, '').trim();
    const marketShareData = JSON.parse(cleanedContent) as MarketShareData[];

    if (!Array.isArray(marketShareData) || !marketShareData.every(item => 
      typeof item.name === 'string' && 
      typeof item.value === 'number' && 
      item.value >= 0 && 
      item.value <= 100
    )) {
      throw new Error('Invalid market share data format');
    }

    // Reject generic competitor names
    const genericPattern = /^Competitor [A-Z]$/i;
    const invalidNames = marketShareData.filter(item => genericPattern.test(item.name));
    if (invalidNames.length > 0) {
      throw new Error('Market share data contains generic competitor names: ' + invalidNames.map(i => i.name).join(', '));
    }

    // Verify total equals 100%
    const total = marketShareData.reduce((sum, item) => sum + item.value, 0);
    if (Math.abs(total - 100) > 0.1) { // Allow for small floating point differences
      throw new Error('Market share percentages must total 100%');
    }

    return marketShareData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating market share:', errorMessage, { error });
    throw new Error(`Failed to generate market share analysis: ${errorMessage}`);
  }
};

export const generateCustomerSegments = async (params: BusinessPlanData): Promise<CustomerSegmentsResponse> => {
  try {
    const prompt = `You are a market research analyst. Generate customer segments and market analysis in this exact JSON format:
{
  "segments": [
    {
      "segment": "string",
      "description": "string",
      "characteristics": ["string"],
      "needs": ["string"],
      "marketSize": "string"
    }
  ],
  "marketAnalysis": {
    "totalMarketSize": "string",
    "growthRate": "string",
    "keyTrends": ["string"]
  }
}

Analyze this business idea:
Title: ${params.title}
Idea Fitness: ${params.ideaFitness}

Return ONLY the JSON object with no additional text or markdown formatting.`;

    const response = await makeOpenRouterRequest(
      [{ role: "user", content: prompt }],
      "mistralai/mistral-small-3.1-24b-instruct:free"
    ) as OpenRouterResponse;

    const content = response.choices[0]?.message?.content || '';
    console.log('Raw AI response:', content);
    
    const cleanedContent = content.replace(/^```json\n|\n```$/g, '').trim();
    const parsedResponse = JSON.parse(cleanedContent) as CustomerSegmentsResponse;

    if (!parsedResponse.segments || !Array.isArray(parsedResponse.segments)) {
      throw new Error('Invalid response format: Missing segments array');
    }

    return parsedResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating customer segments:', errorMessage, { error });
    throw new Error(`Failed to generate customer segments analysis: ${errorMessage}`);
  }
};