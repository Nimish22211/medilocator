'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { addMedicine } from "@/lib/firebase-service";

export default function AddMedicinePage() {
  const [formData, setFormData] = useState({
    name: "",
    symptoms: [],
    almirah: "",
    row: "",
    box: "",
    type: ""
  });
  const [newSymptom, setNewSymptom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleAddSymptom = () => {
    if (newSymptom.trim() && !formData.symptoms.includes(newSymptom.trim())) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, newSymptom.trim()]
      }));
      setNewSymptom("");
    }
  };

  const handleRemoveSymptom = (symptomToRemove) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(symptom => symptom !== symptomToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await addMedicine(formData);
      setSuccess(true);
      setFormData({
        name: "",
        symptoms: [],
        almirah: "",
        row: "",
        box: "",
        type: ""
      });
    } catch (err) {
      setError("Failed to add medicine. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add New Medicine</h1>

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg">
            Medicine added successfully!
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medicine Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Medicine Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter medicine name"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Symptoms
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                type="text"
                placeholder="Add a symptom"
                className="flex-1"
                value={newSymptom}
                onChange={(e) => setNewSymptom(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSymptom();
                  }
                }}
              />
              <Button type="button" size="icon" onClick={handleAddSymptom}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.symptoms.map((symptom) => (
                <div
                  key={symptom}
                  className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {symptom}
                  <button
                    type="button"
                    className="hover:text-destructive"
                    onClick={() => handleRemoveSymptom(symptom)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="almirah" className="block text-sm font-medium mb-2">
                Almirah
              </label>
              <Input
                id="almirah"
                type="text"
                placeholder="A, B, C..."
                required
                value={formData.almirah}
                onChange={(e) => setFormData(prev => ({ ...prev, almirah: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="row" className="block text-sm font-medium mb-2">
                Row
              </label>
              <Input
                id="row"
                type="text"
                placeholder="1, 2, 3..."
                required
                value={formData.row}
                onChange={(e) => setFormData(prev => ({ ...prev, row: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="box" className="block text-sm font-medium mb-2">
                Box
              </label>
              <Input
                id="box"
                type="text"
                placeholder="A, B, C..."
                required
                value={formData.box}
                onChange={(e) => setFormData(prev => ({ ...prev, box: e.target.value }))}
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-2">
              Type
            </label>
            <select
              id="type"
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">Select type</option>
              <option value="tablet">Tablet</option>
              <option value="syrup">Syrup</option>
              <option value="capsule">Capsule</option>
              <option value="injection">Injection</option>
            </select>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Medicine"}
          </Button>
        </form>
      </div>
    </div>
  );
} 