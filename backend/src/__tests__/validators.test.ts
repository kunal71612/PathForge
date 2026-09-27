import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  profileSchema,
  assessmentSubmitSchema,
  applicationSchema,
} from '../validators';

describe('API Input Validation Schemas', () => {
  it('should validate valid user registration payload', () => {
    const valid = {
      name: 'Jane Doe',
      email: 'jane@student.local',
      password: 'password123',
    };
    const parsed = registerSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid email in registration', () => {
    const invalid = {
      name: 'Jane',
      email: 'not-an-email',
      password: '123',
    };
    const parsed = registerSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('should validate assessment answer submissions', () => {
    const validAnswers = {
      answers: [
        { questionId: 'q1', selectedAnswer: 2 },
        { questionId: 'q2', selectedAnswer: 0 },
      ],
    };
    const parsed = assessmentSubmitSchema.safeParse(validAnswers);
    expect(parsed.success).toBe(true);
  });

  it('should reject empty answer list in assessment submission', () => {
    const emptyAnswers = {
      answers: [],
    };
    const parsed = assessmentSubmitSchema.safeParse(emptyAnswers);
    expect(parsed.success).toBe(false);
  });

  it('should validate application status transitions', () => {
    const valid = {
      opportunityId: 'opp_123',
      notes: 'Applied via referral',
    };
    const parsed = applicationSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });
});
