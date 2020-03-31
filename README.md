# Bungholio

Monitors Amazon and sends a text when watched products (like TP) become available. It will send a text at most once per day per product.

**Note**

Requires a Twilio account.

## Installation

1. Clone this repo.
2. Modify items.json with the name and url of products you want to watch.
3. Create a .env file with the following Twilio attributes

```
accountSid=twilioSid
authToken=TwilioAuthToken
twilioFrom='+yourTwilioPhoneNumber'
twilioTo='+phoneNumberToText'
```

4. Run it

```
   node index.js
```
