# Create necessary directories
data_dir <- file.path(rappdirs::user_data_dir("textdata"))
dir.create(data_dir, showWarnings = FALSE, recursive = TRUE)

# Create agreement file
writeLines("TRUE", file.path(data_dir, "textdata_agreement.txt"))

# Download AFINN directly
afinn_url <- "https://raw.githubusercontent.com/fnielsen/afinn/master/afinn/data/AFINN-111.txt"
afinn_file <- file.path(data_dir, "AFINN-111.txt")

if (!file.exists(afinn_file)) {
  # Download to a temporary file
  temp_file <- tempfile()
  download.file(afinn_url, temp_file, method = "auto")
  
  # Read and clean the data
  lines <- readLines(temp_file)
  cleaned_lines <- sapply(lines, function(line) {
    parts <- strsplit(trimws(line), "\t")[[1]]
    if(length(parts) == 2) {
      paste(parts[1], parts[2], sep="\t")
    }
  })
  
  # Write cleaned data
  cleaned_lines <- cleaned_lines[!sapply(cleaned_lines, is.null)]
  writeLines(cleaned_lines, afinn_file)
  
  # Remove temporary file
  unlink(temp_file)
}

# Verify the file
tryCatch({
  test_read <- read.table(
    afinn_file,
    header = FALSE,
    col.names = c("word", "value"),
    stringsAsFactors = FALSE,
    sep = "\t"
  )
  print("AFINN lexicon downloaded and verified successfully!")
}, error = function(e) {
  stop("Failed to verify AFINN lexicon: ", e$message)
})