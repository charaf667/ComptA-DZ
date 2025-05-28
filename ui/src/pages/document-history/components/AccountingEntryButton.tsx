import React, { useState } from 'react';
import { FiFileText } from 'react-icons/fi';
import type { ProcessedDocument } from '../../../types/document-history';
import AccountingEntryGenerator from './AccountingEntryGenerator';

interface AccountingEntryButtonProps {
  document: ProcessedDocument;
  onSuccess?: () => void;
}

const AccountingEntryButton: React.FC<AccountingEntryButtonProps> = ({ document, onSuccess }) => {
  const [showGenerator, setShowGenerator] = useState(false);
  
  const handleOpenGenerator = () => {
    setShowGenerator(true);
  };
  
  const handleCloseGenerator = () => {
    setShowGenerator(false);
  };
  
  const handleSuccess = () => {
    setShowGenerator(false);
    if (onSuccess) {
      onSuccess();
    }
  };
  
  return (
    <>
      <button
        onClick={handleOpenGenerator}
        className={`p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/20 ${
          document.hasAccountingEntry ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : ''
        }`}
        title={document.hasAccountingEntry ? "Voir l'écriture comptable" : "Générer une écriture comptable"}
      >
        <FiFileText className="h-4 w-4" />
      </button>
      
      {showGenerator && (
        <AccountingEntryGenerator
          document={document}
          onClose={handleCloseGenerator}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default AccountingEntryButton;
