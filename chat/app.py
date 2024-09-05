import streamlit as st
import PyPDF2
import torch
from transformers import pipeline
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from groq import Groq
import os
from streamlit_lottie import st_lottie
import requests

# Groq API key
GROQ_API_KEY = "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"
groq_client = Groq(api_key=GROQ_API_KEY)

# Color Palette
PRIMARY_COLOR = "#1A2634"
SECONDARY_COLOR = "#2C3E50"
ACCENT_COLOR = "#3498DB"
TEXT_COLOR = "#34495E"

# Function to load and display Lottie animations
def load_lottieurl(url: str):
    try:
        r = requests.get(url)
        if r.status_code != 200:
            return None
        return r.json()
    except Exception as e:
        st.error(f"Error loading Lottie animation: {e}")
        return None

# PDF Summarizer Functions
@st.cache_resource
def load_summarizer_pipeline():
    device = 0 if torch.cuda.is_available() else -1
    return pipeline("summarization", model="slauw87/bart_summarisation", device=device)

def extract_text_from_pdf(file):
    pdf_reader = PyPDF2.PdfReader(file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text

def split_text_with_langchain(text, chunk_size, chunk_overlap):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    return text_splitter.split_text(text)

def combine_relevant_chunks(chunks):
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(chunks)
    similarity_matrix = cosine_similarity(X)
    
    combined_chunks = []
    already_combined = [False] * len(chunks)
    
    for i in range(len(chunks)):
        if not already_combined[i]:
            combined_chunk = chunks[i]
            for j in range(len(chunks)):
                if i != j and similarity_matrix[i, j] > 0.5:
                    combined_chunk += "\n\n" + chunks[j]
                    already_combined[j] = True
            combined_chunks.append(combined_chunk)
    
    return combined_chunks

# Chatbot Functions
def get_groq_response(prompt):
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
    documents_file = os.path.join(os.path.dirname(__file__), '.', 'documents.txt')
    try:
        with open(documents_file, 'r', encoding='utf-8') as f:
            texts = f.readlines()
    except UnicodeDecodeError:
        with open(documents_file, 'r', encoding='windows-1252', errors='ignore') as f:
            texts = f.readlines()

    full_context = " ".join([text.strip() for text in texts])
    prompt = f"Based on the following context, answer the question:\n{full_context}\n\nQuestion: {instruction['query']}"
    return get_groq_response(prompt)

def generate_recommended_questions(context):
    prompt = f"Based on the following conversation context, generate 3 follow-up questions that the user might ask:\n\n{context}\n\nRecommended questions:"
    response = get_groq_response(prompt)
    questions = response.split('\n')
    return [q.strip() for q in questions if q.strip()]

# Streamlit App
def main():
    st.set_page_config(page_title="AI Assistant", page_icon="🤖", layout="wide")

    # Custom CSS
    st.markdown(f"""
    <style>
    .reportview-container .main .block-container{{
        max-width: 1000px;
        padding-top: 2rem;
        padding-bottom: 2rem;
    }}
    .stApp {{
        color: {TEXT_COLOR};
    }}
    .stButton>button {{
        color: white;
        background-color: {ACCENT_COLOR};
        border-radius: 20px;
        border: none;
        padding: 0.5rem 1rem;
        font-weight: bold;
    }}
    .stTextInput>div>div>input {{
        border-radius: 20px;
        border: 2px solid {ACCENT_COLOR};
        padding: 0.5rem 1rem;
        background-color: white;
        color: {TEXT_COLOR};
    }}
    .stLottie {{
        margin: 0 auto;
        display: block;
    }}
    .chat-message {{
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        display: flex;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }}
    .chat-message.user {{
        background-color: {PRIMARY_COLOR};
        color: white;
    }}
    .chat-message.bot {{
        background-color: {SECONDARY_COLOR};
        color: white;
    }}
    .chat-message .avatar {{
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        margin-right: 1rem;
    }}
    .chat-message .message {{
        flex-grow: 1;
    }}
    .recommended-questions {{
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        margin-top: 1rem;
    }}
    .recommended-question {{
        flex: 1;
        background-color: {ACCENT_COLOR};
        color: white;
        border: none;
        border-radius: 20px;
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background-color 0.3s;
        text-align: center;
    }}
    .recommended-question:hover {{
        background-color: {PRIMARY_COLOR};
    }}
    </style>
    """, unsafe_allow_html=True)

    st.title("🚀 AI Assistant: PDF Summarizer & Chatbot")

    # Sidebar
    st.sidebar.title("Navigation")
    app_mode = st.sidebar.selectbox("Choose the app mode",
        ["PDF Summarizer", "Chatbot"])

    if app_mode == "PDF Summarizer":
        st.header("📄 PDF Summarization")
        
        # Load Lottie animation
        lottie_url = "https://assets5.lottiefiles.com/packages/lf20_fcfjwiyb.json"
        lottie_json = load_lottieurl(lottie_url)
        st_lottie(lottie_json, speed=1, height=200, key="initial")

        summarizer = load_summarizer_pipeline()

        uploaded_file = st.file_uploader("Upload a PDF file", type="pdf")

        if uploaded_file is not None:
            pdf_text = extract_text_from_pdf(uploaded_file)
            st.write("PDF content preview (first 500 characters):")
            st.text_area("", pdf_text[:500] + "...", height=150)

            chunk_size = 1250
            chunk_overlap = 100

            if st.button("Summarize", key="summarize_button"):
                chunks = split_text_with_langchain(pdf_text, chunk_size, chunk_overlap)
                combined_chunks = combine_relevant_chunks(chunks)
                progress_bar = st.progress(0)
                full_summary = []
                
                for i, combined_chunk in enumerate(combined_chunks):
                    with st.spinner(f"Summarizing {i+1} of {len(combined_chunks)}..."):
                        summary = summarizer(combined_chunk, max_length=150, min_length=50, do_sample=False)
                        summary_text = summary[0]['summary_text']
                        full_summary.append(summary_text + "\n\n")
                        progress_bar.progress((i + 1) / len(combined_chunks))

                st.success("Summarization complete!")
                st.markdown("### 📝 Full Summary:")
                st.markdown("".join(full_summary))

                summary_text = "# Full Summary\n\n" + "".join(full_summary)
                st.download_button(
                    label="📥 Download Summary",
                    data=summary_text,
                    file_name="summary.md",
                    mime="text/markdown"
                )

    elif app_mode == "Chatbot":
        st.header("💬 AI Chatbot")
        
        # Load new Lottie animation for chatbot with error handling
        lottie_url_chat = "https://assets5.lottiefiles.com/packages/lf20_M9p23l.json"
        lottie_json_chat = load_lottieurl(lottie_url_chat)
        
        if lottie_json_chat:
            st_lottie(lottie_json_chat, speed=1, height=200, key="chat")
        else:
            st.warning("Failed to load chat animation. Continuing without animation.")

        # Initialize session state
        if "generated" not in st.session_state:
            st.session_state["generated"] = ["I'm your AI assistant. How can I help you today?"]
        if "past" not in st.session_state:
            st.session_state["past"] = ["Hello!"]
        if "recommended_questions" not in st.session_state:
            st.session_state["recommended_questions"] = []

        # Function to handle user input
        def handle_user_input(user_input):
            answer = process_answer({'query': user_input})
            st.session_state["past"].append(user_input)
            st.session_state["generated"].append(answer)
            
            # Generate recommended questions
            context = "\n".join(st.session_state["past"] + st.session_state["generated"])
            st.session_state["recommended_questions"] = generate_recommended_questions(context)

        # Text input for user
        user_input = st.text_input("Ask me anything:", key="input")

        # Handle user input
        if user_input:
            handle_user_input(user_input)

        # Display chat messages
        for i in range(len(st.session_state["generated"])):
            message(st.session_state["past"][i], is_user=True, key=str(i) + '_user')
            message(st.session_state["generated"][i], key=str(i))

        # Display recommended questions as clickable buttons in one line
        if st.session_state["recommended_questions"]:
            st.markdown("<div class='recommended-questions'>", unsafe_allow_html=True)
            cols = st.columns(3)
            for i, question in enumerate(st.session_state["recommended_questions"][:3]):
                if cols[i].button(question, key=f"rec_q_{i}"):
                    handle_user_input(question)
                    st.experimental_rerun()  # Rerun the app to update the chat immediately
            st.markdown("</div>", unsafe_allow_html=True)

def message(text, is_user=False, key=None):
    avatar = "👤" if is_user else "🤖"
    message_type = "user" if is_user else "bot"
    
    st.markdown(f"""
    <div class="chat-message {message_type}">
        <div class="avatar">{avatar}</div>
        <div class="message">{text}</div>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()