"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

// <CHANGE> Reverted to simple single-service schema
export interface Appointment {
  id: string
  name: string
  phone: string
  service: string
  date: string
  amount: number
  discount: number
  paymentMethod: string
  stylist: string
  timestamp: string
}

interface AppointmentsStore {
  appointments: Appointment[]
  addAppointment: (appointment: Omit<Appointment, "id">) => Promise<void>
  deleteAppointment: (id: string) => void
  getAppointmentsByDate: (date: string) => Appointment[]
}

export const useAppointments = create<AppointmentsStore>()(
  persist(
    (set, get) => ({
      appointments: [],

      addAppointment: async (appointment) => {
        const newAppointment: Appointment = {
          ...appointment,
          id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }
        set((state) => ({
          appointments: [newAppointment, ...state.appointments],
        }))
      },

      deleteAppointment: (id) => {
        set((state) => ({
          appointments: state.appointments.filter((apt) => apt.id !== id),
        }))
      },

      getAppointmentsByDate: (date) => {
        return get().appointments.filter((apt) => apt.date === date)
      },
    }),
    {
      name: "salon-appointments",
    },
  ),
)
