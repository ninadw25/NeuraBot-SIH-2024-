import os
import numpy as np
import streamlit as st
from gtts import gTTS
from io import BytesIO
from groq import Groq
import speech_recognition as sr

# Define the API key directly in the script
GROQ_API_KEY = "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"

# Initialize Groq client with the direct API key
groq_client = Groq(api_key=GROQ_API_KEY)

def get_groq_response(prompt):
    """Use Groq API to get a response based on the prompt."""
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama3-8b-8192",
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        st.error(f"Error getting response from Groq API: {e}")
        return "Error getting response from Groq API."

def generate_related_questions(prompt):
    """Generate related questions based on the given prompt."""
    related_prompt = f"Generate 2 related questions to the following prompt:\n'{prompt}'"
    try:
        related_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": related_prompt,
                }
            ],
            model="llama3-8b-8192",
        )
        return related_completion.choices[0].message.content.strip().split("\n")
    except Exception as e:
        st.error(f"Error generating related questions: {e}")
        return ["Could not generate related questions due to an error."]

def process_answer(instruction):
    """Process the user query and return an answer."""
    documents_file = os.path.join(os.path.dirname(__file__), 'documents.txt')
    try:
        with open(documents_file, 'r', encoding='utf-8') as f:
            texts = f.readlines()
    except UnicodeDecodeError:
        with open(documents_file, 'r', encoding='windows-1252', errors='ignore') as f:
            texts = f.readlines()

    full_context = " ".join([text.strip() for text in texts])
    prompt = f"Based on the following context, answer the question:\n{full_context}\n\nQuestion: {instruction['query']}"
    response = get_groq_response(prompt)
    related_questions = generate_related_questions(instruction['query'])
    return response, related_questions

def text_to_speech(text):
    """Convert text to speech using gTTS and return the audio data."""
    tts = gTTS(text)
    audio_data = BytesIO()
    tts.write_to_fp(audio_data)
    audio_data.seek(0)
    return audio_data

def speech_to_text():
    """Capture voice input from the user and convert it to text."""
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        # Adjust for ambient noise and start listening
        recognizer.adjust_for_ambient_noise(source, duration=0.5)
        st.info("Listening... Please speak.")
        try:
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
            user_input = recognizer.recognize_google(audio)
            return user_input
        except sr.UnknownValueError:
            st.warning("Sorry, I could not understand your speech.")
        except sr.RequestError:
            st.error("Could not request results from Google Speech Recognition service.")
        except sr.WaitTimeoutError:
            st.warning("Listening timed out. Please try again.")
    return None

def main():
    """Main function to run the Streamlit app."""
    st.markdown("<h2 style='text-align: center; color:red;'>Chat Here</h2>", unsafe_allow_html=True)
    st.markdown("<h4 style='color:black;'>Chat with the bot</h4>", unsafe_allow_html=True)

    # Initialize user_input to avoid UnboundLocalError
    user_input = None

    # Choose between text input and voice input
    input_mode = st.radio("Select input mode:", ("Text", "Voice"))

    if input_mode == "Text":
        user_input = st.text_input("", key="input")
    else:
        if st.button("Press to Speak"):
            user_input = speech_to_text()
            if user_input:
                st.write(f"**You said:** {user_input}")
            else:
                user_input = ""  # Set to an empty string if nothing is captured

    if "generated" not in st.session_state:
        st.session_state["generated"] = []
    if "past" not in st.session_state:
        st.session_state["past"] = []
    if "audio_data" not in st.session_state:
        st.session_state["audio_data"] = []
    if "related_questions" not in st.session_state:
        st.session_state["related_questions"] = []

    if user_input:
        # Ensure the recognized speech is passed for chatbot response
        answer, related_questions = process_answer({'query': user_input})

        # Convert the response to speech
        audio_data = text_to_speech(answer)

        # Store the conversation history, audio data, and related questions
        st.session_state["past"].append(user_input)
        st.session_state["generated"].append(answer)
        st.session_state["audio_data"].append(audio_data)
        st.session_state["related_questions"].append(related_questions)

    # Display the entire conversation history with corresponding audio and related questions
    if st.session_state["generated"]:
        for i in range(len(st.session_state["generated"])):
            st.write(f"**User:** {st.session_state['past'][i]}")
            st.write(f"**Bot:** {st.session_state['generated'][i]}")
            st.audio(st.session_state["audio_data"][i], format="audio/mp3")
            st.write(f"**Related Questions:**")
            for question in st.session_state["related_questions"][i]:
                st.write(f"- {question}")

if __name__ == "__main__":
    main()
