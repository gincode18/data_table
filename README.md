# Interactive Data Table

## Overview

A high-performance, interactive data table built with React and TypeScript. Designed to efficiently handle and display large datasets (36,000+ rows) with advanced features like virtualized scrolling, real-time filtering, and multi-column sorting.

## 🎥 Live Demo

- [Live Application](https://your-demo-url.vercel.app)
- Demo Credentials:
  - Username: `demo`
  - Password: `demo`



## Video Demo

[https://youtu.be/qKoCsVzLUaU](https://youtu.be/qKoCsVzLUaU)

Watch the video demo to see the chatbot in action and learn how to integrate it into your online store.

---

## Screenshots

### Login
![Login](https://github.com/user-attachments/assets/9adaec12-7979-4ca8-a0a8-7323b7f13343)  
*Initial Login page*

### Data Table
![DataTable](https://github.com/user-attachments/assets/924be4da-5844-4077-8eef-3a9d82692f39)  
*Data Table with 36000 rows*

### Filter Table 
![Filter Table](https://github.com/user-attachments/assets/05b0a860-20bd-4013-b130-1ae1bba40124)  
*Table to apply Filters*

### Right Click
![Right Click](https://github.com/user-attachments/assets/0720e5d3-3139-4fb9-aed5-eed65e2c2c86)  
*Right Click to Download and Copy rows*

---

## ✨ Key Features

- **Authentication System**
  - Secure login with demo credentials
  - Protected routes
  - Session management

- **Advanced Data Handling**
  - Multi-column sorting
  - Real-time filtering across all columns
  - Bulk row selection
  - CSV export functionality
  - Context menu for row actions

- **Performance Optimizations**
  - Virtualized scrolling using `@tanstack/react-virtual`
  - Debounced search to minimize re-renders
  - Memoized data processing
  - Efficient state management
  - Dynamic row height calculations

## 🚀 Performance Optimizations

### 1. Virtualized Rendering
```typescript
const rowVirtualizer = useVirtualizer({
  count: processedData.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 45,
  overscan: 5
});
```
Only renders visible rows, drastically reducing DOM nodes and memory usage.

### 2. Debounced Search
```typescript
const debouncedFilter = useCallback(
  debounce((value: string) => {
    setFilterText(value);
  }, 300),
  []
);
```
Prevents excessive re-renders during user input.

### 3. Memoized Data Processing
```typescript
const processedData = useMemo(() => {
  // Data filtering and sorting logic
}, [data, filterText, sortColumn, sortDirection, filters]);
```
Caches processed data to avoid unnecessary recalculations.

### 4. Efficient DOM Updates
- Uses CSS transforms for smooth scrolling
- Implements efficient row selection
- Optimized re-render cycles

## 🛠 Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- @tanstack/react-virtual
- Papa Parse
- Lucide React icons

## 📊 Performance Metrics

- Initial load time: ~300ms
- Memory usage: ~50MB with 36k rows
- Smooth scrolling at 60fps
- Search response: <100ms

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/data-table.git
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## 🌐 Deployment

The application is deployed on Vercel with the following configuration:

- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_GOOGLE_SHEETS_API_KEY`

## 📱 Responsive Design

- Adapts to various screen sizes
- Mobile-friendly interface
- Touch-optimized interactions

## 🎯 Future Improvements

- [ ] Column resizing and reordering
- [ ] Advanced export options (Excel, PDF)
- [ ] Saved user preferences
- [ ] Enhanced accessibility features
- [ ] Real-time data updates
- [ ] Advanced filtering UI

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.