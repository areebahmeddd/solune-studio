"use client";

import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface Service {
  id: string;
  name: string;
  category: "men" | "women";
  price: number;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "services"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Service[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Service);
      });
      setServices(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addService = async (service: Omit<Service, "id">) => {
    const toastId = `add-service-${Date.now()}`;
    try {
      await addDoc(collection(db, "services"), service);
      toast.success("Service added successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to add service", { id: toastId });
    }
  };

  const updateService = async (id: string, service: Omit<Service, "id">) => {
    const toastId = `update-service-${id}`;
    try {
      await updateDoc(doc(db, "services", id), service);
      toast.success("Service updated successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to update service", { id: toastId });
    }
  };

  const deleteService = async (id: string) => {
    const toastId = `delete-service-${id}`;
    try {
      await deleteDoc(doc(db, "services", id));
      toast.success("Service deleted successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete service", { id: toastId });
    }
  };

  return {
    services,
    addService,
    updateService,
    deleteService,
  };
};
