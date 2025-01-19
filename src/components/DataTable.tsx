import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

interface DataItem {
  Domain: string
  Niche1: string
  Niche2: string
  Traffic: string
  DR: string
  DA: string
  Language: string
  Price: string
  SpamScore: string
}

const ITEMS_PER_PAGE = 10

const sampleData: DataItem[] = [
  { Domain: 'zzoomit.com', Niche1: 'Business', Niche2: 'General', Traffic: '164', DR: '50', DA: '61', Language: 'English', Price: '$19.95', SpamScore: '9%' },
  { Domain: 'zzatem.com', Niche1: 'All', Niche2: 'Niches', Traffic: '10,775', DR: '38', DA: '28', Language: 'English', Price: '$39.90', SpamScore: '9%' },
  { Domain: 'zyynor.com', Niche1: 'Business', Niche2: 'General', Traffic: 'Not provided', DR: '43', DA: '31', Language: 'English', Price: '$19.95', SpamScore: '1%' },
  { Domain: 'zywaz.com', Niche1: 'Business', Niche2: 'Finance', Traffic: 'Not provided', DR: '61', DA: '36', Language: 'English', Price: '$19.95', SpamScore: '1%' },
  { Domain: 'zyusepedia.com', Niche1: 'Technology', Niche2: '', Traffic: '172', DR: '19', DA: '37', Language: 'English', Price: '$19.95', SpamScore: '1%' },
  { Domain: 'zysp-jj.com', Niche1: 'All', Niche2: 'Niches', Traffic: 'Not provided', DR: '45', DA: '54', Language: 'English', Price: '$19.95', SpamScore: '8%' },
  { Domain: 'zyotto.com', Niche1: 'General', Niche2: '', Traffic: 'Not provided', DR: '42', DA: '62', Language: 'English', Price: '$179.55', SpamScore: '3%' },
  { Domain: 'zynrewards.co.uk', Niche1: 'Business', Niche2: 'Health', Traffic: '181', DR: '19', DA: '37', Language: 'English', Price: '$19.95', SpamScore: '4%' },
  { Domain: 'zyne.fr', Niche1: 'Business', Niche2: 'General', Traffic: '770', DR: '31', DA: '20', Language: 'French', Price: '$139.65', SpamScore: '1%' },
  { Domain: 'zylantex.com', Niche1: 'All', Niche2: 'Niches', Traffic: 'Not provided', DR: '28', DA: '64', Language: 'English', Price: '$19.95', SpamScore: '4%' },
  { Domain: 'zyczenia-urodzinowe', Niche1: 'Fashion', Niche2: 'For', Traffic: 'Not provided', DR: '28', DA: '64', Language: 'English', Price: '$19.95', SpamScore: '4%' },
  { Domain: 'zyciepw.pl', Niche1: 'Culture', Niche2: 'Entertainment', Traffic: '29,651', DR: '39', DA: '35', Language: 'Polish', Price: '$442.89', SpamScore: '1%' },
  { Domain: 'zxq.net', Niche1: 'Business', Niche2: 'Entertainment', Traffic: 'Not provided', DR: '68', DA: '71', Language: 'English', Price: '$139.65', SpamScore: '3%' },
  { Domain: 'zwnews.com', Niche1: 'Business', Niche2: 'News', Traffic: '6,772', DR: '49', DA: '52', Language: 'English', Price: '$19.95', SpamScore: '16%' },
  { Domain: 'zwicky.de', Niche1: 'Sports', Niche2: 'Travelling', Traffic: 'Not provided', DR: '33', DA: '54', Language: 'German', Price: '$59.85', SpamScore: '5%' }
]

export default function DataTable() {
  const [data] = useState<DataItem[]>(sampleData)
  const [sortColumn, setSortColumn] = useState<keyof DataItem>('Domain')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterText, setFilterText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

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

  const filteredData = data.filter(item =>
    item.Domain.toLowerCase().includes(filterText.toLowerCase())
  )

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedData = sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Input
        type="text"
        placeholder="Filter by Domain Name"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Object.keys(data[0] || {}).map((key) => (
                <TableHead
                  key={key}
                  className="group cursor-pointer"
                  onClick={() => handleSort(key as keyof DataItem)}
                >
                  <div className="flex items-center gap-1">
                    {key}
                    {getSortIcon(key as keyof DataItem)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.Domain}</TableCell>
                <TableCell>{item.Niche1}</TableCell>
                <TableCell>{item.Niche2}</TableCell>
                <TableCell>{item.Traffic}</TableCell>
                <TableCell>{item.DR}</TableCell>
                <TableCell>{item.DA}</TableCell>
                <TableCell>{item.Language}</TableCell>
                <TableCell>{item.Price}</TableCell>
                <TableCell>{item.SpamScore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded border disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded border disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

