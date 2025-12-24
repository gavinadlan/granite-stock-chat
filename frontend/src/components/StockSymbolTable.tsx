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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>US Stock Symbols</span>
          <Badge variant="secondary">{filteredStocks.length} stocks</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by symbol or company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sector Filters */}
        {sectors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSector === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSector(null)}
            >
              All Sectors
            </Button>
            {sectors.map((sector) => (
              <Button
                key={sector}
                variant={selectedSector === sector ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSector(sector || null)}
              >
                {sector}
              </Button>
            ))}
            {(searchQuery || selectedSector) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block border rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-100 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b">
                    Symbol
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b">
                    Company Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b">
                    Sector
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 border-b w-24">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No stocks found. Try a different search term.
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stock) => (
                    <tr
                      key={stock.symbol}
                      className="border-b hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900">{stock.symbol}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{stock.companyName}</td>
                      <td className="px-4 py-3">
                        {stock.sector && (
                          <Badge variant="outline" className="text-xs">
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
                            className="h-8"
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
        <div className="md:hidden space-y-3 max-h-[500px] overflow-y-auto">
          {filteredStocks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No stocks found. Try a different search term.
            </div>
          ) : (
            filteredStocks.map((stock) => (
              <div
                key={stock.symbol}
                className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900 text-lg">{stock.symbol}</span>
                      {stock.sector && (
                        <Badge variant="outline" className="text-xs">
                          {stock.sector}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{stock.companyName}</p>
                  </div>
                </div>
                {onSelectSymbol && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSymbolClick(stock.symbol)}
                    className="w-full mt-3"
                  >
                    Select
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground text-center">
          Click on a symbol or use the search to find US stocks. Total: {US_STOCKS.length} stocks available.
        </p>
      </CardContent>
    </Card>
  );
}

