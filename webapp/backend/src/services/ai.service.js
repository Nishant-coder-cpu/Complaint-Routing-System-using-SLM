const axios = require('axios');

const AI_API_URL = process.env.AI_API_URL || 'http://localhost:8000';

class AIService {
    async classifyComplaint(complaintText) {
        try {
            const response = await axios.post(`${AI_API_URL}/classify`, {
                complaint: complaintText
            }, {
                timeout: 30000 // 30 second timeout
            });

            return response.data;
        } catch (error) {
            console.error('AI classification error:', error.message);
            throw new Error('Failed to classify complaint');
        }
    }

    async explainClassification(complaintText) {
        try {
            const response = await axios.post(`${AI_API_URL}/explain`, {
                complaint: complaintText
            }, {
                timeout: 30000
            });

            return response.data;
        } catch (error) {
            console.error('AI explanation error:', error.message);
            throw new Error('Failed to explain classification');
        }
    }

    async batchClassify(complaints) {
        try {
            const response = await axios.post(`${AI_API_URL}/classify/batch`, {
                complaints
            }, {
                timeout: 60000 // 60 second timeout for batch
            });

            return response.data;
        } catch (error) {
            console.error('AI batch classification error:', error.message);
            throw new Error('Failed to batch classify complaints');
        }
    }

    async chat(message) {
        try {
            const response = await axios.post(`${AI_API_URL}/chat`, {
                message
            }, {
                timeout: 30000
            });

            return response.data.response;
        } catch (error) {
            console.error('AI chat error:', error.message);
            throw new Error('Failed to get chat response');
        }
    }
}

module.exports = new AIService();
