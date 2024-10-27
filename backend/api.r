# Required packages
library(plumber)
library(sentimentr)
library(stringr)
library(jsonlite)
#* @post /sentiment
function(req, res) {
  tryCatch({
    # Get the text from the request
    text <- req$body$text
    
    # Debug print
    print(paste("Received text:", text))
    
    # Clean the text
    text <- gsub("\\[|\\]|\\{|\\}|\\\"", "", text)
    text <- gsub("\\s+", " ", text)
    
    # Split into sentences and analyze
    sentences <- get_sentences(text)
    sentiment_scores <- sentiment(sentences)
    
    # Debug print
    print("Sentiment analysis complete")
    print(sentiment_scores)
    
    # Calculate metrics
    total_sentences <- nrow(sentiment_scores)
    positive_sentences <- sum(sentiment_scores$sentiment > 0)
    negative_sentences <- sum(sentiment_scores$sentiment < 0)
    neutral_sentences <- sum(sentiment_scores$sentiment == 0)
    avg_sentiment <- mean(sentiment_scores$sentiment)
    
    # Create response
    result <- list(
      romantic = avg_sentiment > 0.2,
      sentiment_score = avg_sentiment,
      details = list(
        total_sentences = total_sentences,
        positive_sentences = positive_sentences,
        negative_sentences = negative_sentences,
        neutral_sentences = neutral_sentences
      )
    )
    
    # Debug print
    print("Sending response:")
    print(result)
    
    return(result)
    
  }, error = function(e) {
    print(paste("Error:", e$message))
    print(paste("Stack:", e$call))
    res$status <- 400
    return(list(
      error = e$message,
      details = list(
        total_sentences = 0,
        positive_sentences = 0,
        negative_sentences = 0,
        neutral_sentences = 0
      )
    ))
  })
}