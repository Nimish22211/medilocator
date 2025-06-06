'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { searchBySymptoms } from "@/lib/firebase-service";

const commonSymptoms = [
  "Fever",
  "Headache",
  "Cold",
  "Cough",
  "Sore Throat",
  "Body Pain",
  "Stomach Pain",
  "Allergy"
];

export default function SymptomsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search when typing in search input
  useEffect(() => {
    const searchMedicines = async () => {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const searchResults = await searchBySymptoms([searchTerm.trim()]);
        setResults(searchResults);
      } catch (err) {
        setError("Failed to search medicines. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchMedicines, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Search when selecting common symptoms
  useEffect(() => {
    const searchMedicines = async () => {
      if (selectedSymptoms.length === 0) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const searchResults = await searchBySymptoms(selectedSymptoms);
        setResults(searchResults);
      } catch (err) {
        setError("Failed to search medicines. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    searchMedicines();
  }, [selectedSymptoms]);

  const handleSymptomClick = (symptom) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(symptom)) {
        return prev.filter(s => s !== symptom);
      }
      return [...prev, symptom];
    });
    setSearchTerm(""); // Clear search term when selecting common symptom
  };

  const handleRemoveSymptom = (symptomToRemove) => {
    setSelectedSymptoms(prev => prev.filter(symptom => symptom !== symptomToRemove));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Search by Symptoms</h1>

        {/* Search Input */}
        <div className="mb-6">
          <Input
            type="search"
            placeholder="Search symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
        </div>

        {/* Common Symptoms */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Common Symptoms</h2>
          <div className="flex flex-wrap gap-2">
            {commonSymptoms.map((symptom) => (
              <Button
                key={symptom}
                variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => handleSymptomClick(symptom)}
              >
                {symptom}
              </Button>
            ))}
          </div>
        </div>

        {/* Selected Symptoms */}
        {selectedSymptoms.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Selected Symptoms</h2>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((symptom) => (
                <div
                  key={symptom}
                  className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {symptom}
                  <button
                    className="hover:text-destructive"
                    onClick={() => handleRemoveSymptom(symptom)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-muted-foreground">
              Searching medicines...
            </div>
          ) : results.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {!loading && results.map((medicine) => (
                <div key={medicine.id} className="p-4 bg-white rounded-lg shadow">
                  <h3 className="font-semibold text-lg">{medicine.medicine_name}</h3>
                  <div className="mt-2 space-y-3">
                    {/* Location with subtle background */}
                    <div className="p-3 bg-primary/5 rounded-md">
                      <p className="text-base font-medium text-primary mb-1">Location</p>
                      <p className="text-base">
                        Almirah {medicine.location.almirah} → Row {medicine.location.row} → Box {medicine.location.box}
                      </p>
                    </div>

                    {/* Type and Price in a row */}
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <p className="text-base font-medium mb-1">Type</p>
                        <p className="text-base capitalize">{medicine.type}</p>
                      </div>
                      {medicine.price && (
                        <div>
                          <p className="text-base font-medium mb-1">Price</p>
                          <p className="text-base font-semibold text-primary">₹{parseFloat(medicine.price).toFixed(2)}</p>
                        </div>
                      )}
                    </div>

                    {/* Notes if available */}
                    {medicine.notes && (
                      <div>
                        <p className="text-base font-medium mb-1">Notes</p>
                        <p className="text-base text-muted-foreground">{medicine.notes}</p>
                      </div>
                    )}

                    {/* Symptoms if available */}
                    {medicine.symptoms && medicine.symptoms.length > 0 && (
                      <div>
                        <p className="text-base font-medium mb-2">Symptoms</p>
                        <div className="flex flex-wrap gap-2">
                          {medicine.symptoms.map((symptom) => (
                            <span
                              key={symptom}
                              className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full"
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
            </div>
          ) : searchTerm || selectedSymptoms.length > 0 ? (
            <div className="text-center text-muted-foreground">
              No medicines found matching your symptoms.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
} 