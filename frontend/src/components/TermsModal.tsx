import React from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms and Conditions</h2>
          
          <div className="prose prose-sm">
            <h3 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h3>
            <p className="mb-4">
              By accessing and using Menye's Market, you agree to be bound by these Terms and Conditions.
            </p>

            <h3 className="text-lg font-semibold mb-2">2. Product Listings</h3>
            <p className="mb-4">
              All products are listed by individual sellers. Prices and availability are subject to change without notice.
              Images are for illustration purposes and may vary from actual products.
            </p>

            <h3 className="text-lg font-semibold mb-2">3. Payments and Refunds</h3>
            <p className="mb-4">
              <strong>NO REFUNDS POLICY:</strong> All sales are final. No refunds will be issued once a transaction is completed.
              Buyers are advised to carefully review product details before making a purchase.
            </p>

            <h3 className="text-lg font-semibold mb-2">4. Communication</h3>
            <p className="mb-4">
              By using our platform, you agree to communicate with sellers through our provided channels (WhatsApp).
              Users are responsible for verifying seller information before making payments.
            </p>

            <h3 className="text-lg font-semibold mb-2">5. User Responsibilities</h3>
            <p className="mb-4">
              Users must provide accurate contact information and are responsible for any transactions conducted
              through their contact details. Misuse of the platform may result in account restrictions.
            </p>

            <h3 className="text-lg font-semibold mb-2">6. Liability Limitations</h3>
            <p className="mb-4">
              Menye's Market serves as a platform connecting buyers and sellers. We are not responsible for
              the quality, safety, or legitimacy of listed items. Users engage in transactions at their own risk.
            </p>

            <h3 className="text-lg font-semibold mb-2">7. Privacy</h3>
            <p className="mb-4">
              Your use of this platform is also governed by our Privacy Policy. Contact information provided
              will only be used for facilitating transactions and platform communications.
            </p>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end bg-gray-50 rounded-b-lg">
          <button
            onClick={onAccept}
            className="btn-primary"
          >
            I Accept the Terms and Conditions
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
