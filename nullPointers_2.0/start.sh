#!/bin/bash

# Start the Node.js application
yarn start &

# Set PYTHONPATH to include your vendored libraries
export PYTHONPATH=$PYTHONPATH:nullPointers_2.0\env\Lib\site-packages

# Run the Python script
python your_script.py &

# Wait for all background processes to finish
wait