# Interactive Data Table

## Overview

This project is a high-performance, interactive data table built with React and Next.js. It's designed to efficiently handle and display large datasets (up to 36,000 rows) with features like sorting, filtering, and virtualized scrolling. The table is optimized for performance and user experience, making it ideal for applications that need to display and interact with substantial amounts of tabular data.

## Features

- Display large datasets (tested with 36,000 rows)
- Fast and responsive UI
- Sort data by clicking on column headers
- Filter data across all columns in real-time
- Virtualized scrolling for optimal performance
- Responsive design for various screen sizes
- Secure login system
- CSV data import

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- tanstack/react-virtual for virtualization
- Papa Parse for CSV parsing
- Lucide React for icons

## Installation

1. Clone the repository:


## Deployment to Vercel

1. Ensure your CSV file is in the `public` folder of your project.

2. Push your code to a GitHub repository.

3. Log in to your Vercel account and click "New Project".

4. Import your GitHub repository.

5. In the "Build and Output Settings" section:
   - Build Command: `npm run build` (or `yarn build` if you're using Yarn)
   - Output Directory: `dist` (this is the default output directory for Vite)

6. Click "Deploy" and wait for the deployment to complete.

Your application should now be live with the CSV file accessible.

Note: If you make changes to your CSV file, you'll need to redeploy your application for the changes to take effect in the production environment.

