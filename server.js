const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/business-plan/generate', async (req, res) => {
  try {
    const {
      title,
      description,
      marketPotential,
      competitionLevel,
      industry,
      businessModel,
      initialInvestment,
      skills
    } = req.body;

    const prompt = `Generate a detailed business plan introduction for the following business idea:

Title: ${title}
Description: ${description}
Market Potential: ${marketPotential}
Competition Level: ${competitionLevel}
Industry: ${industry}
Business Model: ${businessModel}
Initial Investment: ${initialInvestment}
Required Skills: ${skills.join(', ')}

Please provide a comprehensive introduction that covers:
1. The business concept and its unique value proposition
2. Market opportunity and target audience
3. Business model and revenue streams
4. Competitive advantages
5. Growth potential and scalability

Format the response in a clear, professional style suitable for a business plan.`;

    const response = await axios.post('https://api.openrouter.ai/api/v1/chat/completions', {
      messages: [{ role: "user", content: prompt }],
      model: "anthropic/claude-2",
      temperature: 0.7,
      max_tokens: 1000,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:8082',
        'X-Title': 'Business Plan Generator'
      }
    });

    const generatedContent = response.data.choices[0].message.content;
    res.json({ content: generatedContent });
  } catch (error) {
    console.error('Error generating business plan:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate business plan' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
