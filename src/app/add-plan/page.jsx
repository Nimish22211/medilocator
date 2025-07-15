'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, X } from "lucide-react";
import { addTreatmentPlan, searchMedicines, addMedicine } from "@/lib/firebase-service";

// Add a helper function at the top (after imports)
function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function AddPlanPage() {
  const [planName, setPlanName] = useState("");
  const [symptoms, setSymptoms] = useState([""]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [totalPrice, setTotalPrice] = useState("");
  const [planNotes, setPlanNotes] = useState("");

  // Medicine search states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showCustomMedicine, setShowCustomMedicine] = useState(false);
  const [customMedicine, setCustomMedicine] = useState({
    medicine_name: "",
    type: "",
    notes: "",
    location: {
      almirah: "",
      door: "",
      row: ""
    }
  });

  // Debounced medicine search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.trim()) {
        setSearchLoading(true);
        try {
          const results = await searchMedicines(searchTerm);
          setSearchResults(results);
        } catch (err) {
          console.error('Error searching medicines:', err);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAddSymptom = () => {
    setSymptoms([...symptoms, ""]);
  };

  const handleSymptomChange = (index, value) => {
    const newSymptoms = [...symptoms];
    newSymptoms[index] = value;
    setSymptoms(newSymptoms);
  };

  const handleRemoveSymptom = (index) => {
    const newSymptoms = symptoms.filter((_, i) => i !== index);
    setSymptoms(newSymptoms);
  };

  const handleAddMedicine = (medicine) => {
    if (!medicines.some(m => m.id === medicine.id)) {
      setMedicines([...medicines, medicine]);
    }
    setSearchTerm("");
    setSearchResults([]);
    setShowCustomMedicine(false);
  };

  const handleRemoveMedicine = (medicineId) => {
    setMedicines(medicines.filter(m => m.id !== medicineId));
  };

  const handleCustomMedicineChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCustomMedicine(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCustomMedicine(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddCustomMedicine = async () => {
    if (!customMedicine.medicine_name.trim()) return;

    setLoading(true);
    setError(null);
    try {
      // First, add the custom medicine to Firebase
      const newMedicine = {
        medicine_name: customMedicine.medicine_name,
        type: customMedicine.type,
        notes: customMedicine.notes,
        almirah: customMedicine.location.almirah,
        door: customMedicine.location.door,
        row: customMedicine.location.row,
        symptoms: symptoms.filter(s => s.trim() !== "")
      };

      const addedMedicine = await addMedicine(newMedicine);

      // Add the medicine to the local state with the Firebase ID
      setMedicines([...medicines, addedMedicine]);

      // Reset the form
      setCustomMedicine({
        medicine_name: "",
        type: "",
        notes: "",
        location: {
          almirah: "",
          door: "",
          row: ""
        }
      });
      setShowCustomMedicine(false);
    } catch (err) {
      setError("Failed to add custom medicine. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!planName.trim() || medicines.length === 0) {
      setError("Please provide a plan name and at least one medicine.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const planData = {
        name: planName.trim(),
        notes: planNotes,
        symptoms: symptoms.filter(s => s.trim() !== ""),
        medicines: medicines.map(m => ({
          id: m.id,
          medicine_name: m.medicine_name,
          type: m.type,
          notes: m.notes,
          price: parseFloat(m.price) || 0,
          location: m.location
        })),
        total_price: parseFloat(totalPrice) || 0,
        created_at: new Date().toISOString()
      };

      console.log('Submitting plan data:', planData); // Debug log
      const result = await addTreatmentPlan(planData);
      console.log('Plan added successfully:', result); // Debug log

      setSuccess(true);
      setPlanName("");
      setPlanNotes("");
      setSymptoms([""]);
      setMedicines([]);
      setSearchTerm("");
      setSearchResults([]);
      setTotalPrice("");
    } catch (err) {
      console.error('Error adding treatment plan:', err);
      setError(err.message || "Failed to add treatment plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add Treatment Plan</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plan Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Plan Name</label>
            <Input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Enter plan name"
              required
            />
          </div>

          {/* Plan Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Plan Notes</label>
            <Input
              value={planNotes}
              onChange={(e) => setPlanNotes(e.target.value)}
              placeholder="Enter notes for this plan (optional)"
            />
          </div>

          {/* Total Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Total Price</label>
            <Input
              type="number"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              placeholder="Enter total price"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium mb-2">Symptoms</label>
            <div className="space-y-2">
              {symptoms.map((symptom, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={symptom}
                    onChange={(e) => handleSymptomChange(index, e.target.value)}
                    placeholder="Enter symptom"
                  />
                  {symptoms.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveSymptom(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSymptom}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Symptom
              </Button>
            </div>
          </div>

          {/* Medicines */}
          <div>
            <label className="block text-sm font-medium mb-2">Medicines</label>

            {/* Medicine Search */}
            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  type="search"
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCustomMedicine(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 space-y-2">
                  {searchResults.map((medicine) => (
                    <div
                      key={medicine.id}
                      className="p-2 bg-white rounded-lg shadow-sm border flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{capitalizeFirstLetter(medicine.medicine_name)}</p>
                        <p className="text-sm text-muted-foreground">
                          Type: {medicine.type}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddMedicine(medicine)}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Medicine Form */}
              {showCustomMedicine && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border space-y-4">
                  <h3 className="font-medium">Add Custom Medicine</h3>
                  <div className="space-y-4">
                    <Input
                      placeholder="Medicine Name"
                      value={customMedicine.medicine_name}
                      onChange={(e) => handleCustomMedicineChange('medicine_name', e.target.value)}
                    />
                    <Input
                      placeholder="Type (e.g., tablet, syrup)"
                      value={customMedicine.type}
                      onChange={(e) => handleCustomMedicineChange('type', e.target.value)}
                    />
                    <Input
                      placeholder="Notes"
                      value={customMedicine.notes}
                      onChange={(e) => handleCustomMedicineChange('notes', e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Almirah"
                        value={customMedicine.location.almirah}
                        onChange={(e) => handleCustomMedicineChange('location.almirah', e.target.value)}
                      />
                      <Input
                        placeholder="Door"
                        value={customMedicine.location.door}
                        onChange={(e) => handleCustomMedicineChange('location.door', e.target.value)}
                      />
                      <Input
                        placeholder="Row"
                        value={customMedicine.location.row}
                        onChange={(e) => handleCustomMedicineChange('location.row', e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleAddCustomMedicine}
                        className="flex-1"
                      >
                        Add Medicine
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCustomMedicine(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Medicines */}
            <div className="space-y-2">
              {medicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className="p-3 bg-white rounded-lg shadow-sm border flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{capitalizeFirstLetter(medicine.medicine_name)}</p>
                    <p className="text-sm text-muted-foreground">
                      Type: {medicine.type}
                    </p>
                    {medicine.notes && (
                      <p className="text-sm text-muted-foreground">
                        Notes: {medicine.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMedicine(medicine.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 text-green-600 rounded-lg">
              Treatment plan added successfully!
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !planName.trim() || medicines.length === 0}
            className="w-full"
          >
            {loading ? "Adding Plan..." : "Add Treatment Plan"}
          </Button>
        </form>
      </div>
    </div>
  );
} 