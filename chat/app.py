import os
import re
import streamlit as st
import pdfplumber
import speech_recognition as sr
from groq import Groq
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
from streamlit_router import StreamlitRouter

# Define the API key directly in the script
GROQ_API_KEY = "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"

# Initialize Groq client with the direct API key
groq_client = Groq(api_key=GROQ_API_KEY)

# Set the page config to change the favicon and title
st.set_page_config(page_title="nullPointers", page_icon="🧠", layout="wide")

# Cache the summarization model and tokenizer for efficiency
@st.cache_resource(show_spinner=False)
def load_summarization_model():
    model_name = "sshleifer/distilbart-cnn-12-6"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    summarizer = pipeline("summarization", model=model, tokenizer=tokenizer)
    return summarizer

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
    except FileNotFoundError:
        st.error("The 'documents.txt' file was not found.")
        return "Error: 'documents.txt' file not found.", []

    # Combine all texts into one large context
    full_context = " ".join([text.strip() for text in texts])
    
    # Create a prompt for the LLM with the full context
    prompt = f"Based on the following context, answer the question without providing information outside of it:\n{full_context}\n\nQuestion: {instruction['query']}"
    
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

def summarize_pdf(pdf_file):
    """
    Extracts text from a PDF, preprocesses it, and generates a summary using a pre-trained model.
    
    Args:
    - pdf_file (UploadedFile): The uploaded PDF file.
    
    Returns:
    - str: The summarized text of the PDF content.
    """
    # Step 1: Extract Text from PDF
    def extract_text_from_pdf(pdf_bytes):
        text = ""
        try:
            with pdfplumber.open(pdf_bytes) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + " "
            return text
        except Exception as e:
            st.error(f"Error extracting text from PDF: {e}")
            return None

    # Step 2: Preprocess Text
    def preprocess_text(text):
        text = re.sub(r'\s+', ' ', text)  # Replace multiple whitespaces with a single space
        text = re.sub(r'\n', ' ', text)   # Remove newlines
        text = re.sub(r'[^\x00-\x7F]+', ' ', text)  # Remove non-UTF-8 characters
        text = text.strip()
        return text

    # Extract and preprocess text
    raw_text = extract_text_from_pdf(pdf_file)
    if not raw_text:
        return None

    preprocessed_text = preprocess_text(raw_text)

    if len(preprocessed_text) == 0:
        st.warning("The uploaded PDF does not contain extractable text.")
        return None

    # Step 3: Load the Summarization Model
    summarizer = load_summarization_model()

    # Step 4: Chunk Text if Too Long
    max_chunk_length = 1024
    text_chunks = [preprocessed_text[i:i+max_chunk_length] for i in range(0, len(preprocessed_text), max_chunk_length)]

    # Step 5: Generate Summaries for Each Chunk and Combine
    summaries = []
    for chunk in text_chunks:
        try:
            summary = summarizer(
                chunk, 
                max_length=150, 
                min_length=60, 
                do_sample=False
            )[0]["summary_text"]
            summaries.append(summary)
        except Exception as e:
            st.error(f"Error during summarization: {e}")
            return None

    # Combine all summaries into one
    full_summary = ' '.join(summaries)
    return full_summary

