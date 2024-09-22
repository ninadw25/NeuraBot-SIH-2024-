import os
from langchain_community.document_loaders import PyPDFLoader

def process_pdfs(directory):
    all_documents = []

    # Debugging: Check the provided directory
    print(f"Checking files in directory: {directory}")
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".pdf"):
                try:
                    # Full path to the PDF file
                    pdf_path = os.path.join(root, file)
                    print(f"Processing file: {pdf_path}")
                    
                    # Load the PDF using PyPDFLoader
                    loader = PyPDFLoader(pdf_path)
                    documents = loader.load()
                    
                    # Debugging: Check if documents were loaded
                    if documents:
                        print(f"First document type: {type(documents[0])}")
                        print(f"First document content: {documents[0].page_content[:500]}...")  # Print first 500 characters
                    else:
                        print(f"No documents found in {pdf_path}")
                        
                    all_documents.extend(documents)
                except Exception as e:
                    print(f"Error processing {file}: {e}")

    if not all_documents:
        print("No PDF documents found or loaded.")
        return []

    return all_documents

def save_texts(documents):
    with open('documents.txt', 'w', encoding='utf-8') as f:
        for doc in documents:
            f.write(doc.page_content + '\n')

def main():
    pdf_directory = "./docs"  # Update to your PDF directory
    all_documents = process_pdfs(pdf_directory)
    if not all_documents:
        print("No documents to save.")
        return

    save_texts(all_documents)
    print("Documents saved successfully. You can now use the texts in your application.")

if __name__ == "__main__":
    main()
