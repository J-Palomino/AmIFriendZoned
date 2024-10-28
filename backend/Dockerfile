# Use R base image
FROM r-base:latest

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libgit2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install R packages
RUN R -e "install.packages(c(\
    'plumber', \
    'dplyr', \
    'tidytext', \
    'tidyverse', \
    'jsonlite', \
    'rmarkdown', \
    'sentimentr', \
    'stringr', \
    'textdata' \
    ), repos='https://cran.rstudio.com/', dependencies=TRUE)"

# Pre-download AFINN lexicon without prompt
RUN R -e "options(textdata.download_prompt = FALSE); library(textdata); textdata::download_afinn()"

# Create app directory
WORKDIR /app

# Copy R files
COPY api.r /app/api.R
COPY run.R /app/run.R

# Expose the port
EXPOSE 8000

# Run the API
CMD ["Rscript", "run.R"]