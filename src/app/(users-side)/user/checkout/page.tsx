"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

import { useCheckout } from "@/hooks/UseCheckout";
import AddressForm from "@/components/(user)/checkout/AdressForm";
import PaymentMethodSelector from "@/components/(user)/checkout/PaymentMethodSelector";
import OrderSummary from "@/components/(user)/checkout/OrderSummary";
import ConfirmOrderModal from "@/components/(user)/checkout/ConfirmOrderModal";
import CheckoutBanners from "@/components/(user)/checkout/CheckoutBanners";
import TrustBadges from "@/components/(user)/checkout/TrustBadges";

function CheckoutForm() {
  const searchParams = useSearchParams();

  const selectedIds = searchParams.get("ids")?.split(",") ?? [];
  const couponCode = searchParams.get("coupon") ?? "";
  const couponId = searchParams.get("couponId") ?? "";
  const diskonKupon = Number(searchParams.get("discount") ?? 0);

  const {
    form,
    formError,
    orderItems,
    selectedPayment,
    setSelectedPayment,
    showOrderDetail,
    setShowOrderDetail,
    loading,
    showConfirm,
    setShowConfirm,
    subtotal,
    shippingFee,
    total,
    shipping,
    shippingStatus,
    isCalculatingShipping,
    selectedMethod,
    isCod,
    handleInput,
    handleFillFromProfile,
    handleCheckoutClick,
    handleOrder,
  } = useCheckout(selectedIds, couponCode, couponId, diskonKupon);

  return (
    <>
      {showConfirm && (
        <ConfirmOrderModal
          form={form}
          paymentLabel={selectedMethod.label}
          isCod={isCod}
          orderItems={orderItems}
          subtotal={subtotal}
          diskonKupon={diskonKupon}
          couponCode={couponCode}
          total={total}
          loading={loading}
          onConfirm={handleOrder}
          onClose={() => !loading && setShowConfirm(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/user/cart" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition text-gray-500">
            <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
            <p className="text-xs text-gray-400">{orderItems.length} produk dipilih</p>
          </div>
        </div>

        <CheckoutBanners formError={formError} couponCode={couponCode} diskonKupon={diskonKupon} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <AddressForm form={form} formError={formError} onChange={handleInput} onFillFromProfile={handleFillFromProfile} />
            <PaymentMethodSelector selectedPayment={selectedPayment} onSelect={setSelectedPayment} />
          </div>

          <div className="space-y-4">
            <OrderSummary
              orderItems={orderItems}
              subtotal={subtotal}
              shippingFee={shippingFee}
              shipping={shipping}
              shippingStatus={shippingStatus}
              isCalculatingShipping={isCalculatingShipping}
              diskonKupon={diskonKupon}
              couponCode={couponCode}
              total={total}
              isCod={isCod}
              onCheckout={handleCheckoutClick}
              showOrderDetail={showOrderDetail}
              setShowOrderDetail={setShowOrderDetail}
            />
            <TrustBadges />
          </div>
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutForm />
    </Suspense>
  );
}
