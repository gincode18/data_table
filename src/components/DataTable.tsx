'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import debounce from 'lodash.debounce'
import Papa from 'papaparse'
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, ChevronsUpDown, Loader2 } from 'lucide-react'

interface DataItem {
  Domain: string
  "Niche 1": string
  "Niche 2": string
  Traffic: string
  DR: string
  DA: string
  Language: string
  Price: string
  "Spam Score": string
}

export default function DataTable() {
  const [data, setData] = useState<DataItem[]>([])
  const [sortColumn, setSortColumn] = useState<keyof DataItem>('Domain')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterText, setFilterText] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data.csv')
        const csvData = await response.text()
        const results = Papa.parse(csvData, { header: true, skipEmptyLines: true })
        setData(results.data as DataItem[])
        setIsLoading(false)
      } catch (error) {
        console.error('Error reading CSV file:', error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Debounced filter handler
  const debouncedFilter = useCallback(
    debounce((value: string) => {
      setIsLoading(true)
      setFilterText(value)
      setTimeout(() => setIsLoading(false), 300)
    }, 300),
    []
  )

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    const filtered = data.filter(item =>
      Object.values(item).some(value => 
        value.toLowerCase().includes(filterText.toLowerCase())
      )
    )

    return [...filtered].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [data, filterText, sortColumn, sortDirection])

  const parentRef = React.useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: processedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
    overscan: 5
  })

  const handleSort = (column: keyof DataItem) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (column: keyof DataItem) => {
    if (column === sortColumn) {
      return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
    }
    return <ChevronsUpDown className="w-4 h-4 opacity-0 group-hover:opacity-100" />
  }

  if (isLoading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading data...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm relative">
          <Input
            type="text"
            placeholder="Filter data"
            onChange={(e) => debouncedFilter(e.target.value)}
            className="pr-8"
          />
          {isLoading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {processedData.length.toLocaleString()} items
        </div>
      </div>

      <div className="rounded-md border">
        <div className="w-full">
          <div className="border-b">
            <div className="grid grid-cols-9 bg-muted/50">
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
                const item = processedData[virtualRow.index]
                return (
                  <div
                    key={virtualRow.index}
                    className="absolute top-0 left-0 w-full grid grid-cols-9 hover:bg-muted/50 transition-colors border-b"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`
                    }}
                  >
                    <div className="p-3 truncate">{item.Domain}</div>
                    <div className="p-3 truncate">{item["Niche 1"]}</div>
                    <div className="p-3 truncate">{item["Niche 2"]}</div>
                    <div className="p-3 truncate">{item.Traffic}</div>
                    <div className="p-3 truncate">{item.DR}</div>
                    <div className="p-3 truncate">{item.DA}</div>
                    <div className="p-3 truncate">{item.Language}</div>
                    <div className="p-3 truncate">{item.Price}</div>
                    <div className="p-3 truncate">{item["Spam Score"]}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground text-center">
        Scroll to load more rows
      </div>
    </div>
  )
}

