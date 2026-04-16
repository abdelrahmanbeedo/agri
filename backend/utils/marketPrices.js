const marketPrices = {
  vegetables: {
    Tomatoes: {
      grade_A: { min: 8, max: 12, avg: 10, unit: 'kg', trend: 'up', trendPercent: 5 },
      grade_B: { min: 5, max: 8, avg: 6.5, unit: 'kg', trend: 'stable', trendPercent: 0 },
      grade_C: { min: 3, max: 5, avg: 4, unit: 'kg', trend: 'down', trendPercent: -3 }
    },
    Potatoes: {
      grade_A: { min: 6, max: 9, avg: 7.5, unit: 'kg', trend: 'up', trendPercent: 8 },
      grade_B: { min: 4, max: 6, avg: 5, unit: 'kg', trend: 'stable', trendPercent: 0 },
      grade_C: { min: 2.5, max: 4, avg: 3.2, unit: 'kg', trend: 'down', trendPercent: -2 }
    },
    Onions: {
      grade_A: { min: 7, max: 11, avg: 9, unit: 'kg', trend: 'up', trendPercent: 12 },
      grade_B: { min: 5, max: 7, avg: 6, unit: 'kg', trend: 'stable', trendPercent: 0 },
      grade_C: { min: 3, max: 5, avg: 4, unit: 'kg', trend: 'down', trendPercent: -5 }
    },
    'Green Peppers': {
      grade_A: { min: 10, max: 15, avg: 12.5, unit: 'kg', trend: 'up', trendPercent: 7 },
      grade_B: { min: 7, max: 10, avg: 8.5, unit: 'kg', trend: 'stable', trendPercent: 0 },
      grade_C: { min: 5, max: 7, avg: 6, unit: 'kg', trend: 'down', trendPercent: -4 }
    },
    Cucumbers: {
      grade_A: { min: 6, max: 10, avg: 8, unit: 'kg', trend: 'up', trendPercent: 10 },
      grade_B: { min: 4, max: 6, avg: 5, unit: 'kg', trend: 'stable', trendPercent: 0 },
      grade_C: { min: 2.5, max: 4, avg: 3.2, unit: 'kg', trend: 'down', trendPercent: -6 }
    }
  },
  fruits: {
    Oranges: {
      grade_A: { min: 12, max: 18, avg: 15, unit: 'kg', trend: 'up', trendPercent: 4 },
      grade_B: { min: 8, max: 12, avg: 10, unit: 'kg', trend: 'stable', trendPercent: 0 },
      grade_C: { min: 5, max: 8, avg: 6.5, unit: 'kg', trend: 'down', trendPercent: -2 }
    },
    Bananas: {
      grade_A: { min: 15, max: 22, avg: 18, unit: 'kg', trend: 'up', trendPercent: 3 },
      grade_B: { min: 10, max: 15, avg: 12.5, unit: 'kg', trend: 'stable', trendPercent: 0 },
      grade_C: { min: 7, max: 10, avg: 8.5, unit: 'kg', trend: 'down', trendPercent: -4 }
    },
    Apples: {
      grade_A: { min: 20, max: 30, avg: 25, unit: 'kg', trend: 'up', trendPercent: 6 },
      grade_B: { min: 14, max: 20, avg: 17, unit: 'kg', trend: 'stable', trendPercent: 0 },
      grade_C: { min: 10, max: 14, avg: 12, unit: 'kg', trend: 'down', trendPercent: -3 }
    },
    Grapes: {
      grade_A: { min: 25, max: 40, avg: 32, unit: 'kg', trend: 'up', trendPercent: 8 },
      grade_B: { min: 18, max: 25, avg: 21, unit: 'kg', trend: 'stable', trendPercent: 0 },
      grade_C: { min: 12, max: 18, avg: 15, unit: 'kg', trend: 'down', trendPercent: -5 }
    },
    Mangoes: {
      grade_A: { min: 18, max: 28, avg: 23, unit: 'kg', trend: 'up', trendPercent: 15 },
      grade_B: { min: 12, max: 18, avg: 15, unit: 'kg', trend: 'stable', trendPercent: 0 },
      grade_C: { min: 8, max: 12, avg: 10, unit: 'kg', trend: 'down', trendPercent: -4 }
    }
  },
  grains: {
    Wheat: {
      grade_A: { min: 2800, max: 3500, avg: 3150, unit: 'ton', trend: 'up', trendPercent: 3 },
      grade_B: { min: 2400, max: 2800, avg: 2600, unit: 'ton', trend: 'stable', trendPercent: 0 },
      grade_C: { min: 2000, max: 2400, avg: 2200, unit: 'ton', trend: 'down', trendPercent: -2 }
    },
    Rice: {
      grade_A: { min: 8000, max: 12000, avg: 10000, unit: 'ton', trend: 'up', trendPercent: 5 },
      grade_B: { min: 6000, max: 8000, avg: 7000, unit: 'ton', trend: 'stable', trendPercent: 0 },
      grade_C: { min: 4500, max: 6000, avg: 5250, unit: 'ton', trend: 'down', trendPercent: -3 }
    },
    Corn: {
      grade_A: { min: 3500, max: 4500, avg: 4000, unit: 'ton', trend: 'up', trendPercent: 7 },
      grade_B: { min: 2800, max: 3500, avg: 3150, unit: 'ton', trend: 'stable', trendPercent: 0 },
      grade_C: { min: 2200, max: 2800, avg: 2500, unit: 'ton', trend: 'down', trendPercent: -4 }
    },
    Barley: {
      grade_A: { min: 2500, max: 3200, avg: 2850, unit: 'ton', trend: 'up', trendPercent: 4 },
      grade_B: { min: 2000, max: 2500, avg: 2250, unit: 'ton', trend: 'stable', trendPercent: 0 },
      grade_C: { min: 1600, max: 2000, avg: 1800, unit: 'ton', trend: 'down', trendPercent: -3 }
    }
  },
  dairy: {
    Milk: {
      fresh: { min: 8, max: 12, avg: 10, unit: 'liter', trend: 'up', trendPercent: 2 },
      pasteurized: { min: 10, max: 15, avg: 12.5, unit: 'liter', trend: 'stable', trendPercent: 0 },
      organic: { min: 18, max: 25, avg: 21.5, unit: 'liter', trend: 'up', trendPercent: 5 }
    },
    Cheese: {
      local: { min: 45, max: 65, avg: 55, unit: 'kg', trend: 'stable', trendPercent: 0 },
      imported: { min: 80, max: 120, avg: 100, unit: 'kg', trend: 'up', trendPercent: 3 }
    },
    Yogurt: {
      plain: { min: 12, max: 18, avg: 15, unit: 'kg', trend: 'stable', trendPercent: 0 },
      flavored: { min: 18, max: 25, avg: 21.5, unit: 'kg', trend: 'up', trendPercent: 2 }
    }
  },
  livestock: {
    Cattle: {
      local_breed: { min: 25000, max: 40000, avg: 32500, unit: 'head', trend: 'up', trendPercent: 4 },
      improved_breed: { min: 40000, max: 65000, avg: 52500, unit: 'head', trend: 'up', trendPercent: 6 }
    },
    Poultry: {
      broilers: { min: 35, max: 55, avg: 45, unit: 'kg', trend: 'up', trendPercent: 3 },
      layers: { min: 50, max: 80, avg: 65, unit: 'kg', trend: 'stable', trendPercent: 0 }
    },
    Sheep: {
      local: { min: 4000, max: 7000, avg: 5500, unit: 'head', trend: 'up', trendPercent: 5 },
      improved: { min: 7000, max: 12000, avg: 9500, unit: 'head', trend: 'up', trendPercent: 7 }
    }
  }
};

