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

export interface Stylist {
  id: string;
  name: string;
  gender: "male" | "female";
}

export const useStylists = () => {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "stylists"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Stylist[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Stylist);
      });
      setStylists(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addStylist = async (stylist: Omit<Stylist, "id">) => {
    const toastId = `add-stylist-${Date.now()}`;
    try {
      await addDoc(collection(db, "stylists"), stylist);
      toast.success("Stylist added successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to add stylist", { id: toastId });
    }
  };

  const updateStylist = async (id: string, stylist: Omit<Stylist, "id">) => {
    const toastId = `update-stylist-${id}`;
    try {
      await updateDoc(doc(db, "stylists", id), stylist);
      toast.success("Stylist updated successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to update stylist", { id: toastId });
    }
  };

  const deleteStylist = async (id: string) => {
    const toastId = `delete-stylist-${id}`;
    try {
      await deleteDoc(doc(db, "stylists", id));
      toast.success("Stylist deleted successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete stylist", { id: toastId });
    }
  };

  return {
    stylists,
    addStylist,
    updateStylist,
    deleteStylist,
  };
};
