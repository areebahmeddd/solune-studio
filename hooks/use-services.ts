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

export interface Service {
  id: string;
  name: string;
  category: "men" | "women" | "both";
  price: number;
  groupId?: string;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const q = query(collection(db, "services"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Service[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Service);
      });
      setServices(data);
    });

    return () => unsubscribe();
  }, []);

  const addService = async (service: Omit<Service, "id">) => {
    try {
      await addDoc(collection(db, "services"), service);
    } catch (error) {
      throw error;
    }
  };

  const updateService = async (id: string, service: Omit<Service, "id">) => {
    try {
      await updateDoc(doc(db, "services", id), service);
    } catch (error) {
      throw error;
    }
  };

  const deleteService = async (id: string) => {
    try {
      await deleteDoc(doc(db, "services", id));
    } catch (error) {
      throw error;
    }
  };

  return {
    services,
    addService,
    updateService,
    deleteService,
  };
};
