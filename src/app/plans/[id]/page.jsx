"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, } from "lucide-react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function PlanDetails() {
    const { id } = useParams();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const planRef = doc(db, "treatmentPlans", id);
                const planDoc = await getDoc(planRef);

                if (!planDoc.exists()) {
                    throw new Error("Plan not found");
                }

                setPlan({ id: planDoc.id, ...planDoc.data() });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPlan();
    }, [id]);

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center text-red-500">
                    <p>Error: {error}</p>
                    <Button asChild className="mt-4">
                        <Link href="/plans">Back to Plans</Link>
                    </Button>
                </div>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center">
                    <p>Plan not found</p>
                    <Button asChild className="mt-4">
                        <Link href="/plans">Back to Plans</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            {/* Back Button */}
            <Button variant="ghost" asChild className="mb-6">
                <Link href="/plans" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Plans
                </Link>
            </Button>

            {/* Plan Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        {/* <DollarSign className="h-4 w-4" /> */}
                        <span className="text-lg font-semibold text-primary">
                            Total Price: ₹{parseFloat(plan.total_price).toFixed(2)}
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Medicines List */}
                        {plan.medicines.map((medicine, index) => (
                            <div key={index} className="p-4 bg-muted/50 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3">{medicine.name}</h3>
                                <div className="space-y-2">
                                    {medicine.location && (
                                        <div className="p-3 bg-primary/5 rounded-md">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-medium text-primary">Location:</span>
                                                <span className="text-primary">
                                                    Almirah {medicine.location.almirah} → Row {medicine.location.row} → Box {medicine.location.box}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {medicine.notes && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span className="font-medium">Notes:</span>
                                            <span>{medicine.notes}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 