import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import nltk
from nltk.tokenize import sent_tokenize
import fitz  # PyMuPDF
import streamlit as st

# Initialize tokenizer and model as None for lazy loading
tokenizer = None
model = None
device = "cuda" if torch.cuda.is_available() else "cpu"
model_ckpt = "google/pegasus-cnn_dailymail"

def main():
    st.title("PDF Summarizer")
    pdf_file = st.file_uploader("Upload your PDF file", type=["pdf"])
    if pdf_file:
        pdf_path = pdf_file.name
        with open(pdf_path, "wb") as f:
            f.write(pdf_file.getvalue())

        # Summarize PDF
        summary = summarize_pdf(pdf_path)
        st.text_area("Summary", summary, height=250)

def summarize_pdf(pdf_path):
    global tokenizer, model
    # Load model and tokenizer if not already loaded
    if tokenizer is None or model is None:
        tokenizer = AutoTokenizer.from_pretrained(model_ckpt)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_ckpt).to(device)

    # Extract text from PDF
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    if not text.strip():
        return "No text extracted from PDF."

    # Adjust text by word limits
    words = text.split()
    min_words = 300
    max_words = 1000
    if len(words) < min_words:
        return "Text is too short for summarization."
    if len(words) > max_words:
        text = ' '.join(words[:max_words])

    # Summarize text
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=1024).to(device)
    summary_ids = model.generate(
        inputs["input_ids"],
        max_length=1500,
        min_length=600,
        early_stopping=True,
        do_sample=False
    )
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    sentences = sent_tokenize(summary)
    bullet_points = "\n".join(f"- {sentence}" for sentence in sentences)
    return bullet_points

if __name__ == "__main__":
    main()