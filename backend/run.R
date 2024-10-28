# Load required packages
library(plumber)

# Create and run the API
pr <- plumber::plumb("api.R")
pr$run(host = "0.0.0.0", port = 8000)