import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddFilterFormProps {
  onAdd: (word: string) => Promise<boolean>;
}

const AddFilterForm: React.FC<AddFilterFormProps> = ({ onAdd }) => {
  const [word, setWord] = useState('');
  const [adding, setAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || adding) return;
    setAdding(true);
    const success = await onAdd(word);
    if (success) setWord('');
    setAdding(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Enter word or phrase to block..."
        className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-2 text-sm text-[var(--input-text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
      />
      <button
        type="submit"
        disabled={!word.trim() || adding}
        className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-hover)] disabled:opacity-50 transition flex items-center gap-1"
      >
        <Plus className="w-4 h-4" />
        Add
      </button>
    </form>
  );
};

export default AddFilterForm;