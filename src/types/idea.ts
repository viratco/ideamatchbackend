export interface IdeaGenerationParams {
  userType: string;
  industries: string[];
  technicalSkills: string[];
  timeCommitment: string;
  riskLevel: string;
  challenges: string[];
  businessModel: string;
  budget: number[];
  suggestTrending: boolean;
  focusNiche?: string;
  suggestCompetitors: boolean;
}
