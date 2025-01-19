export async function fetchGoogleSheetsData() {
    const SHEET_ID = '1vwc803C8MwWBMc7ntCre3zJ5xZtG881HKkxlIrwwxNs';
    const SHEET_NAME = 'Sheet1'; // Adjust if needed
    const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY; // Add this to your .env file
  
    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
  
      const data = await response.json();
      const [headers, ...rows] = data.values;
      
      return rows.map((row: any[]) => 
        headers.reduce((obj: any, header: string, index: number) => {
          obj[header] = row[index] || '';
          return obj;
        }, {})
      );
    } catch (error) {
      console.error('Error fetching Google Sheets data:', error);
      throw error;
    }
  }