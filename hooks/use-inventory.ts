"use client";

import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export interface Product {
  id: string;
  name: string;
  expiryDate?: string;
  timestamp: string;
}

export interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  date: string;
  type: "revaluation" | "transaction";
  quantity: number;
  price: number;
  timestamp: string;
}

export const useInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);

  useEffect(() => {
    const productsQuery = query(
      collection(db, "products"),
      orderBy("name", "asc"),
    );

    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const data: Product[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(data);
    });

    const transactionsQuery = query(
      collection(db, "stockTransactions"),
      orderBy("date", "desc"),
    );

    const unsubscribeTransactions = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const data: StockTransaction[] = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as StockTransaction);
        });
        setTransactions(data);
      },
    );

    return () => {
      unsubscribeProducts();
      unsubscribeTransactions();
    };
  }, []);

  const addProduct = async (product: Omit<Product, "id" | "timestamp">) => {
    try {
      await addDoc(collection(db, "products"), {
        ...product,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  };

  const updateProduct = async (
    id: string,
    product: Omit<Product, "id" | "timestamp">,
  ) => {
    try {
      await updateDoc(doc(db, "products", id), product);
    } catch (error) {
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const transactionsQuery = query(
        collection(db, "stockTransactions"),
        where("productId", "==", id),
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);

      const deletePromises = transactionsSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref),
      );
      await Promise.all(deletePromises);

      await deleteDoc(doc(db, "products", id));
    } catch (error) {
      throw error;
    }
  };

  const addTransaction = async (
    transaction: Omit<StockTransaction, "id" | "timestamp">,
  ) => {
    try {
      await addDoc(collection(db, "stockTransactions"), {
        ...transaction,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, "stockTransactions", id));
    } catch (error) {
      throw error;
    }
  };

  const getCurrentStock = (productId: string): number => {
    const productTransactions = transactions.filter(
      (t) => t.productId === productId,
    );

    if (productTransactions.length === 0) return 0;

    const sortedTransactions = [...productTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const lastRevaluation = sortedTransactions
      .filter((t) => t.type === "revaluation")
      .pop();

    let stock = 0;

    if (lastRevaluation) {
      const transactionsAfterRevaluation = sortedTransactions.filter(
        (t) => new Date(t.date) >= new Date(lastRevaluation.date),
      );

      transactionsAfterRevaluation.forEach((t) => {
        if (t.type === "revaluation") {
          stock = t.quantity;
        } else if (t.type === "transaction") {
          stock += t.quantity;
        }
      });
    } else {
      sortedTransactions.forEach((t) => {
        if (t.type === "transaction") {
          stock += t.quantity;
        }
      });
    }

    return stock;
  };

  return {
    products,
    transactions,
    addProduct,
    updateProduct,
    deleteProduct,
    addTransaction,
    deleteTransaction,
    getCurrentStock,
  };
};
