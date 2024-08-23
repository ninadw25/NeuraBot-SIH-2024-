import os
import numpy as np
from groq import Groq
import streamlit as st
from gtts import gTTS
from io import BytesIO
from transformers import T5ForConditionalGeneration, T5Tokenizer

# Define the API key directly in the script
GROQ_API_KEY = "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"

# Initialize Groq client with the direct API key
groq_client = Groq(api_key=GROQ_API_KEY)

# Load T5 model and tokenizer
model = T5ForConditionalGeneration.from_pretrained('t5-base')
tokenizer = T5Tokenizer.from_pretrained('t5-base')

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

def process_answer(instruction):
    """Process the user query and return an answer."""
    
    # Load all the text chunks from the documents.txt file
    documents_file = os.path.join(os.path.dirname(_file_), 'documents.txt')
    try:
        with open(documents_file, 'r', encoding='utf-8') as f:
            texts = f.readlines()
    except UnicodeDecodeError:
        with open(documents_file, 'r', encoding='windows-1252', errors='ignore') as f:
            texts = f.readlines()

    # Combine all texts into one large context
    full_context = " ".join([text.strip() for text in texts])
    
    # Create a prompt for the LLM with the full context
    prompt = f"Based on the following context, answer the question:\n{full_context}\n\nQuestion: {instruction['query']}"
    
    # Get a response from Groq API
    response = get_groq_response(prompt)
    return response

def generate_related_questions(input_question, num_questions=2):
    """Generate related questions using the T5 model."""
    input_ids = tokenizer.encode(f"generate questions: {input_question}", return_tensors='pt')
    outputs = model.generate(input_ids, num_return_sequences=num_questions, num_beams=10, max_length=100, early_stopping=True)
    return [tokenizer.decode(output, skip_special_tokens=True) for output in outputs]

def text_to_speech(text):
    """Convert text to speech using gTTS and return the audio data."""
    tts = gTTS(text)
    audio_data = BytesIO()
    tts.write_to_fp(audio_data)
    audio_data.seek(0)
    return audio_data

def main():
    """Main function to run the Streamlit app."""
    st.markdown("<h2 style='text-align: center; color:red;'>Chat Here</h2>", unsafe_allow_html=True)
    st.markdown("<h4 style='color:black;'>Chat with the bot</h4>", unsafe_allow_html=True)

    user_input = st.text_input("", key="input")

    if "generated" not in st.session_state:
        st.session_state["generated"] = ["I am ready to help you"]
    if "past" not in st.session_state:
        st.session_state["past"] = ["Hey there!"]
    if "related_questions" not in st.session_state:
        st.session_state["related_questions"] = []

    if user_input:
        answer = process_answer({'query': user_input})
        st.session_state["past"].append(user_input)
        st.session_state["generated"].append(answer)
        
        # Generate related questions
        related_questions = generate_related_questions(user_input)
        st.session_state["related_questions"] = related_questions

        # Automatically play the audio after generating the response
        audio_data = text_to_speech(answer)
        st.audio(audio_data, format="audio/mp3")

    if st.session_state["generated"]:
        for i in range(len(st.session_state["generated"])):
            st.write(f"*User:* {st.session_state['past'][i]}")
            st.write(f"*Bot:* {st.session_state['generated'][i]}")
        
        if st.session_state["related_questions"]:
            st.subheader("Related Questions:")
            for question in st.session_state["related_questions"]:
                if st.button(question):
                    st.session_state.selected_question = question
                    st.session_state["input"] = question  # Pass the selected question to the input field
                    st.experimental_rerun()

if _name_ == "_main_":
    main()