from langchain_classic.chains.summarize.map_reduce_prompt import prompt_template
from langchain_google_genai import ChatGoogleGenerativeAI
from documents.utils.document_processing import get_pinecone_instance
from dotenv import load_dotenv
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()

def get_gemini_model():
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=1.0,
        max_tokens=None,
        timeout=None,
        max_retries=2,
    )

def get_embeddings_model():
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        api_key=os.getenv("GEMINI_API_KEY"),
    )



def get_relevant_chunks(query):

    embeddings_model = get_embeddings_model()
    pc = get_pinecone_instance()

    index = pc.Index('documents')
    vector = embeddings_model.embed_query(query)
    results = index.query(
        vector=vector,
        top_k=3,
        include_metadata=True,
        include_values=True,
        namespace=""
    )
    context = []
    for match in results.matches:
        context.append({
            'content': match.metadata['chunk_content'],
            'metadata': match.metadata
        })

    return context

def get_bot_reply(user_query, context):
    model = get_gemini_model()
    prompt = f"""You are a professional customer support assistant for [Company Name].

                Your role is to provide accurate, clear, and helpful responses to customer queries using ONLY the provided context information.
                
                -----------------------
                INSTRUCTIONS
                -----------------------
                
                1. Use ONLY the information from the provided context.
                2. If the answer is not available in the context, say:
                   "I'm sorry, I couldn't find relevant information in our knowledge base. Let me connect you with a human support agent."
                3. Do NOT make up policies, prices, timelines, or features.
                4. Keep responses concise but complete.
                5. Maintain a polite, professional, and empathetic tone.
                6. If the user is frustrated, acknowledge their concern before answering.
                7. If multiple relevant pieces of context are provided, combine them logically.
                8. Do not mention that you are using a knowledge base or context retrieval system.
                9. Format responses clearly using short paragraphs or bullet points when helpful.
                10. If the user request is outside company services, politely decline.
                
                -----------------------
                CONTEXT
                -----------------------
                {context}
                
                -----------------------
                USER QUESTION
                -----------------------
                {user_query}
                
                -----------------------
                RESPONSE
                -----------------------
                Provide a clear and helpful answer.
                """

    response = model.invoke(input=prompt)

    return response


