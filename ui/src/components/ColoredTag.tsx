import React, { useMemo } from 'react';
import { FiX } from 'react-icons/fi';

// Palette de couleurs prédéfinies pour les tags
const TAG_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-800', hover: 'hover:bg-blue-200', dark: { bg: 'dark:bg-blue-900/30', text: 'dark:text-blue-300', hover: 'dark:hover:bg-blue-800/40' } },
  { bg: 'bg-green-100', text: 'text-green-800', hover: 'hover:bg-green-200', dark: { bg: 'dark:bg-green-900/30', text: 'dark:text-green-300', hover: 'dark:hover:bg-green-800/40' } },
  { bg: 'bg-red-100', text: 'text-red-800', hover: 'hover:bg-red-200', dark: { bg: 'dark:bg-red-900/30', text: 'dark:text-red-300', hover: 'dark:hover:bg-red-800/40' } },
  { bg: 'bg-yellow-100', text: 'text-yellow-800', hover: 'hover:bg-yellow-200', dark: { bg: 'dark:bg-yellow-900/30', text: 'dark:text-yellow-300', hover: 'dark:hover:bg-yellow-800/40' } },
  { bg: 'bg-purple-100', text: 'text-purple-800', hover: 'hover:bg-purple-200', dark: { bg: 'dark:bg-purple-900/30', text: 'dark:text-purple-300', hover: 'dark:hover:bg-purple-800/40' } },
  { bg: 'bg-pink-100', text: 'text-pink-800', hover: 'hover:bg-pink-200', dark: { bg: 'dark:bg-pink-900/30', text: 'dark:text-pink-300', hover: 'dark:hover:bg-pink-800/40' } },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', hover: 'hover:bg-indigo-200', dark: { bg: 'dark:bg-indigo-900/30', text: 'dark:text-indigo-300', hover: 'dark:hover:bg-indigo-800/40' } },
  { bg: 'bg-gray-100', text: 'text-gray-800', hover: 'hover:bg-gray-200', dark: { bg: 'dark:bg-gray-700/30', text: 'dark:text-gray-300', hover: 'dark:hover:bg-gray-600/40' } },
];

interface ColoredTagProps {
  tag: string;
  onRemove?: () => void;
  className?: string;
  colorIndex?: number;
}

const ColoredTag: React.FC<ColoredTagProps> = ({ tag, onRemove, className = '', colorIndex }) => {
  // Générer un index de couleur basé sur le tag si non spécifié
  const tagColorIndex = useMemo(() => {
    if (colorIndex !== undefined) return colorIndex % TAG_COLORS.length;
    
    // Générer un index basé sur la chaîne du tag
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % TAG_COLORS.length;
  }, [tag, colorIndex]);
  
  const colorSet = TAG_COLORS[tagColorIndex];
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-150 ease-in-out
        ${colorSet.bg} ${colorSet.text} ${onRemove ? colorSet.hover : ''}
        ${colorSet.dark.bg} ${colorSet.dark.text} ${onRemove ? colorSet.dark.hover : ''}
        ${className}`}
    >
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 ml-1.5 inline-flex text-current focus:outline-none"
        >
          <span className="sr-only">Supprimer le tag</span>
          <FiX className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </span>
  );
};

export default ColoredTag;
