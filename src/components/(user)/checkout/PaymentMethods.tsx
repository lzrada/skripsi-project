import { faMoneyBill, faCreditCard, faWallet, faHandHoldingDollar } from "@fortawesome/free-solid-svg-icons";

export const paymentMethods = [
  {
    id: "cod",
    label: "Bayar di Tempat / Bayar di Toko (COD)",
    desc: "Hanya wilayah Blitar & sekitarnya",
    icon: faHandHoldingDollar,
    color: "text-orange-500",
    bg: "bg-orange-50",
    useMidtrans: false,
    paymentType: undefined,
  },
  {
    id: "transfer",
    label: "Transfer Bank",
    desc: "BCA, BRI, BNI, Mandiri",
    icon: faMoneyBill,
    color: "text-blue-500",
    bg: "bg-blue-50",
    useMidtrans: true,
    paymentType: "transfer" as const,
  },
  {
    id: "kartu",
    label: "Kartu Kredit / Debit",
    desc: "Visa, Mastercard",
    icon: faCreditCard,
    color: "text-purple-500",
    bg: "bg-purple-50",
    useMidtrans: true,
    paymentType: "kartu" as const,
  },
  {
    id: "ewallet",
    label: "E-Wallet",
    desc: "GoPay, OVO, Dana, ShopeePay",
    icon: faWallet,
    color: "text-green-500",
    bg: "bg-green-50",
    useMidtrans: true,
    paymentType: "ewallet" as const,
  },
];

export type PaymentMethod = (typeof paymentMethods)[number];
