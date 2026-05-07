import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle, faTicket } from "@fortawesome/free-solid-svg-icons";
import { formatPrice } from "@/lib/checkout.helpers";

interface Props {
  formError: string;
  couponCode: string;
  diskonKupon: number;
}

export default function CheckoutBanners({ formError, couponCode, diskonKupon }: Props) {
  return (
    <>
      {formError && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <FontAwesomeIcon icon={faExclamationCircle} className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600 font-medium">{formError}</p>
        </div>
      )}

      {couponCode && diskonKupon > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
          <FontAwesomeIcon icon={faTicket} className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm text-green-700">
            Kupon <strong>{couponCode}</strong> aktif — hemat <strong>{formatPrice(diskonKupon)}</strong>
          </p>
        </div>
      )}
    </>
  );
}
