import os
import numpy as np
from groq import Groq
import streamlit as st
import speech_recognition as sr

# Define the API key directly in the script
GROQ_API_KEY = "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"

# Initialize Groq client with the direct API key
groq_client = Groq(api_key=GROQ_API_KEY)

# Set the page config to change the favicon and title
st.set_page_config(page_title="nullPointers", page_icon="🧠")

def get_groq_response(prompt, model):
    """Use Groq API to get a response based on the prompt and selected model."""
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=model,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        st.error(f"Error getting response from Groq API: {e}")
        return "Error getting response from Groq API."

def process_answer(instruction, model):
    """Process the user query and return an answer."""
    
    # Load all the text chunks from the documents.txt file
    documents_file = os.path.join(os.path.dirname(__file__), 'documents.txt')
    try:
        with open(documents_file, 'r', encoding='utf-8') as f:
            texts = f.readlines()
    except UnicodeDecodeError:
        with open(documents_file, 'r', encoding='windows-1252', errors='ignore') as f:
            texts = f.readlines()

    # Combine all texts into one large context
    full_context = " ".join([text.strip() for text in texts])
    
    # Create a prompt for the LLM with the full context
    prompt = f"Based on the following context, answer the question no answering outside it nothing at all:\n{full_context}\n\nQuestion: {instruction['query']}"
    
    # Get a response from Groq API using the selected model
    response = get_groq_response(prompt, model)
    
    # Generate related questions (this is a simple example)
    related_questions = [
        f"What else can you tell me about {instruction['query']}?",
        f"How does {instruction['query']} relate to the broader topic?",
        f"Are there any examples of {instruction['query']}?"
    ]
    
    return response, related_questions

def recognize_speech():
    """Recognize speech from the microphone and return the text."""
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        st.info("Listening...")
        audio = recognizer.listen(source)
        try:
            return recognizer.recognize_google(audio)
        except sr.UnknownValueError:
            st.error("Could not understand the audio.")
            return ""
        except sr.RequestError as e:
            st.error(f"Could not request results from Google Speech Recognition service; {e}")
            return ""

# Example Streamlit integration (adapt as needed)
def main():
    
    st.sidebar.header("Settings")
    st.sidebar.subheader("Model Selection")
    model_choice = st.sidebar.selectbox("Choose the model:", [
        "llama3-8b-8192", "gemma2-9b-it", "llama3.1-70b-versatile",
        "llama3.1-8b-instant", "llama-guard-3-8b", "llama3-70b-8192",
        "llama3-groq-70b-8192-tool-use-preview", "llama3-groq-8b-8192-tool-use-preview",
        "mixtral-8x7b-32768"
    ])
    st.sidebar.subheader("Theme")
    theme_choice = st.sidebar.radio("Choose a theme:", ["Light", "Dark"])

    st.markdown("""
        <style>
        .main {
            background: linear-gradient(65deg,#3c4c5b, #97a0b8 );;
            padding: 20px;
            border-radius: 10px;
        }
        .stButton button {
            background-color: #007BFF;
            color: white;
            border-radius: 10px;
            padding: 10px;
        }
        .stTextInput input {
            border-radius: 10px;
            padding: 10px;
        }
        </style>
        """, unsafe_allow_html=True)

    st.markdown('<div class="main">', unsafe_allow_html=True)
    st.markdown(f"<h2 style='text-align: center; color:#007BFF;'>nullPointers</h2>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)
    
    # Rest of your code remains unchanged
    
    # Initialize session state variables if not present
    if "generated" not in st.session_state:
        st.session_state["generated"] = []
    if "past" not in st.session_state:
        st.session_state["past"] = []
    if "related_questions" not in st.session_state:
        st.session_state["related_questions"] = []

    # Create a container for the chat history
    chat_container = st.container()
    input_container = st.container()

    # Display past queries and responses
    with chat_container:
        if st.session_state["generated"]:
            st.write("<hr>", unsafe_allow_html=True)
            for i in range(len(st.session_state["generated"])):
                st.markdown(f"<div style='background-color: #F1F1F1; padding: 10px; border-radius: 10px;'><strong>User:</strong> {st.session_state['past'][i]}</div>", unsafe_allow_html=True)
                st.markdown(f"<div style='background-color: #007BFF; color: white; padding: 10px; border-radius: 10px; margin-top: 10px;'><strong>Bot:</strong> {st.session_state['generated'][i]}</div>", unsafe_allow_html=True)
            
            # Display related questions
            if st.session_state["related_questions"]:
                st.write("<h4>Related Questions:</h4>", unsafe_allow_html=True)
                for question in st.session_state["related_questions"]:
                    if st.button(question, key=question):
                        # Avoid duplicate processing of the same related question
                        if question not in st.session_state["past"]:
                            st.session_state["past"].append(question)
                            answer = process_answer({'query': question}, model_choice)[0]
                            st.session_state["generated"].append(answer)
                            # Optionally clear related questions if they should not be reused
                            st.session_state["related_questions"] = [q for q in st.session_state["related_questions"] if q != question]

    # Handle microphone recording and text input at the bottom
    with input_container:
        if st.button("🎤 Record"):
            user_input = recognize_speech()
            st.session_state["last_input"] = user_input
        else:
            user_input = st.text_input("", key="input", placeholder="Type your question here...")
            st.session_state["last_input"] = user_input
    
    # Process user input if it is not empty
    if st.session_state.get("last_input"):
        # Check if this input is already processed
        if st.session_state["last_input"] not in st.session_state["past"]:
            answer, related_questions = process_answer({'query': st.session_state["last_input"]}, model_choice)
            st.session_state["past"].append(st.session_state["last_input"])
            st.session_state["generated"].append(answer)
            st.session_state["related_questions"] = related_questions

if __name__ == "__main__":
    main()
