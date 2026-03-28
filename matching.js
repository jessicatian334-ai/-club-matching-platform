import { clubs } from './data.js';

export function calculateMatch(userProfile) {
  const scores = clubs.map(club => {
    let score = 0;
    let reasons = [];

    const interestMatch = calculateInterestMatch(userProfile.interests, club);
    score += interestMatch.score * 0.35;
    if (interestMatch.reasons.length > 0) {
      reasons.push(...interestMatch.reasons);
    }

    const personalityMatch = calculatePersonalityMatch(userProfile.personality, club);
    score += personalityMatch.score * 0.25;
    if (personalityMatch.reasons.length > 0) {
      reasons.push(...personalityMatch.reasons);
    }

    const majorMatch = calculateMajorMatch(userProfile.major, club);
    score += majorMatch.score * 0.2;
    if (majorMatch.reasons.length > 0) {
      reasons.push(...majorMatch.reasons);
    }

    const timeMatch = calculateTimeMatch(userProfile.availableTime, club);
    score += timeMatch.score * 0.15;
    if (timeMatch.reasons.length > 0) {
      reasons.push(...timeMatch.reasons);
    }

    const goalMatch = calculateGoalMatch(userProfile.goals, club);
    score += goalMatch.score * 0.05;

    return {
      club,
      score: Math.round(score),
      reasons: [...new Set(reasons)].slice(0, 3)
    };
  });

  return scores.sort((a, b) => b.score - a.score);
}

function calculateInterestMatch(interests, club) {
  let score = 0;
  const reasons = [];

  const interestToCategory = {
    'tech': ['科技'],
    'art': ['文艺', '兴趣'],
    'sports': ['体育'],
    'social': ['公益'],
    'business': ['实践'],
    'academic': ['学术', '益智'],
    'entertainment': ['兴趣', '文艺'],
    'media': ['文艺']
  };

  interests.forEach(interest => {
    const categories = interestToCategory[interest] || [];
    if (categories.includes(club.category)) {
      score += 30;
      reasons.push(`符合你的${getInterestLabel(interest)}兴趣`);
    }
  });

  const tagMatches = club.tags.filter(tag => 
    interests.some(i => tag.includes(i) || i.includes(tag))
  );
  if (tagMatches.length > 0) {
    score += tagMatches.length * 10;
    reasons.push(`社团标签匹配: ${tagMatches.join('、')}`);
  }

  return { score: Math.min(score, 100), reasons };
}

function getInterestLabel(id) {
  const labels = {
    'tech': '科技创新', 'art': '文化艺术', 'sports': '体育运动',
    'social': '公益志愿', 'business': '创业商业', 'academic': '学术研究',
    'entertainment': '娱乐休闲', 'media': '媒体传播'
  };
  return labels[id] || id;
}

function calculatePersonalityMatch(personalities, club) {
  let score = 0;
  const reasons = [];

  const personalityCompatibility = {
    'rational': ['理性', '逻辑', '专注'],
    'creative': ['创意', '审美', '浪漫'],
    'social': ['热情', '开朗', '活力', '团队', '表达'],
    'steady': ['沉稳', '思考', '策略'],
    'adventurous': ['冒险', '创新', '竞争', '挑战'],
    'compassionate': ['善良', '热情', '责任']
  };

  const personalityLabels = {
    'rational': '理性',
    'creative': '创意',
    'social': '社交',
    'steady': '沉稳',
    'adventurous': '冒险',
    'compassionate': '关怀'
  };

  personalities.forEach(p => {
    const keywords = personalityCompatibility[p] || [];
    const matches = club.personality.filter(word => 
      keywords.some(k => word.includes(k))
    );
    if (matches.length > 0) {
      score += 20;
      reasons.push(`适合${personalityLabels[p]}性格的人`);
    }
  });

  return { score: Math.min(score, 100), reasons };
}

function calculateMajorMatch(major, club) {
  let score = 0;
  const reasons = [];

  if (club.suitableMajors.includes('所有专业')) {
    score = 80;
    reasons.push('不限专业');
  } else if (club.suitableMajors.some(m => major.includes(m) || m.includes(major))) {
    score = 100;
    reasons.push(`与你的${major}专业相关`);
  }

  return { score, reasons };
}

function calculateTimeMatch(times, club) {
  let score = 0;
  const reasons = [];

  const clubTimeMapping = {
    '工作日下午': ['weekday_morning', 'weekday_evening'],
    '周二四晚': ['weekday_evening'],
    '周三晚': ['weekday_evening'],
    '周一三晚': ['weekday_evening'],
    '周一三五晚': ['weekday_evening'],
    '周五晚': ['weekday_evening'],
    '周四晚': ['weekday_evening'],
    '周末': ['weekend_morning', 'weekend_afternoon', 'weekend_evening'],
    '周末上午': ['weekend_morning'],
    '灵活时间': ['flexible'],
    '工作日晚上': ['weekday_evening']
  };

  club.availableTime.forEach(ct => {
    const requiredTimes = clubTimeMapping[ct] || [];
    const matched = times.filter(t => requiredTimes.includes(t));
    if (matched.length > 0) {
      score += 25;
    }
  });

  if (score > 0) {
    reasons.push('时间安排匹配');
  }

  return { score: Math.min(score, 100), reasons };
}

function calculateGoalMatch(goals, club) {
  let score = 0;

  const goalKeywords = {
    'skill': ['技能', '学习', '竞赛'],
    'social': ['社交', '交流', '团队'],
    'interest': ['兴趣', '爱好'],
    'resume': ['实践', '经验'],
    'relax': ['娱乐', '休闲']
  };

  goals.forEach(goal => {
    const keywords = goalKeywords[goal] || [];
    const matches = club.tags.filter(tag => 
      keywords.some(k => tag.includes(k))
    );
    if (matches.length > 0) {
      score += 25;
    }
  });

  return { score: Math.min(score, 100) };
}
