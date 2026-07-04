import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeModal = ({ isOpen, onClose, amount, category, onSimulateVerify }) => {
  if (!isOpen) return null;

  // Generate UPI URI
  const upiId = "brahambabatrust@sbi";
  const payeeName = "BrahamBaba Devotee Trust";
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(category + ' Donation')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-amber-200 dark:border-amber-900 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl font-bold"
        >
          &times;
        </button>

        <div className="text-center">
          <h3 className="text-xl font-bold text-maroon-900 dark:text-amber-500 mb-2">Scan & Donate via UPI</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
            Category: <strong className="text-saffron-600">{category}</strong> | Amount: <strong className="text-saffron-600">₹{amount}</strong>
          </p>

          <div className="bg-amber-50 p-4 rounded-xl inline-block border border-amber-200 mb-4">
            <QRCodeSVG value={upiUrl} size={200} />
          </div>

          <p className="text-xs text-gray-500 dark:text-slate-500 mb-4">
            Scan this QR code using any UPI app (GPay, PhonePe, Paytm, BHIM) to make a direct payment.
          </p>

          <div className="space-y-2">
            <button
              onClick={onSimulateVerify}
              className="w-full bg-saffron-600 hover:bg-saffron-700 text-white font-semibold py-2 px-4 rounded-xl transition shadow"
            >
              Simulate Instant Verification
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
export { QRCodeModal };
