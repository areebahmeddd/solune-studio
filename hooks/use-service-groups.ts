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

export interface ServiceGroup {
  id: string;
  name: string;
  category: "men" | "women" | "both";
  order: number;
}

export const useServiceGroups = () => {
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "serviceGroups"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: ServiceGroup[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as ServiceGroup);
      });
      setServiceGroups(data.sort((a, b) => a.order - b.order));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addServiceGroup = async (group: Omit<ServiceGroup, "id">) => {
    const toastId = `add-group-${Date.now()}`;
    try {
      await addDoc(collection(db, "serviceGroups"), group);
      toast.success("Service group added successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to add service group", { id: toastId });
    }
  };

  const updateServiceGroup = async (
    id: string,
    group: Omit<ServiceGroup, "id">,
  ) => {
    const toastId = `update-group-${id}`;
    try {
      await updateDoc(doc(db, "serviceGroups", id), group);
      toast.success("Service group updated successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to update service group", { id: toastId });
    }
  };

  const deleteServiceGroup = async (id: string) => {
    const toastId = `delete-group-${id}`;
    try {
      await deleteDoc(doc(db, "serviceGroups", id));
      toast.success("Service group deleted successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete service group", { id: toastId });
    }
  };

  return {
    serviceGroups,
    loading,
    addServiceGroup,
    updateServiceGroup,
    deleteServiceGroup,
  };
};
