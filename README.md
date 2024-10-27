# Next.js Sentiment Analysis App

## Setup Instructions

1. **Install Dependencies:**   ```bash
   npm install   ```

2. **Run Development Server:**   ```bash
   npm run dev   ```

3. **Start Express Server:**   ```bash

   npm run server   ```

3.5 **INSTALL r dependencies:**   ```bash
Rscript -e 'install.packages(c("plumber", "sentimentr"), repos="https://cran.rstudio.com/")'

4. **Run R Backend:**   ```bash
   npm run r-backend   ```

5. **Environment Variables:**
   - Create a `.env.local` file for API keys and other secrets.

6. **Deployment:**
   - Deploy the Next.js app on Vercel.
   - Ensure the R backend is hosted on a server accessible by the Express server.

## Future Enhancements

- Add OCR processing using OpenAI API.
- Expand file upload options to include screenshots.
