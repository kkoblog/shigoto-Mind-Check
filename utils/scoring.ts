import { Answers, DomainConfig } from '../types';
import { MAIN_CHECK_ITEMS, MAIN_CHECK_DOMAINS } from '../constants';

export const calculateScores = (answers: Answers) => {
  // 1. Quick Check Score
  const quickYesCount = Object.values(answers.quickCheck).filter(Boolean).length;

  // 2. Main Check Scores
  const domainScores: Record<string, number> = {};
  
  if (answers.deepDiveOptIn) {
    MAIN_CHECK_DOMAINS.forEach((domain: DomainConfig) => {
      const items = MAIN_CHECK_ITEMS.filter(item => item.domain === domain.key);
      let total = 0;
      let count = 0;
      
      items.forEach(item => {
        const val = answers.mainCheck[item.id];
        if (val) {
          // Reverse rule: if reverse==true, score = 6 - answer
          // Logic note: In the YAML, 'reverse=true' for 'Control' means high control (answer 5) is GOOD (low risk).
          // But usually we calculate RISK scores where HIGH is BAD.
          // Let's re-read YAML rules:
          // "reverse==true の場合 risk_value = 6 - answer"
          // Example: Control (reverse=true). "I can decide my pace" (5). Risk = 6 - 5 = 1 (Low Risk). Correct.
          // Example: Demands (reverse=false). "Too much work" (5). Risk = 5 (High Risk). Correct.
          
          const riskValue = domain.reverse ? (6 - val) : val;
          total += riskValue;
          count++;
        }
      });
      
      domainScores[domain.key] = count > 0 ? total / count : 0;
    });
  }

  // 3. State Score (from Symptoms domain or implied from Quick Check if skipped)
  // If Deep Dive is skipped, we only have Quick Check.
  // The YAML defines:
  // state_score from_domain: "Symptoms"
  // normalize_to_0_100: "risk_score = (risk_avg - 1) / 4 * 100"
  
  let stateScore = 0;
  if (answers.deepDiveOptIn && domainScores['Symptoms']) {
    const avg = domainScores['Symptoms'];
    stateScore = ((avg - 1) / 4) * 100;
  } else {
    // Approx from Quick Check for internal logic if needed, 
    // but the Judgement rule handles Quick Check count separately.
    // Just mapping 0-8 to 0-100 roughly for display if needed
    stateScore = (quickYesCount / 8) * 100;
  }

  // 4. Judgement
  // Red: state_score >= 70 OR quick_yes_count >= 6
  // Yellow: 40 <= state_score < 70 OR (3 <= quick_yes_count <= 5)
  // Green: Else
  
  let level: 'red' | 'yellow' | 'green' = 'green';
  
  // Use explicit logic from YAML
  const redCondition = (answers.deepDiveOptIn && stateScore >= 70) || quickYesCount >= 6;
  const yellowCondition = (answers.deepDiveOptIn && stateScore >= 40 && stateScore < 70) || (quickYesCount >= 3 && quickYesCount <= 5);

  if (redCondition) {
    level = 'red';
  } else if (yellowCondition) {
    level = 'yellow';
  } else {
    level = 'green';
  }

  return {
    quickYesCount,
    domainScores,
    stateScore: Math.round(stateScore),
    level
  };
};