function getMarketData(category, productName) {
  const categoryData = marketPrices[category.toLowerCase()];
  if (!categoryData) {
    return {
      min: 5,
      max: 15,
      avg: 10,
      unit: 'unit',
      trend: 'stable',
      trendPercent: 0,
      source: 'Platform Average'
    };
  }

  const productData = categoryData[productName];
  if (!productData) {
    const firstGrade = Object.values(productData)[0];
    return { ...firstGrade, source: 'Platform Average' };
  }

  const grades = Object.keys(productData);
  const avgGrade = productData[grades[0]];

  return { ...avgGrade, source: 'Regional Market Average' };
}

function calculateOfferAnalysis(offerPrice, askPrice, benchmarkPrice, quantity) {
  const offerTotal = offerPrice * quantity;
  const askTotal = askPrice * quantity;
  const benchmarkTotal = benchmarkPrice * quantity;

  const offerVsAsk = ((offerPrice - askPrice) / askPrice) * 100;
  const offerVsBenchmark = ((offerPrice - benchmarkPrice) / benchmarkPrice) * 100;
  const dealGap = askTotal - offerTotal;
  const dealGapPercent = (dealGap / askTotal) * 100;

  let position = 'far_from_deal';
  if (Math.abs(offerVsAsk) <= 5) {
    position = 'very_close';
  } else if (Math.abs(offerVsAsk) <= 15) {
    position = 'close';
  } else if (Math.abs(offerVsAsk) > 30) {
    position = 'far_from_deal';
  }

  const midpoint = (offerPrice + askPrice) / 2;

  const isLowBall = offerVsAsk < -40;

  return {
    offerPrice,
    askPrice,
    benchmarkPrice,
    offerTotal,
    askTotal,
    offerVsAskPercent: offerVsAsk.toFixed(1),
    offerVsBenchmarkPercent: offerVsBenchmark.toFixed(1),
    dealGap: dealGap.toFixed(0),
    dealGapPercent: dealGapPercent.toFixed(1),
    midpoint,
    position,
    isLowBall,
    suggestion: isLowBall 
      ? 'This offer is significantly below market rates. Consider raising your offer for better acceptance.'
      : offerVsAsk <= 5 && offerVsAsk >= 0
      ? 'Excellent offer! The farmer is very likely to accept.'
      : offerVsAsk <= 0 && offerVsAsk >= -15
      ? 'Good offer within acceptable range.'
      : 'Offer submitted. Let\'s see how the farmer responds.'
  };
}

function getTrendIcon(trend) {
  switch (trend) {
    case 'up': return '+';
    case 'down': return '-';
    default: return '=';
  }
}

function getTrendColor(trend) {
  switch (trend) {
    case 'up': return 'text-green-600';
    case 'down': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

export {
  getMarketData,
  calculateOfferAnalysis,
  getTrendIcon,
  getTrendColor,
  marketPrices
};
