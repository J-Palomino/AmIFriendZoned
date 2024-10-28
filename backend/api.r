# Required libraries
library(plumber)
library(dplyr)
library(tidytext)
library(tidyverse)
library(jsonlite)
library(stringr)

#* @post /sentiment
function(req, res) {
  tryCatch({
    # Debug raw request
    print("Raw request body:")
    print(req$body)
    
    # Validate text input
    if (is.null(req$body$text)) {
      print("No text found in request body")
      res$status <- 400
      return(list(
        success = FALSE,
        error = "No text provided in request",
        data = list(
          isRomantic = FALSE,
          score = 0,
          stats = list(
            totalSentences = 0,
            positiveSentences = 0,
            negativeSentences = 0,
            neutralSentences = 0
          )
        )
      ))
    }

    # Parse the JSON input
    messages <- jsonlite::fromJSON(req$body$text)
    
    print("Parsed messages:")
    print(messages)

    # Validate messages structure
    if (!is.data.frame(messages) && !is.list(messages)) {
      stop("Invalid messages format")
    }

    # Validate each message
    for (msg in messages) {
      if (!is.list(msg) || 
          is.null(msg$document) || 
          is.null(msg$text) ||
          !is.character(msg$document) || 
          !is.character(msg$text)) {
        stop("Each message must have 'document' and 'text' fields")
      }
    }

    # Parse the JSON input
    messages <- fromJSON(req$body$text)
    
    # Combine all texts into one data frame
    df <- data.frame(
      document = sapply(messages, function(x) x$document),
      text = sapply(messages, function(x) x$text),
      stringsAsFactors = FALSE
    )
    
    # Process the text data
    words_df <- df %>%
      unnest_tokens(word, text) %>%
      anti_join(stop_words, by = "word")
    
    # Perform sentiment analysis
    sentiment_scores <- words_df %>%
      inner_join(afinn, by = "word") %>%
      group_by(document) %>%
      summarize(sentiment_score = sum(value))
    
    # Split text into sentences and analyze each
    sentences <- unlist(strsplit(paste(df$text, collapse = " "), "[.!?]+\\s*"))
    sentence_sentiments <- sapply(sentences, function(sentence) {
      words <- unlist(strsplit(tolower(sentence), "\\W+"))
      words <- words[words != ""]
      sentiment <- sum(afinn$value[match(words, afinn$word)], na.rm = TRUE)
      return(sentiment)
    })
    
    # Calculate statistics
    total_sentences <- length(sentences)
    positive_sentences <- sum(sentence_sentiments > 0, na.rm = TRUE)
    negative_sentences <- sum(sentence_sentiments < 0, na.rm = TRUE)
    neutral_sentences <- sum(sentence_sentiments == 0, na.rm = TRUE)
    
    # Calculate overall sentiment score (normalized to 0-1 range)
    mean_sentiment <- mean(sentiment_scores$sentiment_score, na.rm = TRUE)
    normalized_score <- (mean_sentiment + 5) / 10  # Assuming scores range from -5 to 5
    
    # Determine if romantic based on sentiment patterns
    is_romantic <- (
      normalized_score > 0.6 &&                      # High overall sentiment
      positive_sentences/total_sentences > 0.4 &&    # At least 40% positive sentences
      negative_sentences/total_sentences < 0.2       # Less than 20% negative sentences
    )
    
    # Format successful response
    result <- list(
      success = TRUE,
      data = list(
        isRomantic = as.logical(is_romantic),
        score = as.numeric(normalized_score * 100),  # Convert to percentage
        stats = list(
          totalSentences = as.numeric(total_sentences),
          positiveSentences = as.numeric(positive_sentences),
          negativeSentences = as.numeric(negative_sentences),
          neutralSentences = as.numeric(neutral_sentences)
        )
      )
    )
    
    # Debug logging
    print("Analysis complete. Sending response:")
    print(jsonlite::toJSON(result, auto_unbox = TRUE, pretty = TRUE))
    
    return(result)
    
  }, error = function(e) {
    # Log the error
    print(paste("Error occurred:", e$message))
    print(paste("Call:", deparse(e$call)))
    print(paste("Traceback:", paste(capture.output(traceback()), collapse = "\n")))
    
    # Send error response
    res$status <- 500
    return(list(
      success = FALSE,
      error = "Error processing text",
      data = list(
        isRomantic = FALSE,
        score = 0,
        stats = list(
          totalSentences = 0,
          positiveSentences = 0,
          negativeSentences = 0,
          neutralSentences = 0
        )
      )
    ))
  })
}