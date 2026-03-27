#!/bin/bash

cd backend
sudo service postgresql start

source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 &

cd ../frontend
npm run dev &

ngrok http 5173
