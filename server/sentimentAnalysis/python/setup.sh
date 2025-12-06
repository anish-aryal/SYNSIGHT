#!/bin/bash

# Navigate to python directory
cd "$(dirname "$0")"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null
then
    echo "Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Create virtual environment (optional but recommended)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

echo "Python environment setup complete!"
echo "VADER Sentiment Analysis is ready to use."