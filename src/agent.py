from openai import AsyncOpenAI
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv
import asyncio
from .config import config
from .models.response import Citation

load_dotenv()

class AgentService:
    """Service for handling AI agent operations via OpenRouter"""

    def __init__(self):
        # Initialize OpenAI client with OpenRouter settings
        self.client = AsyncOpenAI(
            base_url=config.OPENROUTER_URL,
            api_key=config.OPENROUTER_API_KEY
        )

    async def generate_response(self,
                              query: str,
                              context: str = "",
                              selected_text: Optional[str] = None,
                              conversation_history: Optional[List[Dict]] = None) -> Dict:
        """
        Generate a response using the AI agent with provided context
        """
        try:
            # Build the system message to guide the AI
            system_message = f"""
            You are an AI assistant for the Physical AI & Humanoid Robotics textbook.
            Your purpose is to answer questions based only on the content from this textbook.
            Be helpful, accurate, and cite the specific sections you reference.

            Guidelines:
            - The name of the Book is "Physical AI & Humanoid Robotics Textbook." 
            - Only provide information that comes from the textbook content provided in the context
            - If the question cannot be answered from the provided context, politely explain that the topic isn't covered in the book
            - Provide citations in the format: [Source: file_path, Section: section_title]
            - Keep responses concise but comprehensive (under {config.MAX_RESPONSE_TOKENS} tokens)
            - If selected text is provided, prioritize information from that text
            """

            # Build the messages for the conversation
            messages = [
                {"role": "system", "content": system_message}
            ]

            # Add conversation history if available
            if conversation_history:
                for msg in conversation_history:
                    messages.append(msg)

            # Prepare the user query content
            user_content = f"Question: {query}\n\n"

            # If selected text is provided, put it first to give it priority
            if selected_text and selected_text.strip():
                user_content += f"Selected text for reference: '{selected_text}'\n\n"

            # Add the context from the textbook
            if context.strip():
                user_content += f"Relevant textbook content:\n{context}"
            else:
                user_content += "No relevant textbook content found to answer this question."

            messages.append({"role": "user", "content": user_content})

            # Call the AI model
            response = await self.client.chat.completions.create(
                model=config.AGENT_MODEL,  # gpt-5-mini
                messages=messages,
                max_tokens=config.MAX_RESPONSE_TOKENS,
                temperature=0.3  # Lower temperature for more consistent, factual responses
            )

            # Extract the response content
            ai_response = response.choices[0].message.content

            # Calculate token count
            from .utils import count_tokens
            token_count = count_tokens(ai_response)

            return {
                "content": ai_response,
                "token_count": token_count,
                "model_used": config.AGENT_MODEL,
                "finish_reason": response.choices[0].finish_reason
            }

        except Exception as e:
            print(f"Error generating response: {e}")
            return {
                "content": "I'm sorry, but I encountered an error while processing your request. Please try again later.",
                "token_count": 0,
                "error": str(e)
            }

    async def generate_fallback_response(self, query: str) -> Dict:
        """Generate a fallback response when no relevant content is found"""
        fallback_message = (
            f"I couldn't find relevant content in the textbook to answer your question: '{query}'. "
            "This topic may not be covered in the book, or the content may not be indexed yet. "
            "Please try rephrasing your question or check other sections of the book."
        )

        from .utils import count_tokens
        token_count = count_tokens(fallback_message)

        return {
            "content": fallback_message,
            "token_count": token_count,
            "model_used": config.AGENT_MODEL,
            "is_fallback": True
        }

# Global agent service instance
agent_service = AgentService()