def chatbot_ui(model_choice):
    """Chatbot interface."""
    st.markdown(f"<h2 style='text-align: center; color:#007BFF;'>nullPointers Chatbot</h2>", unsafe_allow_html=True)
    
    st.write("Interact with the chatbot using text input or voice commands.")

    # Initialize session state variables if not present
    if "generated" not in st.session_state:
        st.session_state["generated"] = []
    if "past" not in st.session_state:
        st.session_state["past"] = []
    if "related_questions" not in st.session_state:
        st.session_state["related_questions"] = []

    # Input method selection
    input_method = st.radio("Choose input method:", ("Text", "Voice"))

    # Handle input
    if input_method == "Text":
        user_input = st.text_input("You:", key="input", placeholder="Type your question here...")
    else:
        if st.button("🎤 Start Recording"):
            user_input = recognize_speech()
            if user_input:
                st.write(f"**You:** {user_input}")
        else:
            user_input = None

    # Process user input
    if user_input:
        with st.spinner("Generating response..."):
            answer, related_questions = process_answer({'query': user_input}, model_choice)
            st.session_state["past"].append(user_input)
            st.session_state["generated"].append(answer)
            st.session_state["related_questions"] = related_questions

    # Display conversation history
    if st.session_state["generated"]:
        for i in range(len(st.session_state["generated"])-1, -1, -1):
            st.markdown(f"<div style='background-color: #F1F1F1; padding: 10px; border-radius: 10px;'><strong>User:</strong> {st.session_state['past'][i]}</div>", unsafe_allow_html=True)
            st.markdown(f"<div style='background-color: #007BFF; color: white; padding: 10px; border-radius: 10px; margin-top: 5px;'><strong>Bot:</strong> {st.session_state['generated'][i]}</div>", unsafe_allow_html=True)

    # Display related questions
    if st.session_state.get("related_questions"):
        st.markdown("<h4>Related Questions:</h4>", unsafe_allow_html=True)
        cols = st.columns(3)
        for idx, question in enumerate(st.session_state["related_questions"]):
            if cols[idx % 3].button(question):
                with st.spinner("Generating response..."):
                    answer, _ = process_answer({'query': question}, model_choice)
                    st.session_state["past"].append(question)
                    st.session_state["generated"].append(answer)

def summarizer_ui():
    """Text Summarizer interface."""
    st.markdown(f"<h2 style='text-align: center; color:#007BFF;'>PDF Text Summarizer</h2>", unsafe_allow_html=True)
    
    st.write("Upload a PDF document to generate a concise summary.")

    uploaded_file = st.file_uploader("Choose a PDF file", type="pdf")

    if uploaded_file is not None:
        file_size = uploaded_file.size
        if file_size > 10 * 1024 * 1024:
            st.error("File size exceeds 10MB limit. Please upload a smaller file.")
            return

        with st.spinner("Processing and summarizing the PDF..."):
            summary = summarize_pdf(uploaded_file)

        if summary:
            st.markdown("<h4>Summary:</h4>", unsafe_allow_html=True)
            with st.expander("Click to view summary"):
                st.write(summary)
            
            # Download summary as text file
            summary_bytes = summary.encode('utf-8')
            st.download_button(
                label="Download Summary",
                data=summary_bytes,
                file_name="summary.txt",
                mime="text/plain"
            )

def home():
    """Main function to run the Streamlit app."""
    st.sidebar.image("https://i.imgur.com/6Iej2cL.png", use_column_width=True)
    st.sidebar.markdown("<h2 style='color: #007BFF;'>Navigation</h2>", unsafe_allow_html=True)
    
    # Navigation options
    option = st.sidebar.radio("", ["Chatbot", "Summarizer"])

    st.sidebar.markdown("<h2 style='color: #007BFF;'>Settings</h2>", unsafe_allow_html=True)
    
    # Add the model list to the sidebar
    model_choice = st.sidebar.selectbox(
        "Choose the model:", 
        [
            "llama3-8b-8192",
            "gemma2-9b-it",
            "llama3.1-70b-versatile",
            "llama3.1-8b-instant",
            "llama-guard-3-8b",
            "llama3-70b-8192",
            "llama3-groq-70b-8192-tool-use-preview",
            "llama3-groq-8b-8192-tool-use-preview",
            "mixtral-8x7b-32768"
        ]
    )
    
    # Theme selection (for demonstration purposes)
    theme_choice = st.sidebar.selectbox("Choose a theme:", ["Default", "Light", "Dark"])

    # Apply theme styles (this requires additional CSS or Streamlit theming configuration)
    if theme_choice == "Light":
        st.markdown(
            """
            <style>
            .main {
                background-color: #FFFFFF;
                color: #000000;
            }
            </style>
            """,
            unsafe_allow_html=True
        )
    elif theme_choice == "Dark":
        st.markdown(
            """
            <style>
            .main {
                background-color: #2E2E2E;
                color: #FFFFFF;
            }
            </style>
            """,
            unsafe_allow_html=True
        )

    # Render the selected page
    if option == "Chatbot":
        chatbot_ui(model_choice)
    elif option == "Summarizer":
        summarizer_ui()
    
def test():
    st.success("Test Successfull")

# List of objects
pages = [
    st.Page(name="Home", path="/", func=home),
    st.Page(name="Test", path="test", func=test)
]

router = StreamlitRouter(pages)
router.route()