"use client";

import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface Expense {
  id: string;
  item: string;
  amount: number;
  date: string;
  timestamp: string;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Expense[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Expense);
      });
      setExpenses(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addExpense = async (expense: Omit<Expense, "id">) => {
    try {
      await addDoc(collection(db, "expenses"), {
        ...expense,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  };

  const updateExpense = async (id: string, expense: Omit<Expense, "id">) => {
    const toastId = `update-expense-${id}`;
    try {
      await updateDoc(doc(db, "expenses", id), {
        ...expense,
        timestamp: new Date().toISOString(),
      });
      toast.success("Expense updated successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to update expense", { id: toastId });
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, "expenses", id));
    } catch (error) {
      throw error;
    }
  };

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
};
