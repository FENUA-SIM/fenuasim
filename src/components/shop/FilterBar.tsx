import { Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

interface FilterBarProps {
  onSearch: (query: string) => void
  onFilterChange: (filters: FilterOptions) => void
}

interface FilterOptions {
  sortBy: 'price' | 'data' | 'duration'
  order: 'asc' | 'desc'
}

export default function FilterBar({ onSearch, onFilterChange }: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'price',
    order: 'asc'
  })

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(query)
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fenua-purple" />
          <input
            type="text"
            placeholder="Rechercher une destination..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border-2 border-fenua-purple rounded-lg focus:outline-none focus:ring-2 focus:ring-fenua-coral"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="text-fenua-purple" />
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value as FilterOptions['sortBy'] })}
            className="border-2 border-fenua-purple rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fenua-coral"
          >
            <option value="price">Prix</option>
            <option value="data">Données</option>
            <option value="duration">Durée</option>
          </select>

          <select
            value={filters.order}
            onChange={(e) => handleFilterChange({ ...filters, order: e.target.value as FilterOptions['order'] })}
            className="border-2 border-fenua-purple rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fenua-coral"
          >
            <option value="asc">Croissant</option>
            <option value="desc">Décroissant</option>
          </select>
        </div>
      </div>
    </div>
  )
} 