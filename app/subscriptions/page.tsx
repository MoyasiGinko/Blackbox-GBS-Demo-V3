"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSubscriptions,
  purchaseSubscription,
} from "../../store/subscriptionSlice";
import { RootState, AppDispatch } from "../../store/store";
import Navbar from "../../components/Navbar";

export default function SubscriptionsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { plans, loading, error } = useSelector(
    (state: RootState) => state.subscription
  );

  useEffect(() => {
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  const handlePurchase = (planId: number) => {
    dispatch(purchaseSubscription({ plan_id: planId }));
  };

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Choose a Subscription Plan</h1>
        {loading && <p>Loading plans...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="border rounded p-6 shadow hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
                <p className="mb-4">
                  ${plan.price} - {plan.duration_days} days access
                </p>
              </div>
              <button
                onClick={() => handlePurchase(plan.id)}
                className="mt-auto bg-black text-white py-2 rounded hover:bg-gray-900 transition"
              >
                Purchase
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
