// components/products/ProductFilter.tsx
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppSelector } from '@/redux/hooks'
import { selectProducts } from '@/redux/selectors/productsSelectors'

interface ProductFilterProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    category: string
    priceRange: [number, number]
    sizes: string[]
    colors: string[]
    rating: number
    inStock: boolean
  }
  onFilterChange: (filters: any) => void
  productCounts?: {
    categories: Record<string, number>
    sizes: Record<string, number>
    colors: Record<string, number>
  }
}

const ProductFilter = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFilterChange,
  productCounts 
}: ProductFilterProps) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    size: true,
    color: true,
    rating: true,
    availability: true
  })

  const products = useAppSelector(selectProducts);

    const categories = useMemo(() => {
      const categorySet = new Set(products.map((p) => p.category).filter(Boolean));
      return Array.from(categorySet).map((name) => ({ id: name.toLowerCase(), name }));
    }, [products]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleCategoryChange = (category: string) => {
    onFilterChange({
      ...filters,
      category: filters.category === category ? '' : category
    })
  }

  const handleSizeToggle = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter(s => s !== size)
      : [...filters.sizes, size]
    
    onFilterChange({
      ...filters,
      sizes: newSizes
    })
  }

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color]
    
    onFilterChange({
      ...filters,
      colors: newColors
    })
  }

  const handlePriceChange = (min: number, max: number) => {
    onFilterChange({
      ...filters,
      priceRange: [min, max] as [number, number]
    })
  }

  const handleRatingChange = (rating: number) => {
    onFilterChange({
      ...filters,
      rating: filters.rating === rating ? 0 : rating
    })
  }

  const clearAllFilters = () => {
    onFilterChange({
      category: '',
      priceRange: [0, 1000000] as [number, number],
      sizes: [],
      colors: [],
      rating: 0,
      inStock: false
    })
  }

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', 'One Size']
  const colors = ['Black', 'White', 'Navy', 'Grey', 'Brown', 'Beige', 'Red', 'Blue', 'Green']
  const priceRanges = [
    { label: 'Under ₦50,000', min: 0, max: 50000 },
    { label: '₦50,000 - ₦100,000', min: 50000, max: 100000 },
    { label: '₦100,000 - ₦200,000', min: 100000, max: 200000 },
    { label: '₦200,000 - ₦500,000', min: 200000, max: 500000 },
    { label: 'Over ₦500,000', min: 500000, max: 1000000 }
  ]

  const FilterSection = ({ 
    title, 
    isExpanded, 
    onToggle, 
    children 
  }: { 
    title: string
    isExpanded: boolean
    onToggle: () => void
    children: React.ReactNode 
  }) => (
    <div className="border-b border-neutral-200 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-sm font-medium text-neutral-900">{title}</h3>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-neutral-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />

          {/* Filter Panel */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="lg:relative lg:translate-x-0 fixed top-0 left-0 z-50 w-80 h-full bg-white shadow-xl lg:shadow-none overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-serif font-semibold">Filters</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={onClose}
                    className="lg:hidden p-1 hover:bg-neutral-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Categories */}
              <FilterSection
                title="Category"
                isExpanded={expandedSections.category}
                onToggle={() => toggleSection('category')}
              >
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`block w-full text-left text-sm py-1 ${
                      !filters.category ? 'font-medium text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category:any) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.name)}
                      className={`block w-full text-left text-sm py-1 ${
                        filters.category === category.name 
                          ? 'font-medium text-neutral-900' 
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {category.name}
                      {productCounts?.categories[category.name] && (
                        <span className="text-neutral-400 ml-1">
                          ({productCounts.categories[category.name]})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Price Range */}
              <FilterSection
                title="Price Range"
                isExpanded={expandedSections.price}
                onToggle={() => toggleSection('price')}
              >
                <div className="space-y-2">
                  {priceRanges.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => handlePriceChange(range.min, range.max)}
                      className={`block w-full text-left text-sm py-1 ${
                        filters.priceRange[0] === range.min && filters.priceRange[1] === range.max
                          ? 'font-medium text-neutral-900'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Sizes */}
              <FilterSection
                title="Size"
                isExpanded={expandedSections.size}
                onToggle={() => toggleSection('size')}
              >
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`py-2 px-3 text-sm border rounded-md transition-colors ${
                        filters.sizes.includes(size)
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Colors */}
              <FilterSection
                title="Color"
                isExpanded={expandedSections.color}
                onToggle={() => toggleSection('color')}
              >
                <div className="grid grid-cols-2 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorToggle(color)}
                      className={`py-2 px-3 text-sm border rounded-md transition-colors text-left ${
                        filters.colors.includes(color)
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Rating */}
              <FilterSection
                title="Customer Rating"
                isExpanded={expandedSections.rating}
                onToggle={() => toggleSection('rating')}
              >
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange(rating)}
                      className={`flex items-center w-full text-left text-sm py-1 ${
                        filters.rating === rating 
                          ? 'font-medium text-neutral-900' 
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <div className="flex items-center mr-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3 h-3 ${
                              i < rating ? 'text-yellow-400 fill-current' : 'text-neutral-300'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      {rating} stars & up
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Availability */}
              <FilterSection
                title="Availability"
                isExpanded={expandedSections.availability}
                onToggle={() => toggleSection('availability')}
              >
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => onFilterChange({ ...filters, inStock: e.target.checked })}
                    className="h-4 w-4 text-neutral-600 focus:ring-neutral-500 border-neutral-300 rounded"
                  />
                  <span className="ml-2 text-sm text-neutral-700">In stock only</span>
                </label>
              </FilterSection>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ProductFilter
