from transformers import pipeline
import PyPDF2
import torch
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
import sys

# Function to extract text from a PDF file
def extract_text_from_pdf(file):
    pdf_reader = PyPDF2.PdfReader(file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text 

# Function to load the summarization pipeline
def load_summarizer_pipeline():
    device = 0 if torch.cuda.is_available() else -1  # Use GPU if available
    return pipeline("summarization", model="slauw87/bart_summarisation", device=device)

summarizer = load_summarizer_pipeline()

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

    # Split the text into chunks
    chunks = split_text_with_langchain(pdf_text, chunk_size, chunk_overlap)

    # Combine relevant chunks
    combined_chunks = combine_relevant_chunks(chunks)

    full_summary = []

    for i, combined_chunk in enumerate(combined_chunks):
        summary = summarizer(combined_chunk, max_length=150, min_length=50, do_sample=False)
        summary_text = summary[0]['summary_text']
        full_summary.append(f"{i + 1}\n{summary_text}\n\n")  # Add extra line breaks and headers

    # Return the full summary as a single string
    return "\n".join(full_summary)


if __name__ == "__main__":
    file_path = sys.argv[1]  # Get the file path from the command line arguments
    summary = summarize_pdf(file_path)  # Get the summary
    print(json.dumps({"summary": summary}))  # Output as JSON
