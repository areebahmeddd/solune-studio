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
    const toastId = `add-appointment-${Date.now()}`;
    try {
      await addDoc(collection(db, "appointments"), {
        ...appointment,
        timestamp: new Date().toISOString(),
      });
      toast.success("Appointment added successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to add appointment", { id: toastId });
    }
  };

  const updateAppointment = async (
    id: string,
    appointment: Omit<Appointment, "id">,
  ) => {
    const toastId = `update-appointment-${id}`;
    try {
      await updateDoc(doc(db, "appointments", id), {
        ...appointment,
        timestamp: new Date().toISOString(),
      });
      toast.success("Appointment updated successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to update appointment", { id: toastId });
    }
  };

  const deleteAppointment = async (id: string) => {
    const toastId = `delete-appointment-${id}`;
    try {
      await deleteDoc(doc(db, "appointments", id));
      toast.success("Appointment deleted successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete appointment", { id: toastId });
    }
  };

  return {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  };
};
