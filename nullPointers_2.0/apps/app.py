from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
from groq import Groq

app = Flask(__name__)
CORS(app)

client = Groq(
    api_key="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"
)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    prompt = data.get('prompt')
    
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400
    
    chat_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama3-8b-8192",
    )

    response_text = chat_completion.choices[0].message.content
    return jsonify({'response': response_text})

if __name__ == '__main__':
    app.run(debug=True)