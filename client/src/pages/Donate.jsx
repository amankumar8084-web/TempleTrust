import React from 'react';
import { Download } from 'lucide-react';
import { useTempleContent } from '../hooks/queries/useQueries.js';
import defaultQr from '../assets/donation_qr.jpg';
import defaultBank from '../assets/donation_bank.jpg';

const Donate = () => {
  const { data: content, isLoading: loading } = useTempleContent();
  const donationImages = content?.donationImages?.length > 0
    ? content.donationImages
    : [defaultQr, defaultBank];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-spiritual">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <h1 className="text-4xl font-extrabold text-maroon-900 dark:text-amber-500">
          Support Braham Baba Temple Trust
        </h1>
        <p className="text-sm text-gray-600 dark:text-slate-400">
          Your contributions help support our daily rituals, temple maintenance, and charitable activities like Annadanam. Find our payment details below to make a direct donation.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-semibold mb-20">Loading payment details...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20 animate-fade-in">
          {donationImages.map((imgUrl, index) => {
            const downloadFilename = `donation_details_${index + 1}.jpg`;

            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col items-center space-y-6 hover:shadow-2xl hover:scale-[1.01] transition duration-300"
              >
                <div className="w-full flex-grow flex items-center justify-center overflow-hidden rounded-2xl bg-gray-50 dark:bg-slate-850 p-2 border border-gray-100 dark:border-slate-800 min-h-[300px]">
                  <img
                    src={imgUrl}
                    alt={`Donation Details ${index + 1}`}
                    className="max-h-[450px] max-w-full object-contain rounded-xl hover:scale-[1.02] transition duration-300"
                  />
                </div>

                <a
                  href={imgUrl}
                  download={downloadFilename}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold px-8 py-3 rounded-xl shadow-md hover:scale-105 transition flex items-center justify-center gap-2 text-sm w-full md:w-auto"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Details</span>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Donate;
export { Donate };
