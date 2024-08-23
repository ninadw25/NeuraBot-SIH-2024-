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
    """Main function to run the Streamlit app."""
    st.sidebar.markdown("<h3 style='color: #007BFF;'>Settings</h3>", unsafe_allow_html=True)
    st.sidebar.write("Adjust your preferences:")

    # Add the model list to the sidebar
    model_choice = st.sidebar.selectbox(
        "Choose the model:", 
        [
            "gemma-7b", 
            "gemma2-96-it", 
            "llama3-70b-versatile", 
            "llama3-8b-instant", 
            "llama-guard-3-8b", 
            "llama3-70b-8192", 
            "llama3-8b-8192", 
            "llama3-groq-70b-8192-tool-use-preview", 
            "llama3-groq-86-8192-tool-use-preview", 
            "mixtral-8x7b-32768"
        ]
    )

    theme_choice = st.sidebar.radio("Choose a theme:", ["Light", "Dark"])
    
    st.markdown(f"<h2 style='text-align: center; color:#007BFF;'>nullPointers</h2>", unsafe_allow_html=True)
    st.markdown("<h4 style color:black;'>Chat with the bot</h4>", unsafe_allow_html=True)
    
    st.write("Click the button below and speak into your microphone.")
    if st.button("🎤 Record"):
        user_input = recognize_speech()
    else:
        user_input = st.text_input("", key="input", placeholder="Type your question here...")
    
    if "generated" not in st.session_state:
        st.session_state["generated"] = ["I am ready to help you"]
    if "past" not in st.session_state:
        st.session_state["past"] = ["Hey there!"]

    if user_input:
        answer, related_questions = process_answer({'query': user_input}, model_choice)
        st.session_state["past"].append(user_input)
        st.session_state["generated"].append(answer)
        st.session_state["related_questions"] = related_questions

    if st.session_state["generated"]:
        st.write("<hr>", unsafe_allow_html=True)
        for i in range(len(st.session_state["generated"])):
            st.markdown(f"<div style='background-color: #F1F1F1; padding: 10px; border-radius: 10px;'><strong>User:</strong> {st.session_state['past'][i]}</div>", unsafe_allow_html=True)
            st.markdown(f"<div style='background-color: #007BFF; color: white; padding: 10px; border-radius: 10px; margin-top: 10px;'><strong>Bot:</strong> {st.session_state['generated'][i]}</div>", unsafe_allow_html=True)
        
        if "related_questions" in st.session_state:
            st.write("<h4>Related Questions:</h4>", unsafe_allow_html=True)
            for question in st.session_state["related_questions"]:
                if st.button(question):
                    st.session_state["past"].append(question)
                    st.session_state["generated"].append(process_answer({'query': question}, model_choice)[0])
                    st.experimental_rerun()

if __name__ == "__main__":
    main()