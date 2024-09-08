import sys
import os

lib_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../env/Lib/site-packages'))
sys.path.append(lib_path)

import PyPDF2
import requests
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json


# Hugging Face API details
API_URL = "https://api-inference.huggingface.co/models/slauw87/bart_summarisation"
headers = {"Authorization": f"Bearer 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"}

# Function to extract text from a PDF file
def extract_text_from_pdf(file):
    pdf_reader = PyPDF2.PdfReader(file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text

# Function to summarize text using Hugging Face API
def summarize_with_huggingface_api(text):
    # Limit text length to 1024 tokens (around 4096 characters)
    max_input_length = 4096
    text = text[:max_input_length]

    payload = {
        "inputs": text,
        "parameters": {
            "max_length": 150,
            "min_length": 50,
            "do_sample": False
        }
    }
    
    response = requests.post(API_URL, headers=headers, json=payload)

    # Check for a successful response
    if response.status_code != 200:
        print(f"Error: API request failed with status code {response.status_code}")
        print(f"Response: {response.text}")
        return None
    
    response_json = response.json()

    # Check if the response contains the expected data
    if isinstance(response_json, list) and len(response_json) > 0:
        return response_json
    else:
        print("Warning: No summary returned or unexpected response format.")
        print(f"Response: {response_json}")
        return None

# Function to split text using langchain
def split_text_with_langchain(text, chunk_size, chunk_overlap):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    return text_splitter.split_text(text)

# Function to combine relevant chunks based on similarity
def combine_relevant_chunks(chunks):
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(chunks)
    similarity_matrix = cosine_similarity(X)

    # Combine chunks that are highly similar
    combined_chunks = []
    already_combined = [False] * len(chunks)

    for i in range(len(chunks)):
        if not already_combined[i]:
            combined_chunk = chunks[i]
            for j in range(len(chunks)):
                if i != j and similarity_matrix[i, j] > 0.5:  # Adjust threshold as needed
                    combined_chunk += "\n\n" + chunks[j]
                    already_combined[j] = True
            combined_chunks.append(combined_chunk)

    return combined_chunks

# Main function to summarize PDF content
def summarize_pdf(file_path):
    pdf_text = extract_text_from_pdf(file_path)
    
    chunk_size = 1250
    chunk_overlap = 100

    chunks = split_text_with_langchain(pdf_text, chunk_size, chunk_overlap)
    combined_chunks = combine_relevant_chunks(chunks)

    full_summary = []
    for i, combined_chunk in enumerate(combined_chunks):
        summary_response = summarize_with_huggingface_api(combined_chunk)
        
        if summary_response and 'summary_text' in summary_response[0]:
            summary_text = summary_response[0]['summary_text']
            full_summary.append(summary_text + "\n\n")
        else:
            full_summary.append("[No summary available]\n\n")
    
    if full_summary:
        summary_text = "\n\n" + "".join(full_summary)
        return summary_text
    return None

if __name__ == "__main__":
    file_path = sys.argv[1]
    summary = summarize_pdf(file_path)
    
    # Ensure only the summary is output in JSON format
    if summary:
        print(json.dumps({"summary": summary}))
    else:
        print(json.dumps({"summary": "No summary generated."}))