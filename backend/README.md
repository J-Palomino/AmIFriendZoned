

To build and run docker contaainer:
# Navigate to backend folder
cd backend

# Build the image
docker build -t friendzone-r-backend .

# Run with Docker
docker run -p 8000:8000 friendzone-r-backend

# Or use docker-compose
docker-compose up