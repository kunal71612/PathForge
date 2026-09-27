import { describe, it, expect } from 'vitest';
import { RecommendationService } from '../services/recommendation.service';

describe('RecommendationEngine & Match Formulas', () => {
  it('should calculate weighted match score correctly when skills match', () => {
    // Access private calculateMatch method through typed helper or simulate logic
    const calculateMatch = (RecommendationService as any).calculateMatch;

    const user = {
      profile: {
        goal: { name: 'Become a Web Developer' },
        interests: ['Web Development', 'Hackathons'],
        year: 3,
        degree: 'B.Tech',
      },
      studentSkills: [
        { skill: { id: 's1', name: 'TypeScript' }, confidence: 85 },
        { skill: { id: 's2', name: 'React' }, confidence: 80 },
        { skill: { id: 's3', name: 'Node.js' }, confidence: 75 },
      ],
    };

    const opportunity = {
      category: 'HACKATHON',
      eligibility: 'Open to all undergraduate students',
      skills: [
        { skill: { id: 's1', name: 'TypeScript' } },
        { skill: { id: 's2', name: 'React' } },
        { skill: { id: 's4', name: 'Docker' } }, // missing
      ],
    };

    const result = calculateMatch(user, opportunity);

    // 2 out of 3 skills matched = 66.6% skill match
    expect(result.matchedSkills).toContain('typescript');
    expect(result.matchedSkills).toContain('react');
    expect(result.missingSkills).toContain('docker');

    // Overall match score should be high given skills, interest, education match
    expect(result.matchScore).toBeGreaterThanOrEqual(60);

    // Readiness score should be average confidence of required skills
    // TypeScript (85) + React (80) + Docker (0) = 165 / 3 = 55
    expect(result.readinessScore).toBe(55);

    // Skill gaps should flag Docker
    const dockerGap = result.skillGaps.find((g: any) => g.skillName === 'Docker');
    expect(dockerGap).toBeDefined();
    expect(dockerGap.confidence).toBe(0);

    // Next action should recommend improving the weakest skill (Docker)
    expect(result.nextAction).toBeDefined();
    expect(result.nextAction.type).toBe('learning');
    expect(result.nextAction.message).toContain('Docker');
  });

  it('should grant 100% readiness when student has high confidence in all required skills', () => {
    const calculateMatch = (RecommendationService as any).calculateMatch;

    const user = {
      profile: {
        goal: { name: 'Become a Web Developer' },
        interests: ['Internships'],
        year: 4,
        degree: 'B.Tech',
      },
      studentSkills: [
        { skill: { id: 's1', name: 'React' }, confidence: 90 },
        { skill: { id: 's2', name: 'Node.js' }, confidence: 85 },
      ],
    };

    const opportunity = {
      category: 'INTERNSHIP',
      eligibility: '4th year students',
      skills: [
        { skill: { id: 's1', name: 'React' } },
        { skill: { id: 's2', name: 'Node.js' } },
      ],
    };

    const result = calculateMatch(user, opportunity);

    expect(result.missingSkills).toHaveLength(0);
    expect(result.readinessScore).toBeGreaterThanOrEqual(85);
    expect(result.nextAction?.type).toBe('apply');
    expect(result.nextAction?.message).toContain('ready');
  });
});
