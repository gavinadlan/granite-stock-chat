import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { US_STOCKS, searchUSStocks } from '@/lib/usStocks';
import { Button } from '@/components/ui/button';

interface StockSymbolTableProps {
  onSelectSymbol?: (symbol: string) => void;
}

export function StockSymbolTable({ onSelectSymbol }: StockSymbolTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Get unique sectors
  const sectors = useMemo(() => {
    const uniqueSectors = new Set(US_STOCKS.map(stock => stock.sector).filter(Boolean));
    return Array.from(uniqueSectors).sort();
  }, []);

  // Filter stocks based on search and sector
  const filteredStocks = useMemo(() => {
    let stocks = searchQuery ? searchUSStocks(searchQuery) : US_STOCKS;
    
    if (selectedSector) {
      stocks = stocks.filter(stock => stock.sector === selectedSector);
    }
    
    return stocks;
  }, [searchQuery, selectedSector]);

  const handleSymbolClick = (symbol: string) => {
    if (onSelectSymbol) {
      onSelectSymbol(symbol);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSector(null);
  };

  return (
    <Card className="w-full dark:bg-slate-800 dark:border-slate-700">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm sm:text-base dark:text-white">US Stock Symbols</span>
          <Badge variant="secondary" className="text-[10px] sm:text-xs dark:bg-slate-700 dark:text-slate-200">{filteredStocks.length} stocks</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by symbol or company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 sm:pl-10 pr-8 sm:pr-10 text-sm sm:text-base h-9 sm:h-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          )}
        </div>

        {/* Sector Filters */}
        {sectors.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Button
              variant={selectedSector === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSector(null)}
              className="text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
            >
              All Sectors
            </Button>
            {sectors.map((sector) => (
              <Button
                key={sector}
                variant={selectedSector === sector ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSector(sector || null)}
                className="text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
              >
                {sector}
              </Button>
            ))}
            {(searchQuery || selectedSector) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
              >
                Clear
              </Button>
            )}
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block border dark:border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-100 border-b dark:border-slate-600">
                    Symbol
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-100 border-b dark:border-slate-600">
                    Company Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-100 border-b dark:border-slate-600">
                    Sector
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-100 border-b dark:border-slate-600 w-24">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground dark:text-slate-400 text-sm">
                      No stocks found. Try a different search term.
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stock) => (
                    <tr
                      key={stock.symbol}
                      className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm">{stock.symbol}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200 text-sm">{stock.companyName}</td>
                      <td className="px-4 py-3">
                        {stock.sector && (
                          <Badge variant="outline" className="text-xs dark:border-slate-600 dark:text-slate-200">
                            {stock.sector}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {onSelectSymbol && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSymbolClick(stock.symbol)}
                            className="h-8 text-xs dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            Select
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
          {filteredStocks.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground dark:text-slate-400 text-xs sm:text-sm">
              No stocks found. Try a different search term.
            </div>
          ) : (
            filteredStocks.map((stock) => (
              <div
                key={stock.symbol}
                className="border dark:border-slate-700 rounded-lg p-3 sm:p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg">{stock.symbol}</span>
                      {stock.sector && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs dark:border-slate-600 dark:text-slate-200">
                          {stock.sector}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 break-words">{stock.companyName}</p>
                  </div>
                </div>
                {onSelectSymbol && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSymbolClick(stock.symbol)}
                    className="w-full mt-2 sm:mt-3 text-xs sm:text-sm h-8 sm:h-9 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Select
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Info */}
        <p className="text-[10px] sm:text-xs text-muted-foreground dark:text-slate-400 text-center pt-2">
          Click on a symbol or use the search to find US stocks. Total: {US_STOCKS.length} stocks available.
        </p>
      </CardContent>
    </Card>
  );
}

