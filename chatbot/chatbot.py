def chatbot(message):

    message=message.lower()

    if"driver"in message:
        return"I can book a dirver for you. Please share your location."
        
    elif"book"in message:
        return"Finding the nearest driver...."

    elif"hello" in message:
        return"Hello! How can I help you today?"
        
    else:
        return"PLease type 'book driver' to start booking."