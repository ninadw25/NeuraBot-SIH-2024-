import streamlit as st
import torch
from transformers import PegasusForConditionalGeneration, PegasusTokenizer
import re
import PyPDF2

# Set up the model and tokenizer
@st.cache_resource
def load_model_and_tokenizer():
    model_ckpt = "google/pegasus-cnn_dailymail"
    tokenizer = PegasusTokenizer.from_pretrained(model_ckpt)
    model = PegasusForConditionalGeneration.from_pretrained(model_ckpt)
    return tokenizer, model

def summarize_text(text, model, tokenizer, max_length=150, min_length=30):
    inputs = tokenizer(text, return_tensors="pt", max_length=1024, truncation=True)
    summary_ids = model.generate(
        inputs["input_ids"],
        max_length=max_length,
        min_length=min_length,
        length_penalty=2.0,
        num_beams=4,
        early_stopping=True
    )
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary

def sentence_tokenize(text):
    # Use regular expressions to split the text into sentences
    sentences = re.split(r'(?<=[.!?]) +', text)
    return sentences

def extract_text_from_pdf(uploaded_file):
    reader = PyPDF2.PdfReader(uploaded_file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def summarize_pdf(uploaded_file):
    # Extract text from the uploaded PDF
    text = extract_text_from_pdf(uploaded_file)
    if text:
        tokenizer, model = load_model_and_tokenizer()
        summary = summarize_text(text, model, tokenizer)
        sentences = sentence_tokenize(summary)
        bullet_points = "\n".join(f"• {sentence}" for sentence in sentences)
        return bullet_points
    else:
        return "No text could be extracted from the PDF."

def summarizer_ui():
    """Text Summarizer interface."""
    st.markdown(f"<h2 style='text-align: center; color:#007BFF;'>PDF Text Summarizer</h2>", unsafe_allow_html=True)
    
    st.write("Drag and drop a PDF document to generate a concise summary.")

    uploaded_file = st.file_uploader("Drag and drop your PDF file here", type="pdf")

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

# Call the UI function to render the app
summarizer_ui()