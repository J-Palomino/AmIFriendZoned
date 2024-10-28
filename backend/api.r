# Required packages
library(plumber)
library(dplyr)
library(tidytext)
library(tidyverse)
library(jsonlite)
library(rmarkdown)
library(stringr)

#* @post /sentiment
function(req, res) {
  tryCatch({
    # Load AFINN lexicon directly from file
    data_dir <- file.path(rappdirs::user_data_dir("textdata"))
    afinn_file <- file.path(data_dir, "AFINN-111.txt")
    
    if (!file.exists(afinn_file)) {
      stop("AFINN lexicon not found. Please run setup.R first")
    }
    
      # Read and format AFINN lexicon
    afinn <- read.table(
      afinn_file,
      header = FALSE,
      col.names = c("word", "value"),
      stringsAsFactors = FALSE,
      sep = "\t"  # Specify tab separator
    )
    
    # Validate input
    if (is.null(req$body$text)) {
      res$status <- 400
      return(list(
        success = FALSE,
        error = "No text provided",
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

    # Get text from request
    input_text <- req$body$text
    doc_id <- req$body$document %||% 1
    
    # Create data frame from input
    df <- data.frame(
      document = doc_id,
      text = input_text,
      stringsAsFactors = FALSE
    )
    
    # Process the text data
    words_df <- df %>%
      mutate(text = as.character(text)) %>%
      unnest_tokens(word, text)
    
    # Perform word-level sentiment analysis
    sentiment_scores <- words_df %>%
      inner_join(afinn, by = "word") %>%
      group_by(document) %>%
      summarize(
        sentiment_score = mean(value),
        total_words = n(),
        positive_words = sum(value > 0),
        negative_words = sum(value < 0),
        neutral_words = sum(value == 0)
      )
    
    # Get sentence-level statistics
    sentences <- unlist(strsplit(input_text, "[.!?]+\\s*"))
    sentence_sentiments <- sapply(sentences, function(sentence) {
      words <- unlist(strsplit(tolower(sentence), "\\s+"))
      sentiment_words <- words[words %in% afinn$word]
      if(length(sentiment_words) == 0) return(0)
      mean(afinn$value[match(sentiment_words, afinn$word)])
    })
    
    # Calculate sentence-level metrics
    total_sentences <- length(sentences)
    positive_sentences <- sum(sentence_sentiments > 0)
    negative_sentences <- sum(sentence_sentiments < 0)
    neutral_sentences <- sum(sentence_sentiments == 0)
    
    # Calculate overall sentiment score (normalized to 0-1 range)
    normalized_score <- (sentiment_scores$sentiment_score + 5) / 10
    
    # Determine if romantic based on sentiment patterns
    is_romantic <- (
      normalized_score > 0.6 &&                      # High overall sentiment
      positive_sentences/total_sentences > 0.4 &&    # At least 40% positive sentences
      negative_sentences/total_sentences < 0.2       # Less than 20% negative sentences
    )
    
    # Format successful response
  result <- list(
      success = TRUE,  # Remove array wrapper
      data = list(
        isRomantic = as.logical(is_romantic)[1],  # Take first element
        score = as.numeric(normalized_score * 100)[1],  # Take first element
        stats = list(
          totalSentences = as.numeric(total_sentences)[1],
          positiveSentences = as.numeric(positive_sentences)[1],
          negativeSentences = as.numeric(negative_sentences)[1],
          neutralSentences = as.numeric(neutral_sentences)[1]
        )
      )
    )
    
      # Convert to JSON with auto_unbox=TRUE
    response <- toJSON(result, auto_unbox = TRUE)
    # Debug logging
    print("Analysis complete. Sending response:")
    print(jsonlite::toJSON(result, auto_unbox = TRUE, pretty = TRUE))
    
      return(fromJSON(response))
    
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