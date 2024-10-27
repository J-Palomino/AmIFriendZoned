library(sentimentr)  # Make sure this is at the top
library(jsonlite)

#* @post /sentiment
function(req, res) {
  print("Received request body:")
  print(str(req$body))
  
  tryCatch({
    # Parse the JSON if it's a string, otherwise use the body directly
    if (is.character(req$body$text)) {
      # Remove any BOM characters and parse JSON
      clean_text <- gsub("^\xEF\xBB\xBF", "", req$body$text)
      parsed_data <- fromJSON(clean_text)
    } else {
      parsed_data <- req$body
    }
    
    print("Parsed data:")
    print(str(parsed_data))
    
    # If we have a data frame, convert it to text for sentiment analysis
    if (is.data.frame(parsed_data)) {
      text_to_analyze <- parsed_data$text
      doc_id <- parsed_data$document
    } else {
      # Handle single text case
      text_to_analyze <- req$body$text
      doc_id <- req$body$document
    }
    
    print("Text to analyze:")
    print(text_to_analyze)
    
    # Perform sentiment analysis
    sentiment_scores <- sentiment(text_to_analyze)
    
    print("Sentiment scores:")
    print(sentiment_scores)
    
    # Create response
    result <- list(
      document = doc_id,
      romantic = mean(sentiment_scores$sentiment) > 0.5,
      sentiment_score = mean(sentiment_scores$sentiment)
    )
    
    return(result)
    
  }, error = function(e) {
    print(paste("Error:", e$message))
    print(paste("Error call:", e$call))
    res$status <- 400
    return(list(error = e$message))
  })
}