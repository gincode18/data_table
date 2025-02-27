import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { fetchGoogleSheetsData } from "@/lib/fetchGoogleSheets";
import { useVirtualizer } from '@tanstack/react-virtual';
import debounce from 'lodash.debounce';
import { CheckSquare, ChevronDown, ChevronUp, ChevronsUpDown, Copy, Download, Filter, Loader2, RefreshCw, Square, X } from 'lucide-react';
import Papa from 'papaparse';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface DataItem {
  Domain: string;
  "Niche 1": string;
  "Niche 2": string;
  Traffic: string;
  DR: string;
  DA: string;
  Language: string;
  Price: string;
  "Spam Score": string;
}

type FilterConfig = {
  [K in keyof DataItem]?: {
    value: string;
    operator: 'contains' | 'equals' | 'greater' | 'less';
  };
};

export default function DataTable() {
  const [data, setData] = useState<DataItem[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof DataItem>('Domain');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<FilterConfig>(() => {
    const saved = localStorage.getItem('tableFilters');
    return saved ? JSON.parse(saved) : {};
  });
  const [tempFilters, setTempFilters] = useState<FilterConfig>({});

  const { toast } = useToast();

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tableFilters', JSON.stringify(filters));
  }, [filters]);

  const loadData = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      if (forceRefresh) {
        setIsRefreshing(true);
        localStorage.removeItem('google_sheets_data');
      }
      const sheetsData = await fetchGoogleSheetsData();
      setData(sheetsData);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load data from Google Sheets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Initialize tempFilters with current filters
    setTempFilters(filters);
  }, []);

  //offline 
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch('/data.csv')
  //       const csvData = await response.text()
  //       const results = Papa.parse(csvData, { header: true, skipEmptyLines: true })
  //       setData(results.data as DataItem[])
  //       setIsLoading(false)
  //     } catch (error) {
  //       console.error('Error reading CSV file:', error)
  //       setIsLoading(false)
  //     }
  //   }

  //   fetchData()
  // }, [])

  const debouncedFilter = useCallback(
    debounce((value: string) => {
      setIsLoading(true);
      setFilterText(value);
      setTimeout(() => setIsLoading(false), 300);
    }, 300),
    []
  );

  const processedData = useMemo(() => {
    let filtered = data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(filterText.toLowerCase())
      )
    );

    filtered = filtered.filter(item => {
      return Object.entries(filters).every(([key, config]) => {
        if (!config) return true;
        const value = item[key as keyof DataItem];
        switch (config.operator) {
          case 'contains':
            return value.toLowerCase().includes(config.value.toLowerCase());
          case 'equals':
            return value.replace(/\$/g, '').toLowerCase() === config.value.replace(/\$/g, '').toLowerCase();
          case 'greater':
            return parseFloat(value.replace(/\$/g, '')) > parseFloat(config.value.replace(/\$/g, ''));
          case 'less':
            return parseFloat(value.replace(/\$/g, '')) < parseFloat(config.value.replace(/\$/g, ''));
          default:
            return true;
        }
      });
    });

    return [...filtered].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, filterText, sortColumn, sortDirection, filters]);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: processedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
    overscan: 5
  });

  const handleSort = (column: keyof DataItem) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: keyof DataItem) => {
    if (column === sortColumn) {
      return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
    }
    return <ChevronsUpDown className="w-4 h-4 opacity-0 group-hover:opacity-100" />;
  };

  const handleFilterChange = (column: keyof DataItem, value: string, operator: 'contains' | 'equals' | 'greater' | 'less') => {
    setTempFilters(prev => ({
      ...prev,
      [column]: { value, operator }
    }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setIsFilterDialogOpen(false);
    toast({
      title: "Filters Applied",
      description: "The table has been updated with your filters",
    });
  };

  const clearFilters = () => {
    setFilters({});
    setTempFilters({});
    localStorage.removeItem('tableFilters');
    setIsFilterDialogOpen(false);
    toast({
      title: "Filters Cleared",
      description: "All filters have been removed",
    });
  };

  const removeFilter = (column: keyof DataItem) => {
    const newFilters = { ...filters };
    delete newFilters[column];
    setFilters(newFilters);
    setTempFilters(newFilters);
  };

  const handleRowSelection = (index: number) => {
    setSelectedRows(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.length === processedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(processedData.map((_, index) => index));
    }
  };

  const copyRowsToClipboard = (indices: number[]) => {
    const rowsToCopy = indices.map(index => processedData[index]);
    const csvContent = Papa.unparse(rowsToCopy);
    navigator.clipboard.writeText(csvContent).then(() => {
      toast({
        title: "Copied 🎉",
        description: `${indices.length} row(s) copied to clipboard`,
      });
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const downloadCSV = () => {
    const rowsToDownload = selectedRows.map(index => processedData[index]);
    const csvContent = Papa.unparse(rowsToDownload);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'selected_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading data...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-auto flex-1 relative">
            <Input
              type="text"
              placeholder="Search all columns"
              onChange={(e) => debouncedFilter(e.target.value)}
              className="pr-8"
            />
            {isLoading && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="h-8"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
            <span className="text-sm text-muted-foreground">
              {processedData.length.toLocaleString()} items
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setIsFilterDialogOpen(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {Object.keys(filters).length > 0 && (
                <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                  {Object.keys(filters).length}
                </span>
              )}
            </Button>
          </div>
        </div>

        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Filter Data</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {Object.keys(data[0] || {}).map((column) => (
                <div key={column} className="space-y-2">
                  <Label htmlFor={column}>{column}</Label>
                  <div className="flex gap-2">
                    <select
                      className="h-9 rounded-md border border-input px-3 py-1 text-sm"
                      value={tempFilters[column as keyof DataItem]?.operator || 'contains'}
                      onChange={(e) => handleFilterChange(column as keyof DataItem, tempFilters[column as keyof DataItem]?.value || '', e.target.value as any)}
                    >
                      <option value="contains">Contains</option>
                      <option value="equals">Equals</option>
                      <option value="greater">Greater</option>
                      <option value="less">Less</option>
                    </select>
                    <Input
                      id={column}
                      placeholder={`Filter ${column}...`}
                      value={tempFilters[column as keyof DataItem]?.value || ''}
                      onChange={(e) => handleFilterChange(column as keyof DataItem, e.target.value, tempFilters[column as keyof DataItem]?.operator || 'contains')}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {Object.entries(filters).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(filters).map(([column, config]) => (
              <div key={column} className="flex items-center bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm">
                <span>{column}: {config?.operator} {config?.value}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-2"
                  onClick={() => removeFilter(column as keyof DataItem)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-md border overflow-hidden">
          <div className="w-full overflow-auto">
            <div className="border-b sticky top-0 bg-background z-10">
              <div className="grid grid-cols-[25px_2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] bg-muted/50">
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-auto p-1"
                  >
                    {selectedRows.length === processedData.length ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {Object.keys(data[0] || {}).map((key) => (
                  <div
                    key={key}
                    className="p-3 text-sm font-medium text-left cursor-pointer group hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort(key as keyof DataItem)}
                  >
                    <div className="flex items-center gap-1">
                      {key}
                      {getSortIcon(key as keyof DataItem)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              ref={parentRef}
              className="w-full overflow-auto"
              style={{ height: '600px' }}
            >
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative'
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const item = processedData[virtualRow.index];
                  const isSelected = selectedRows.includes(virtualRow.index);
                  return (
                    <ContextMenu key={virtualRow.index}>
                      <ContextMenuTrigger>
                        <div
                          className={`absolute top-0 left-0 w-full grid grid-cols-[25px_2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] transition-colors border-b ${isSelected ? 'bg-muted' : 'hover:bg-muted/50'}`}
                          style={{
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`
                          }}
                        >
                          <div className="p-2 flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRowSelection(virtualRow.index)}
                              className="h-auto p-1"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {Object.entries(item).map(([key, value]) => (
                            <Tooltip key={key}>
                              <TooltipTrigger asChild>
                                <div className="p-2 truncate">
                                  {value}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{value}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => copyRowsToClipboard([virtualRow.index])}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy row
                        </ContextMenuItem>
                        {selectedRows.length > 0 && (
                          <>
                            <ContextMenuItem onClick={() => copyRowsToClipboard(selectedRows)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy {selectedRows.length} selected row(s)
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => downloadCSV()}>
                              <Download className="mr-2 h-4 w-4" />
                              Download CSV {selectedRows.length} selected row(s)
                            </ContextMenuItem>
                          </>
                        )}
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-center">
          Scroll to load more rows
        </div>
      </div>
    </TooltipProvider>
  );
}