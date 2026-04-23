import { db } from "@/config/firebase";
import { supabase } from "@/config/supabase";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  category: string;
  condition?: string;
  originalPrice?: number;
  price: number;
  stock: number;
  description?: string;
  images: string[];
  createdAt?: any;
}

export interface AddProductPayload {
  name: string;
  category: string;
  condition?: string;
  originalPrice?: number;
  price: number;
  stock: number;
  description?: string;
  images: string[];
}

export interface UpdateProductPayload {
  name: string;
  category: string;
  condition?: string;
  originalPrice?: number;
  price: number;
  stock: number;
  description?: string;
  images: string[];
}

export const uploadMultipleImagesService = async (files: File[]): Promise<string[]> => {
  try {
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const fileExtension = file.name.split(".").pop();
      const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const { data, error } = await supabase.storage.from("products").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw new Error(error.message);
      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(data.path);
      uploadedUrls.push(publicUrl);
    }
    return uploadedUrls;
  } catch (error) {
    console.error("uploadMultipleImagesService Error:", error);
    throw error;
  }
};

export const deleteImageFromSupabaseService = async (publicUrl: string): Promise<void> => {
  try {
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split("/products/");
    if (pathParts.length < 2) return;
    const filePath = pathParts[1];
    const { error } = await supabase.storage.from("products").remove([filePath]);
    if (error) console.error("deleteImageFromSupabaseService Error:", error);
  } catch (error) {
    console.error("deleteImageFromSupabaseService Error:", error);
  }
};

export const addProductService = async (payload: AddProductPayload) => {
  try {
    const response = await addDoc(collection(db, "products"), {
      name: payload.name,
      category: payload.category,
      condition: payload.condition ?? "Bekas",
      originalPrice: payload.originalPrice ?? null,
      price: payload.price,
      stock: payload.stock,
      description: payload.description ?? "",
      images: payload.images,
      createdAt: serverTimestamp(),
    });
    return response;
  } catch (error) {
    console.error("addProductService Error:", error);
    throw error;
  }
};

export const updateProductService = async (id: string, payload: UpdateProductPayload) => {
  try {
    await updateDoc(doc(db, "products", id), {
      name: payload.name,
      category: payload.category,
      condition: payload.condition ?? "Bekas",
      originalPrice: payload.originalPrice ?? null,
      price: payload.price,
      stock: payload.stock,
      description: payload.description ?? "",
      images: payload.images,
    });
  } catch (error) {
    console.error("updateProductService Error:", error);
    throw error;
  }
};

export const deleteProductService = async (id: string) => {
  try {
    await deleteDoc(doc(db, "products", id));
  } catch (error) {
    console.error("deleteProductService Error:", error);
    throw error;
  }
};

export const subscribeToProductsService = (callback: (products: Product[]) => void) => {
  try {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products: Product[] = snapshot.docs.map((docItem) => {
        const data = docItem.data();
        return {
          id: docItem.id,
          name: data.name || "",
          category: data.category || "",
          condition: data.condition ?? "Bekas",
          originalPrice: data.originalPrice ?? undefined,
          price: data.price || 0,
          stock: data.stock || 0,
          description: data.description || "",
          images: data.images || [],
          createdAt: data.createdAt || null,
        };
      });
      callback(products);
    });
    return unsubscribe;
  } catch (error) {
    console.error("subscribeToProductsService Error:", error);
    return () => {};
  }
};
