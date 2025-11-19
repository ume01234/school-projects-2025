# Garbage Sorting Support App
> [日本語版はこちら](./README.md)

---

## ✔︎ Overview

This is a support application designed for residents of Tsukuba City.  
It displays garbage collection schedules for each area, and allows users to consult with an AI (Gemini) in natural language about how to sort complex types of waste.

---

## ✔︎ Key Features

- Garbage collection calendar display by area (covers all regions in Tsukuba City, e.g., Kasuga, Kenkyu-Gakuen, etc.)
- Interactive waste-sorting chatbot powered by Gemini API  
- Lightweight web app built with Flask  
- Secure storage of API keys and area settings via `.env` file

---

## ✔︎ Tech Stack

- **Languages**
  - Python (Flask web app)
  - MySQL (storage of garbage collection schedules)
  - HTML/CSS (UI design)
- **Main Libraries**:
  - `Flask` – Web application framework
  - `flask-session` – Session management extension for Flask
  - `mysql-connector-python` – MySQL database connector
  - `python-dotenv` – Loads environment variables from `.env`
  - `openai` / `google.generativeai` – AI interaction

---

## ✔︎ Project Structure

```bash
garbage_app/
├── app/                # Flask routing and AI interaction logic
│   ├── __init__.py     # Flask app initialization
│   ├── routes.py       # Route definitions
│   ├── gpt_utils.py    # Chat logic using Gemini/GPT
│   ├── gomi_utils.py   # Logic to determine garbage day (bi-weekly, weekdays, etc.)
│   └── templates/      # HTML templates (Jinja2)
├── db/                 # MySQL scripts (e.g., schema creation, initial data)
├── static/             # Static files such as CSS
├── config.py           # DB connections and API key loader
├── run.py              # App entry point
├── .env                # Environment variables (not included in Git)
├── README.md
├── README.en.md
└── requirements.txt
```