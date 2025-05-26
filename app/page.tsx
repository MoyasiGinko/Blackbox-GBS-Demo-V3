"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchServices } from "../store/serviceSlice";
import { RootState, AppDispatch } from "../store/store";
import Navbar from "../components/Navbar";

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { services, loading, error } = useSelector(
    (state: RootState) => state.service
  );

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Available AI/SEO Services</h1>
        {loading && <p>Loading services...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="border rounded p-4 shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">{service.name}</h2>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
