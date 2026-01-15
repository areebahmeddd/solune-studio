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

export interface Stylist {
  id: string;
  name: string;
  gender: "male" | "female";
}

export const useStylists = () => {
  const [stylists, setStylists] = useState<Stylist[]>([]);

  useEffect(() => {
    const q = query(collection(db, "stylists"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Stylist[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Stylist);
      });
      setStylists(data);
    });

    return () => unsubscribe();
  }, []);

  const addStylist = async (stylist: Omit<Stylist, "id">) => {
    try {
      await addDoc(collection(db, "stylists"), stylist);
    } catch (error) {
      throw error;
    }
  };

  const updateStylist = async (id: string, stylist: Omit<Stylist, "id">) => {
    try {
      await updateDoc(doc(db, "stylists", id), stylist);
    } catch (error) {
      throw error;
    }
  };

  const deleteStylist = async (id: string) => {
    try {
      await deleteDoc(doc(db, "stylists", id));
    } catch (error) {
      throw error;
    }
  };

  return {
    stylists,
    addStylist,
    updateStylist,
    deleteStylist,
  };
};
