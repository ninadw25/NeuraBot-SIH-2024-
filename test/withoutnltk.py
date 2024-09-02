import streamlit as st
import torch
from transformers import PegasusForConditionalGeneration, PegasusTokenizer
import re

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

# Streamlit app
st.title("Text Summarizer")

# Load model and tokenizer
tokenizer, model = load_model_and_tokenizer()

# Text input
text = st.text_area("Enter the text you want to summarize:", height=200)

# Summarization parameters
max_length = st.slider("Maximum summary length", min_value=50, max_value=300, value=150)
min_length = st.slider("Minimum summary length", min_value=10, max_value=200, value=30)

if st.button("Summarize"):
    if text:
        with st.spinner("Generating summary..."):
            summary = summarize_text(text, model, tokenizer, max_length, min_length)
            sentences = sentence_tokenize(summary)
            bullet_points = "\n".join(f"• {sentence}" for sentence in sentences)
            st.subheader("Summary:")
            st.markdown(bullet_points)
    else:
        st.warning("Please enter some text to summarize.")

st.markdown("---")
st.markdown("Using PEGASUS model from Google for text summarization.")
