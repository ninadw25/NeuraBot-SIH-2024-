import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
import fitz  # PyMuPDF
from flask import Flask, request, jsonify

app = Flask(_name_)

# Setup
nltk.download("punkt")

# Pre-load model and tokenizer
device = "cuda" if torch.cuda.is_available() else "cpu"
model_ckpt = "google/pegasus-xsum"  # Smaller, faster model
tokenizer = AutoTokenizer.from_pretrained(model_ckpt)
model = AutoModelForSeq2SeqLM.from_pretrained(model_ckpt).to(device)
model.to(device)

def extract_text_from_pdf(pdf_path):
    """ Extracts text from a PDF file. """
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text

def adjust_text_by_word_limit(text, min_words, max_words):
    """ Adjusts the text by word limits. """
    words = text.split()
    if len(words) < min_words:
        print("Text is too short for summarization.")
        return None
    if len(words) > max_words:
        return ' '.join(words[:max_words])
    return text

def summarize_to_bullets(text):
    """ Summarizes text to bullet points using the loaded model and tokenizer. """
    max_chunk_length = 1024
    words = word_tokenize(text)
    chunks = [' '.join(words[i:i+max_chunk_length]) for i in range(0, len(words), max_chunk_length)]
    
    summaries = []
    for chunk in chunks:
        inputs = tokenizer(chunk, return_tensors="pt", padding=True, truncation=True, max_length=max_chunk_length).to(device)
        summary_ids = model.generate(inputs["input_ids"], max_length=150, min_length=60, early_stopping=True)
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        sentences = sent_tokenize(summary)
        bullet_summary = "\n".join(f"- {sentence}" for sentence in sentences)
        summaries.append(bullet_summary)
    
    return " ".join(summaries)

@app.route('/summarize', methods=['POST'])
def summarize_pdf():
    """ Endpoint to handle PDF summarization requests. """
    pdf_path = request.json.get('pdf_path')
    if not pdf_path:
        return jsonify({'error': 'No PDF path provided'}), 400

    raw_text = extract_text_from_pdf(pdf_path)
    if not raw_text:
        return jsonify({'error': 'No text extracted from PDF'}), 400

    adjusted_text = adjust_text_by_word_limit(raw_text, 300, 1000)  # Adjusting min and max word limits
    if not adjusted_text:
        return jsonify({'error': 'Text is too short or too long for summarization'}), 400

    summary = summarize_to_bullets(adjusted_text)
    return jsonify({'summary': summary})

if _name_ == '_main_':
    app.run(debug=True)