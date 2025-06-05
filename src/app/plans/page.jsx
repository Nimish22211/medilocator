'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ListOrdered } from "lucide-react";
import { getTreatmentPlans, searchTreatmentPlans } from "@/lib/firebase-service";

const commonPlans = [
  "Cold",
  "Pet Dard",
  "Fever",
  "Headache",
  "Stomach Pain",
  "Allergy"
];

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPlans = await getTreatmentPlans();
      setPlans(fetchedPlans);
    } catch (err) {
      setError("Failed to load treatment plans. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanClick = async (planName) => {
    setSelectedPlan(planName);
    setSearchTerm("");
    setLoading(true);
    setError(null);

    try {
      // Get all plans first
      const allPlans = await getTreatmentPlans();
      const searchTermLower = planName.toLowerCase();

      // Filter results to include either name OR symptom matches
      const matchingPlans = allPlans.filter(plan => {
        const planNameLower = plan.name.toLowerCase();

        // Check for name match
        const nameMatch = planNameLower === searchTermLower;

        // Check for symptom matches
        const symptomMatch = plan.symptoms.some(symptom =>
          symptom.toLowerCase() === searchTermLower
        );

        // Return true if either name OR symptom matches
        return nameMatch || symptomMatch;
      });

      if (matchingPlans.length > 0) {
        setPlans(matchingPlans);
      } else {
        setError(`No plan found matching "${planName}"`);
        setPlans([]);
      }
    } catch (err) {
      setError("Failed to fetch plan details. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadPlans();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const searchResults = await searchTreatmentPlans(searchTerm.toLowerCase());
      if (searchResults.length > 0) {
        // Filter results to include both name and symptom matches
        const matchingPlans = searchResults.filter(plan => {
          const planNameLower = plan.name.toLowerCase();
          const searchTermLower = searchTerm.toLowerCase();

          // Check for name match
          const nameMatch = planNameLower.includes(searchTermLower);

          // Check for symptom matches
          const symptomMatch = plan.symptoms.some(symptom =>
            symptom.toLowerCase().includes(searchTermLower)
          );

          return nameMatch || symptomMatch;
        });

        if (matchingPlans.length > 0) {
          setPlans(matchingPlans);
        } else {
          setError(`No plan found matching "${searchTerm}"`);
          setPlans([]);
        }
      } else {
        setError(`No plan found matching "${searchTerm}"`);
        setPlans([]);
      }
    } catch (err) {
      setError("Failed to search plans. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAllPlans = () => {
    setShowAllPlans(!showAllPlans);
    setSelectedPlan("");
    setSearchTerm("");
    if (!showAllPlans) {
      loadPlans();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Treatment Plans</h1>

        {/* Search and Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <Input
              type="search"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
          <Button
            variant={showAllPlans ? "default" : "outline"}
            onClick={handleShowAllPlans}
            className="w-full sm:w-auto"
          >
            <ListOrdered className="w-4 h-4 mr-2" />
            {showAllPlans ? "Show Common Plans" : "Show All Plans"}
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground">
            Loading treatment plans...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Common Plans */}
            {!showAllPlans && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Common Plans</h2>
                <div className="flex flex-wrap gap-2 max-w-full">
                  {commonPlans.map((plan) => (
                    <Button
                      key={plan}
                      variant={selectedPlan === plan ? "default" : "outline"}
                      size="sm"
                      className="rounded-full whitespace-nowrap"
                      onClick={() => handlePlanClick(plan)}
                    >
                      {plan}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Plans Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 bg-white rounded-lg shadow-sm border"
                >
                  <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium mb-1">Symptoms:</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.symptoms.map((symptom) => (
                          <span
                            key={symptom}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                    {plan.medicines && plan.medicines.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Medicines:</p>
                        <ul className="space-y-1">
                          {plan.medicines.map((medicine) => (
                            <li key={medicine.id} className="text-sm">
                              {medicine.name} ({medicine.type})
                              {medicine.notes && (
                                <span className="text-muted-foreground">
                                  {" "}- {medicine.notes}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 