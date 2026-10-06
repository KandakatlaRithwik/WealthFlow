// Deterministic, rule-based insight generator. No AI, no advice — just
// observations derived from the user's own numbers (spec section 23).

function generateInsights({ income, expenses, prevIncome, prevExpenses, savingsRate, prevSavingsRate, categoryTotals, prevCategoryTotals, goals, habitMilestones }) {
  const insights = [];

  if (income > 0) {
    insights.push({ tone: 'neutral', text: `You saved ${Math.max(savingsRate, 0)}% of your income this month.` });
  }

  if (prevExpenses > 0 && expenses > prevExpenses) {
    const pct = Math.round(((expenses - prevExpenses) / prevExpenses) * 100);
    insights.push({ tone: 'warning', text: `Your expenses increased by ${pct}% compared with last month.` });
  } else if (prevExpenses > 0 && expenses < prevExpenses) {
    const pct = Math.round(((prevExpenses - expenses) / prevExpenses) * 100);
    insights.push({ tone: 'positive', text: `Your expenses decreased by ${pct}% compared with last month.` });
  }

  if (prevSavingsRate !== undefined && savingsRate > prevSavingsRate) {
    insights.push({ tone: 'positive', text: 'Your savings rate improved this month.' });
  }

  if (categoryTotals && prevCategoryTotals) {
    for (const cat of Object.keys(categoryTotals)) {
      const cur = categoryTotals[cat] || 0;
      const prev = prevCategoryTotals[cat] || 0;
      if (prev > 0 && cur > prev * 1.1) {
        const pct = Math.round(((cur - prev) / prev) * 100);
        insights.push({ tone: 'warning', text: `${cat} spending increased by ${pct}% compared with last month.` });
      }
    }
  }

  (goals || []).forEach((g) => {
    const pct = Math.round((g.currentAmount / g.targetAmount) * 100);
    if (pct >= 80 && pct < 100) {
      insights.push({ tone: 'positive', text: `Your ${g.name} goal is ${pct}% complete.` });
    } else if (pct >= 100) {
      insights.push({ tone: 'positive', text: `You reached your ${g.name} goal!` });
    }
  });

  (habitMilestones || []).forEach((m) => {
    insights.push({ tone: 'positive', text: `You reached a ${m.streak}-${m.frequency === 'daily' ? 'day' : m.frequency === 'weekly' ? 'week' : 'month'} streak on "${m.title}".` });
  });

  return insights.slice(0, 8);
}

module.exports = { generateInsights };
