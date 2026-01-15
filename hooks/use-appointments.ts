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

export interface ServiceItem {
  name: string;
  price: number;
  stylist?: string;
}

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  services: ServiceItem[];
  date: string;
  amount: number;
  discount: number;
  paymentMethod: string;
  stylist: string;
  timestamp: string;
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "appointments"),
      orderBy("timestamp", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Appointment[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      setAppointments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addAppointment = async (appointment: Omit<Appointment, "id">) => {
    try {
      await addDoc(collection(db, "appointments"), {
        ...appointment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  };

  const updateAppointment = async (
    id: string,
    appointment: Omit<Appointment, "id">,
  ) => {
    try {
      await updateDoc(doc(db, "appointments", id), {
        ...appointment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await deleteDoc(doc(db, "appointments", id));
    } catch (error) {
      throw error;
    }
  };

  return {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  };
};
