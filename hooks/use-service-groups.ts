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

export interface ServiceGroup {
  id: string;
  name: string;
  category: "men" | "women" | "both";
  order: number;
}

export const useServiceGroups = () => {
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);

  useEffect(() => {
    const q = query(collection(db, "serviceGroups"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: ServiceGroup[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as ServiceGroup);
      });
      setServiceGroups(data.sort((a, b) => a.order - b.order));
    });

    return () => unsubscribe();
  }, []);

  const addServiceGroup = async (group: Omit<ServiceGroup, "id">) => {
    try {
      await addDoc(collection(db, "serviceGroups"), group);
    } catch (error) {
      throw error;
    }
  };

  const updateServiceGroup = async (
    id: string,
    group: Omit<ServiceGroup, "id">,
  ) => {
    try {
      await updateDoc(doc(db, "serviceGroups", id), group);
    } catch (error) {
      throw error;
    }
  };

  const deleteServiceGroup = async (id: string) => {
    try {
      await deleteDoc(doc(db, "serviceGroups", id));
    } catch (error) {
      throw error;
    }
  };

  return {
    serviceGroups,
    addServiceGroup,
    updateServiceGroup,
    deleteServiceGroup,
  };
};
