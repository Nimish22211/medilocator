'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { searchMedicines } from "@/lib/firebase-service";

const alphabet = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounce search to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else if (selectedLetter) {
        handleLetterSearch(selectedLetter);
      } else {
        setResults([]);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm, selectedLetter]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const searchResults = await searchMedicines(searchTerm);
      setResults(searchResults);
    } catch (err) {
      setError("Failed to search medicines. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLetterSearch = async (letter) => {
    setLoading(true);
    setError(null);
    try {
      const searchResults = await searchMedicines(letter);
      setResults(searchResults);
    } catch (err) {
      setError("Failed to search medicines. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter === selectedLetter ? null : letter);
    setSearchTerm(""); // Clear search term when selecting a letter
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Search Medicine</h1>
        
        {/* Alphabet filter */}
        <div className="mb-6">
          <h2 className="text-sm font-medium mb-2 text-muted-foreground">Filter by first letter</h2>
          <div className="flex flex-wrap gap-1">
            {alphabet.map((letter) => (
              <Button
                key={letter}
                variant={selectedLetter === letter ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => handleLetterClick(letter)}
              >
                {letter}
              </Button>
            ))}
          </div>
        </div>

        {/* Search input */}
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2">
          <Input
            type="search"
            placeholder="Enter medicine name..."
            className="flex-1"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedLetter(null); // Clear selected letter when typing
            }}
          />
          <Button type="submit" disabled={loading || !searchTerm.trim()}>
            <Search className="w-4 h-4 mr-2" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="mt-8 space-y-4">
          {loading && (
            <div className="text-center text-muted-foreground">
              Searching medicines...
            </div>
          )}
          {!loading && results.map((medicine) => (
            <div key={medicine.id} className="p-4 bg-white rounded-lg shadow">
              <h3 className="font-semibold text-lg">{medicine.medicine_name}</h3>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Location:</span>{" "}
                  Almirah {medicine.location.almirah} → Row {medicine.location.row} → Box {medicine.location.box}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Type:</span> {medicine.type}
                </p>
                {medicine.notes && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Notes:</span> {medicine.notes}
                  </p>
                )}
                {medicine.symptoms && medicine.symptoms.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Symptoms:</p>
                    <div className="flex flex-wrap gap-1">
                      {medicine.symptoms.map((symptom) => (
                        <span
                          key={symptom}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {!loading && results.length === 0 && (searchTerm || selectedLetter) && (
            <div className="text-center text-muted-foreground">
              {searchTerm 
                ? `No medicines found matching "${searchTerm}"`
                : `No medicines found starting with "${selectedLetter}"`
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 