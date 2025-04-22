import { EventEmitter } from 'events';
import axios from 'axios';
import dotenv from 'dotenv';

export interface BusinessMetrics {
  annualRevenuePotential: string;
  marketSize: string;
  projectedUsers: string;
  timeToBreakeven: string;
  initialInvestment: string;
  competitiveEdge: string;
  lastUpdated?: string;
  status?: 'processing' | 'complete' | 'error';
}

class MetricsEventEmitter extends EventEmitter {}
export const metricsEmitter = new MetricsEventEmitter();

const formatMetric = (value: string | undefined): string => {
  if (!value) return 'N/A';
  return value.replace(/[\[\]\s]/g, '').trim();
};

const extractMetricsFromResponse = (aiResponse: any): BusinessMetrics => {
  try {
    const content = aiResponse.choices[0].message.content;
    const lines = content.split('\n');
    
    const metrics: BusinessMetrics = {
      annualRevenuePotential: '',
      marketSize: '',
      projectedUsers: '',
      timeToBreakeven: '',
      initialInvestment: '',
      competitiveEdge: '',
      lastUpdated: new Date().toISOString(),
      status: 'complete'
    };

    lines.forEach((line: string) => {
      const [key, value] = line.split(':').map((part: string) => part.trim());
      if (value) {
        switch(key) {
          case 'annualRevenuePotential':
            metrics.annualRevenuePotential = formatMetric(value);
            break;
          case 'marketSize':
            metrics.marketSize = formatMetric(value);
            break;
          case 'projectedUsers':
            metrics.projectedUsers = formatMetric(value);
            break;
          case 'timeToBreakeven':
            metrics.timeToBreakeven = formatMetric(value);
            break;
          case 'initialInvestment':
            metrics.initialInvestment = formatMetric(value);
            break;
          case 'competitiveEdge':
            metrics.competitiveEdge = formatMetric(value);
            break;
        }
      }
    });

    return metrics;
  } catch (error) {
    console.error('Error processing metrics:', error);
    return {
      annualRevenuePotential: 'N/A',
      marketSize: 'N/A',
      projectedUsers: 'N/A',
      timeToBreakeven: 'N/A',
      initialInvestment: 'N/A',
      competitiveEdge: 'N/A',
      lastUpdated: new Date().toISOString(),
      status: 'error'
    };
  }
};

export const generateMetrics = async (ideaTitle: string, ideaFitness: string): Promise<BusinessMetrics> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key not found');
  }

  const prompt = `Given a business idea titled "${ideaTitle}" with a fitness score of ${ideaFitness}, provide only numerical values for the following metrics:
- Annual Revenue Potential (e.g., 5M, 100K)
- Market Size (e.g., 1B, 500M)
- Projected Users (e.g., 100K, 1M)
- Time to Breakeven in months (e.g., 12, 24)
- Initial Investment (e.g., 500K, 2M)
- Competitive Edge score from 1-10

Provide ONLY the numerical values in this exact format:
annualRevenuePotential: [value]
marketSize: [value]
projectedUsers: [value]
timeToBreakeven: [value]
initialInvestment: [value]
competitiveEdge: [value]`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'qwen/qwen2.5-vl-72b-instruct:free',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://github.com/vikaschauhan1995',
          'Content-Type': 'application/json'
        }
      }
    );

    const metrics = extractMetricsFromResponse(response.data);
    metricsEmitter.emit('metricsUpdated', metrics);
    return metrics;
  } catch (error) {
    console.error('Error generating metrics:', error);
    throw error;
  }
};

export const startMetricsProcessing = (): void => {
  metricsEmitter.emit('metricsUpdate', {
    annualRevenuePotential: 'Processing...',
    marketSize: 'Processing...',
    projectedUsers: 'Processing...',
    timeToBreakeven: 'Processing...',
    initialInvestment: 'Processing...',
    competitiveEdge: 'Processing...',
    lastUpdated: new Date().toISOString(),
    status: 'processing'
  });
};