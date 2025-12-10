// src/services/aiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Expands brief treatment notes into professional medical documentation
 * @param {string} briefNotes - Short treatment notes from dentist
 * @returns {Promise<string>} - Expanded professional notes
 */
async function expandTreatmentNotes(briefNotes) {
  try {
    if (!briefNotes || briefNotes.trim().length === 0) {
      throw new Error('Notes cannot be empty');
    }

    console.log('Attempting to use Gemini API with model: gemini-2.0-flash');
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);

    // Use gemini-2.0-flash (latest stable model on v1beta - confirmed working with curl)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Craft a dental-specific prompt
    const prompt = `You are a professional dental assistant helping dentists write detailed patient records.

Given the following brief treatment notes, expand them into a comprehensive, professional clinical note. 

Guidelines:
- Use proper dental terminology and tooth numbering (e.g., tooth #26 for upper left first molar)
- Include relevant clinical details
- Maintain a professional medical documentation tone
- Be concise but thorough
- Format as a single paragraph or structured sections if appropriate
- Do not add information that wasn't implied in the original notes
- If complications or specific details are mentioned, include them

Brief notes from dentist:
"${briefNotes}"

Expanded professional clinical note:`;

    // Generate the response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const expandedText = response.text();

    return expandedText.trim();
  } catch (error) {
    console.error('==== AI Service Error ====');
    console.error('Error object:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
   if (error.response) {
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response.data);
    }
    console.error('=========================');
    
    // Check for specific error types
    if (error.message?.includes('API key') || error.message?.includes('API_KEY')) {
      throw new Error('AI service configuration error. Please check API key.');
    }
    
    if (error.message?.includes('not found') || error.message?.includes('NOT_FOUND')) {
      throw new Error('AI model not available. Please contact support.');
    }
    
    throw new Error('Failed to generate treatment notes. Please try again.');
  }
}

module.exports = {
  expandTreatmentNotes
};
