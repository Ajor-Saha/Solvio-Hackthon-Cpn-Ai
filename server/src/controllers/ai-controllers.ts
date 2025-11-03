import { GoogleGenAI } from '@google/genai';
import { Request, Response } from 'express';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/asyncHandler';

// Initialize Google Gemini AI lazily (after env is loaded)
let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    // Remove quotes from API key if they exist
    const apiKey =
      process.env.GEMINI_API_KEY?.replace(/['"]/g, '').trim() || '';

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    console.log('✅ Gemini API Key loaded:', apiKey.substring(0, 10) + '...');

    ai = new GoogleGenAI({
      apiKey: apiKey,
    });
  }
  return ai;
}

// Research Assistant - Chat with AI about research topics
export const researchAssistantChat = asyncHandler(
  async (req: Request, res: Response) => {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, 'Message is required and must be a string')
        );
    }

    // System prompt to guide the AI to focus on research topics
    const systemPrompt = `You are an expert AI Research Assistant specialized in AI/ML research topics. Your role is to help students and researchers understand:
- Machine Learning algorithms and techniques
- Deep Learning architectures (CNNs, RNNs, Transformers, etc.)
- Natural Language Processing
- Computer Vision
- Research methodologies and paper analysis
- Latest AI/ML trends and innovations
- Statistical methods and data analysis
- Neural networks and their applications
- AI ethics and responsible AI

Provide clear, accurate, and educational responses. When discussing research papers or methodologies, explain concepts in an accessible way. If a question is outside your expertise or not related to AI/ML research, politely redirect the conversation to research topics.

Format your responses using markdown for better readability. Use bullet points, code blocks, and emphasis where appropriate.`;

    try {
      // Build conversation context
      let conversationContext = systemPrompt + '\n\n';

      // Add conversation history if provided (last 5 messages for context)
      if (conversationHistory && Array.isArray(conversationHistory)) {
        const recentHistory = conversationHistory.slice(-5);
        recentHistory.forEach((msg: any) => {
          if (msg.role === 'user') {
            conversationContext += `User: ${msg.content}\n\n`;
          } else if (msg.role === 'assistant') {
            conversationContext += `Assistant: ${msg.content}\n\n`;
          }
        });
      }

      // Add current message
      conversationContext += `User: ${message}\n\nAssistant:`;

      // Generate streaming response
      const aiInstance = getAI();
      const response = await aiInstance.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: conversationContext,
      });

      // Set headers for streaming with CORS
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

      let fullResponse = '';

      // Stream chunks to client
      for await (const chunk of response) {
        const text = chunk.text;
        if (text) {
          fullResponse += text;
          // Send chunk as Server-Sent Event
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      // Send completion signal
      res.write(`data: ${JSON.stringify({ done: true, fullResponse })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error('Error in research assistant chat:', error);

      // If streaming hasn't started, send error response
      if (!res.headersSent) {
        return res
          .status(500)
          .json(
            new ApiResponse(
              500,
              null,
              error.message || 'Failed to generate response'
            )
          );
      }

      // If streaming has started, send error event
      res.write(
        `data: ${JSON.stringify({
          error: error.message || 'Failed to generate response',
        })}\n\n`
      );
      res.end();
    }
  }
);

// Research Assistant - Non-streaming version (simpler for prototype)
export const researchAssistantChatSimple = asyncHandler(
  async (req: Request, res: Response) => {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, 'Message is required and must be a string')
        );
    }

    // System prompt for research assistant
    const systemPrompt = `You are an expert AI Research Assistant specialized in AI/ML research topics. Help students understand:
- Machine Learning and Deep Learning concepts
- Research methodologies and paper analysis
- Neural networks, NLP, Computer Vision
- Latest AI/ML trends and innovations
- Statistical methods and data analysis

Provide clear, educational responses using markdown formatting. Stay focused on AI/ML research topics.`;

    try {
      // Check if API key is configured (getAI will throw if not configured)
      const aiInstance = getAI();

      // Build conversation context
      let conversationContext = systemPrompt + '\n\n';

      // Add conversation history if provided
      if (conversationHistory && Array.isArray(conversationHistory)) {
        const recentHistory = conversationHistory.slice(-5);
        recentHistory.forEach((msg: any) => {
          if (msg.role === 'user') {
            conversationContext += `User: ${msg.content}\n\n`;
          } else if (msg.role === 'assistant') {
            conversationContext += `Assistant: ${msg.content}\n\n`;
          }
        });
      }

      // Add current message
      conversationContext += `User: ${message}\n\nAssistant:`;

      console.log('🤖 Calling Gemini API...');

      // Generate response (non-streaming)
      const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: conversationContext,
      });

      const aiResponse = response.text;

      console.log('✅ Gemini API response received');

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            message: aiResponse,
            timestamp: new Date().toISOString(),
          },
          'Response generated successfully'
        )
      );
    } catch (error: any) {
      console.error('❌ Error in research assistant chat:', error);

      // Parse error details
      let errorMessage = 'Failed to generate response';

      if (error.message) {
        errorMessage = error.message;
      }

      if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      }

      // Check for specific API errors
      if (
        errorMessage.includes('PERMISSION_DENIED') ||
        errorMessage.includes('403')
      ) {
        errorMessage =
          'Invalid or missing Gemini API key. Please check your GEMINI_API_KEY configuration.';
      } else if (
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorMessage.includes('429')
      ) {
        errorMessage = 'API rate limit exceeded. Please try again in a moment.';
      } else if (
        errorMessage.includes('INVALID_ARGUMENT') ||
        errorMessage.includes('400')
      ) {
        errorMessage =
          'Invalid request format. Please try a different question.';
      }

      return res.status(500).json(new ApiResponse(500, null, errorMessage));
    }
  }
);

// Project Assistant - Help with project planning and development
export const projectAssistantChat = asyncHandler(
  async (req: Request, res: Response) => {
    const { message, projectContext, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, 'Message is required and must be a string')
        );
    }

    // System prompt for project assistant
    const systemPrompt = `You are an AI Project Assistant specializing in transforming ideas into comprehensive, well-structured projects. Your expertise includes:

**Project Documentation:**
- Complete documentation structure and templates
- README files with clear setup instructions
- API documentation and user guides
- Architecture documentation with diagrams

**Key Features & Requirements:**
- Detailed feature breakdown and specifications
- User stories and use cases
- Requirements analysis (functional and non-functional)
- Feature prioritization and MVP definition

**Tech Stack Recommendations:**
- Technology selection based on project requirements
- Framework and library suggestions
- Database and infrastructure choices
- Development tools and best practices

**Implementation Guides:**
- Step-by-step development roadmap
- Phase-by-phase implementation plan
- Code structure and organization
- Best practices and design patterns

**Architecture & Design:**
- System architecture diagrams
- Component design and relationships
- Data flow and API design
- Scalability and performance considerations

**Best Practices:**
- Code quality standards
- Testing strategies (unit, integration, e2e)
- Security best practices
- Deployment and CI/CD pipelines

When responding:
1. Provide comprehensive, well-structured answers
2. Use markdown formatting with clear sections
3. Include code examples when relevant
4. Suggest specific tools, frameworks, and libraries
5. Outline step-by-step implementation plans
6. Consider scalability, maintainability, and best practices

Be practical, detailed, and actionable in your guidance.`;

    try {
      // Check if API key is configured (getAI will throw if not configured)
      const aiInstance = getAI();

      // Build conversation context
      let conversationContext = systemPrompt + '\n\n';

      // Add project context if provided
      if (projectContext) {
        conversationContext += `Project Context:\n${JSON.stringify(
          projectContext,
          null,
          2
        )}\n\n`;
      }

      // Add conversation history
      if (conversationHistory && Array.isArray(conversationHistory)) {
        const recentHistory = conversationHistory.slice(-5);
        recentHistory.forEach((msg: any) => {
          if (msg.role === 'user') {
            conversationContext += `User: ${msg.content}\n\n`;
          } else if (msg.role === 'assistant') {
            conversationContext += `Assistant: ${msg.content}\n\n`;
          }
        });
      }

      // Add current message
      conversationContext += `User: ${message}\n\nAssistant:`;

      // Generate response
      const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: conversationContext,
      });

      const aiResponse = response.text;

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            message: aiResponse,
            timestamp: new Date().toISOString(),
          },
          'Response generated successfully'
        )
      );
    } catch (error: any) {
      console.error('❌ Error in project assistant chat:', error);

      // Parse error details
      let errorMessage = 'Failed to generate response';

      if (error.message) {
        errorMessage = error.message;
      }

      if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      }

      // Check for specific API errors
      if (
        errorMessage.includes('PERMISSION_DENIED') ||
        errorMessage.includes('403')
      ) {
        errorMessage =
          'Invalid or missing Gemini API key. Please check your GEMINI_API_KEY configuration.';
      } else if (
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorMessage.includes('429')
      ) {
        errorMessage = 'API rate limit exceeded. Please try again in a moment.';
      }

      return res.status(500).json(new ApiResponse(500, null, errorMessage));
    }
  }
);

// Project Assistant - Streaming version for real-time responses
export const projectAssistantChatStream = asyncHandler(
  async (req: Request, res: Response) => {
    const { message, projectContext, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, 'Message is required and must be a string')
        );
    }

    // System prompt for project assistant (same as non-streaming version)
    const systemPrompt = `You are an AI Project Assistant specializing in transforming ideas into comprehensive, well-structured projects. Your expertise includes:

**Project Documentation:**
- Complete documentation structure and templates
- README files with clear setup instructions
- API documentation and user guides
- Architecture documentation with diagrams

**Key Features & Requirements:**
- Detailed feature breakdown and specifications
- User stories and use cases
- Requirements analysis (functional and non-functional)
- Feature prioritization and MVP definition

**Tech Stack Recommendations:**
- Technology selection based on project requirements
- Framework and library suggestions
- Database and infrastructure choices
- Development tools and best practices

**Implementation Guides:**
- Step-by-step development roadmap
- Phase-by-phase implementation plan
- Code structure and organization
- Best practices and design patterns

**Architecture & Design:**
- System architecture diagrams
- Component design and relationships
- Data flow and API design
- Scalability and performance considerations

**Best Practices:**
- Code quality standards
- Testing strategies (unit, integration, e2e)
- Security best practices
- Deployment and CI/CD pipelines

When responding:
1. Provide comprehensive, well-structured answers
2. Use markdown formatting with clear sections
3. Include code examples when relevant
4. Suggest specific tools, frameworks, and libraries
5. Outline step-by-step implementation plans
6. Consider scalability, maintainability, and best practices

Be practical, detailed, and actionable in your guidance.`;

    try {
      // Build conversation context
      let conversationContext = systemPrompt + '\n\n';

      // Add project context if provided
      if (projectContext) {
        conversationContext += `Project Context:\n${JSON.stringify(
          projectContext,
          null,
          2
        )}\n\n`;
      }

      // Add conversation history
      if (conversationHistory && Array.isArray(conversationHistory)) {
        const recentHistory = conversationHistory.slice(-5);
        recentHistory.forEach((msg: any) => {
          if (msg.role === 'user') {
            conversationContext += `User: ${msg.content}\n\n`;
          } else if (msg.role === 'assistant') {
            conversationContext += `Assistant: ${msg.content}\n\n`;
          }
        });
      }

      // Add current message
      conversationContext += `User: ${message}\n\nAssistant:`;

      // Generate streaming response
      const aiInstance = getAI();
      const response = await aiInstance.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: conversationContext,
      });

      // Set headers for streaming with CORS
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

      let fullResponse = '';

      // Stream chunks to client
      for await (const chunk of response) {
        const text = chunk.text;
        if (text) {
          fullResponse += text;
          // Send chunk as Server-Sent Event
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      // Send completion signal
      res.write(`data: ${JSON.stringify({ done: true, fullResponse })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error('Error in project assistant chat stream:', error);

      // If streaming hasn't started, send error response
      if (!res.headersSent) {
        return res
          .status(500)
          .json(
            new ApiResponse(
              500,
              null,
              error.message || 'Failed to generate response'
            )
          );
      }

      // If streaming has started, send error event
      res.write(
        `data: ${JSON.stringify({
          error: error.message || 'Failed to generate response',
        })}\n\n`
      );
      res.end();
    }
  }
);
