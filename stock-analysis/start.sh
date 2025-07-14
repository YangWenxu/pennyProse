#!/bin/bash

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "Python3 is not installed. Please install Python3 first."
    exit 1
fi

# 检查pip是否安装
if ! command -v pip3 &> /dev/null; then
    echo "pip3 is not installed. Please install pip3 first."
    exit 1
fi

echo "Installing Python dependencies..."
pip3 install -r requirements.txt

echo "Starting Stock Analysis API server..."
python3 main.py
