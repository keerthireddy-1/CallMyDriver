from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

def chatbot(message):
    message = message.lower()

    if "hello" in message or "hi" in message:
        return "Hello! Welcome to CallMyDriver. How can I help you today?"

    elif "book" in message or "driver" in message:
        return "To book a driver, please share your location and we'll find the nearest driver for you!"

    elif "price" in message or "cost" in message or "fare" in message:
        return "Our fares start from $5. Final price depends on your distance."

    elif "cancel" in message:
        return "To cancel a booking, please provide your booking ID."

    elif "help" in message:
        return "I can help you: Book a driver | Check fare | Cancel booking | Track driver"

    elif "thank" in message:
        return "You're welcome! Safe travels! 🚗"

    else:
        return "I'm sorry, I didn't understand that. Type 'help' to see what I can do!"


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message")

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    reply = chatbot(user_message)
    return jsonify({"reply": reply})


if __name__ == "_main_":
    app.run(debug=True, port=5000)