// Simple third-party API service using quotable.io (free health quotes API)
const axios = require('axios');

/**
 * Get random dental health tip
 * Uses quotable.io API for health-related quotes
 * No authentication required - completely free
 */
exports.getDentalTip = async () => {
  try {
    // Try to get a health-related quote
    const response = await axios.get('https://api.quotable.io/random?tags=health');
    
    return {
      success: true,
      data: {
        tip: response.data.content,
        author: response.data.author || 'Health Expert'
      }
    };
  } catch (error) {
    // Fallback to static dental tips if API fails
    const tips = [
      { tip: 'Brush your teeth twice a day for at least two minutes.', author: 'DentOps Health Team' },
      { tip: 'Floss daily to remove plaque from between teeth.', author: 'DentOps Health Team' },
      { tip: 'Visit your dentist every six months for a checkup.', author: 'DentOps Health Team' },
      { tip: 'Limit sugary foods and drinks to protect your teeth.', author: 'DentOps Health Team' },
      { tip: 'Replace your toothbrush every 3-4 months.', author: 'DentOps Health Team' },
      { tip: 'Drink plenty of water to keep your mouth clean.', author: 'DentOps Health Team' },
      { tip: 'Use fluoride toothpaste to strengthen tooth enamel.', author: 'DentOps Health Team' }
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    return {
      success: true,
      data: randomTip
    };
  }
};
