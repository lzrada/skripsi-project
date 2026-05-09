export interface UserAddress {
  province: string;
  city: string;
  district: string;
  postalCode: string;
  detailAddress: string;
}

export interface UserData {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  photoURL?: string;
  role: "user" | "admin";
  address: UserAddress;
  createdAt?: string;
}
