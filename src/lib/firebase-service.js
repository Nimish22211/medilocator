import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Medicine Collection
export async function addMedicine(medicineData) {
  try {
    const { name, symptoms, almirah, row, box, type, price } = medicineData;

    if (!name || !type || !almirah || !row || !box) {
      throw new Error("Missing required fields");
    }

    const medicineRef = collection(db, "medicines");
    const newMedicine = {
      medicine_name: name.trim(),
      symptoms: symptoms || [],
      location: {
        almirah: almirah.trim(),
        row: row.trim(),
        box: box.trim()
      },
      type: type.trim(),
      price: parseFloat(price) || 0,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(medicineRef, newMedicine);
    return { id: docRef.id, ...newMedicine };
  } catch (error) {
    console.error("Error adding medicine:", error);
    throw error;
  }
}

export const getMedicines = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'medicines'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting medicines:', error);
    throw error;
  }
};

export const searchMedicines = async (searchTerm) => {
  try {
    const medicinesRef = collection(db, 'medicines');
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();

    // If search term is empty, return empty array
    if (!normalizedSearchTerm) {
      return [];
    }

    // Create a range query for better partial matching
    const q = query(
      medicinesRef,
      where('medicine_name', '>=', normalizedSearchTerm),
      where('medicine_name', '<=', normalizedSearchTerm + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort results by relevance (exact matches first, then partial matches)
    return results.sort((a, b) => {
      const aName = a.medicine_name.toLowerCase();
      const bName = b.medicine_name.toLowerCase();

      // Exact match gets highest priority
      if (aName === normalizedSearchTerm && bName !== normalizedSearchTerm) return -1;
      if (bName === normalizedSearchTerm && aName !== normalizedSearchTerm) return 1;

      // Starts with search term gets second priority
      if (aName.startsWith(normalizedSearchTerm) && !bName.startsWith(normalizedSearchTerm)) return -1;
      if (bName.startsWith(normalizedSearchTerm) && !aName.startsWith(normalizedSearchTerm)) return 1;

      // Contains search term gets third priority
      if (aName.includes(normalizedSearchTerm) && !bName.includes(normalizedSearchTerm)) return -1;
      if (bName.includes(normalizedSearchTerm) && !aName.includes(normalizedSearchTerm)) return 1;

      // Alphabetical order for same priority
      return aName.localeCompare(bName);
    });
  } catch (error) {
    console.error('Error searching medicines:', error);
    throw error;
  }
};

// Search by Symptoms
export const searchBySymptoms = async (symptoms) => {
  try {
    const medicinesRef = collection(db, 'medicines');

    // If only one symptom, use array-contains for better performance
    if (symptoms.length === 1) {
      const q = query(
        medicinesRef,
        where('symptoms', 'array-contains', symptoms[0].toLowerCase())
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    // For multiple symptoms, use array-contains-any
    const q = query(
      medicinesRef,
      where('symptoms', 'array-contains-any', symptoms.map(s => s.toLowerCase()))
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort results by number of matching symptoms (most matches first)
    return results.sort((a, b) => {
      const aMatches = a.symptoms.filter(s =>
        symptoms.includes(s.toLowerCase())
      ).length;
      const bMatches = b.symptoms.filter(s =>
        symptoms.includes(s.toLowerCase())
      ).length;
      return bMatches - aMatches;
    });
  } catch (error) {
    console.error('Error searching by symptoms:', error);
    throw error;
  }
};

// Search by Plan
export const searchByPlan = async (plan) => {
  try {
    const medicinesRef = collection(db, 'medicines');
    const q = query(
      medicinesRef,
      where('plans', 'array-contains', plan.toLowerCase())
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error searching by plan:', error);
    throw error;
  }
};

// Update Medicine
export const updateMedicine = async (id, medicineData) => {
  try {
    const medicineRef = doc(db, 'medicines', id);
    await updateDoc(medicineRef, {
      medicine_name: medicineData.medicine_name,
      symptoms: medicineData.symptoms || [],
      notes: medicineData.notes,
      location: {
        almirah: medicineData.location.almirah,
        row: medicineData.location.row,
        box: medicineData.location.box
      },
      type: medicineData.type,
      price: parseFloat(medicineData.price) || 0,
      updatedAt: new Date().toISOString()
    });
    return { id, ...medicineData };
  } catch (error) {
    console.error('Error updating medicine:', error);
    throw error;
  }
};

// Delete Medicine
export const deleteMedicine = async (id) => {
  try {
    const medicineRef = doc(db, 'medicines', id);
    await deleteDoc(medicineRef);
    return id;
  } catch (error) {
    console.error('Error deleting medicine:', error);
    throw error;
  }
};

// Treatment Plans Collection
export const addTreatmentPlan = async (planData) => {
  try {
    const { name, symptoms, medicines, total_price } = planData;

    if (!name || !medicines || medicines.length === 0) {
      throw new Error("Missing required fields: name and medicines are required");
    }

    console.log('Adding treatment plan to Firebase:', planData); // Debug log

    const planRef = collection(db, "treatmentPlans");
    const newPlan = {
      name: name.trim(),
      symptoms: symptoms || [],
      medicines: medicines.map(medicine => ({
        id: medicine.id,
        name: medicine.name,
        type: medicine.type,
        notes: medicine.notes || "",
        price: parseFloat(medicine.price) || 0,
        location: medicine.location
      })),
      total_price: parseFloat(total_price) || 0,
      created_at: serverTimestamp()
    };

    console.log('Processed plan data:', newPlan); // Debug log

    const docRef = await addDoc(planRef, newPlan);
    const addedPlan = { id: docRef.id, ...newPlan };

    console.log('Plan added successfully:', addedPlan); // Debug log
    return addedPlan;
  } catch (error) {
    console.error("Error adding treatment plan:", error);
    throw error;
  }
};

export const getTreatmentPlans = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'treatmentPlans'));
    console.log('Treatment plans:', querySnapshot.docs.map(doc => doc.data()));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting treatment plans:', error);
    throw error;
  }
};

export const searchTreatmentPlans = async (searchTerm) => {
  try {
    const plansRef = collection(db, 'treatmentPlans');
    const q = query(
      plansRef,
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error searching treatment plans:', error);
    throw error;
  }
}; 