import { db } from "@/config/firebase";
import { supabase } from "@/config/supabase";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  createdAt?: any;
}

export interface AddProductPayload {
  name: string;
  category: string;
  price: number;
  stock: number;
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

      if (error) {
        console.error("Upload Error:", error);
        throw new Error(error.message);
      }

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

export const addProductService = async (payload: AddProductPayload) => {
  try {
    const productData = {
      name: payload.name,
      category: payload.category,
      price: payload.price,
      stock: payload.stock,
      images: payload.images,
      createdAt: serverTimestamp(),
    };

    const response = await addDoc(collection(db, "products"), productData);

    return response;
  } catch (error) {
    console.error("addProductService Error:", error);
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
    const productsRef = collection(db, "products");

    const q = query(productsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products: Product[] = snapshot.docs.map((docItem) => {
        const data = docItem.data();

        return {
          id: docItem.id,
          name: data.name || "",
          category: data.category || "",
          price: data.price || 0,
          stock: data.stock || 0,
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
