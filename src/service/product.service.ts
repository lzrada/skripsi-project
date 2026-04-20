// src/service/product.service.ts
import { db } from "@/config/firebase";
import { supabase } from "@/config/supabase"; // Pastikan export 'supabase' ada di file config-mu
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string; // Tambahkan ini
}

// 1. Fungsi untuk Upload Gambar ke Supabase
export const uploadImageService = async (file: File) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Upload ke bucket bernama 'products'
  const { data, error } = await supabase.storage.from("products").upload(filePath, file);

  if (error) throw error;

  // Ambil Public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("products").getPublicUrl(data.path);

  return publicUrl;
};

// 2. Fungsi Tambah Produk (Sekarang dengan Image URL)
export const addProductService = async (productData: Omit<Product, "id">) => {
  return await addDoc(collection(db, "products"), {
    ...productData,
    createdAt: serverTimestamp(),
  });
};

export const deleteProductService = async (id: string) => {
  return await deleteDoc(doc(db, "products", id));
};

export const subscribeToProductsService = (callback: (products: Product[]) => void) => {
  const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const productsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
    callback(productsData);
  });
};
