import React, { useState, useMemo } from 'react';
import { Museum } from '../types';
import { X, ChevronRight, MapPin, Search } from 'lucide-react';

interface ListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  museums: Museum[];
  onSelect: (museum: Museum) => void;
}

// Генерация триграмм для строки (например, "cat" -> " ca", "cat", "at ")
const getTrigrams = (text: string): Set<string> => {
  // Добавляем пробелы по краям для учета начала и конца слов
  const normalized = ` ${text.toLowerCase().trim()} `;
  const trigrams = new Set<string>();
  
  if (normalized.length < 3) return trigrams;
  
  for (let i = 0; i < normalized.length - 2; i++) {
    trigrams.add(normalized.slice(i, i + 3));
  }
  return trigrams;
};

// Расчет коэффициента схожести (Jaccard-like для поиска вхождения)
const getSimilarityScore = (target: string, queryTrigrams: Set<string>): number => {
  if (queryTrigrams.size === 0) return 0;
  
  const targetTrigrams = getTrigrams(target);
  let intersection = 0;
  
  queryTrigrams.forEach(gram => {
    if (targetTrigrams.has(gram)) {
      intersection++;
    }
  });

  // Возвращаем долю найденных триграмм запроса
  return intersection / queryTrigrams.size;
};

const ListDrawer: React.FC<ListDrawerProps> = ({ isOpen, onClose, museums, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Умный поиск с защитой от опечаток
  const filteredMuseums = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return museums;

    const lowerQuery = query.toLowerCase();

    // Если запрос слишком короткий (< 3 символов), используем обычный поиск, 
    // так как триграммы будут неэффективны
    if (query.length < 3) {
      return museums.filter(m => 
        m.name.toLowerCase().includes(lowerQuery) || 
        m.address.toLowerCase().includes(lowerQuery)
      );
    }

    const queryTrigrams = getTrigrams(query);

    return museums
      .map(museum => {
        // Считаем релевантность для названия и адреса
        const nameScore = getSimilarityScore(museum.name, queryTrigrams);
        const addressScore = getSimilarityScore(museum.address, queryTrigrams);
        
        // Даем бонус, если есть точное вхождение подстроки (чтобы они были выше в списке)
        const exactMatchBonus = (
          museum.name.toLowerCase().includes(lowerQuery) || 
          museum.address.toLowerCase().includes(lowerQuery)
        ) ? 1.0 : 0;

        // Итоговый счет — максимум совпадений + бонус
        return {
          museum,
          score: Math.max(nameScore, addressScore) + exactMatchBonus
        };
      })
      .filter(item => item.score > 0.3) // Порог фильтрации (отсекаем совсем непохожие)
      .sort((a, b) => b.score - a.score) // Сортируем: сначала наиболее похожие
      .map(item => item.museum);

  }, [museums, searchQuery]);

  return (
    <div 
      className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="absolute inset-0 bg-white flex flex-col">
        {/* Sticky Header Area */}
        <div className="flex flex-col border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between p-4 pb-2">
            <h2 className="text-xl font-bold text-slate-800">Все музеи</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={24} className="text-slate-600" />
            </button>
          </div>

          {/* Search Input */}
          <div className="px-4 pb-4">
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Поиск музея..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
              />
            </div>
          </div>
        </div>
        
        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
          {filteredMuseums.length > 0 ? (
            filteredMuseums.map(museum => (
              <button
                key={museum.id}
                onClick={() => onSelect(museum)}
                className="w-full bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md hover:border-indigo-200 transition-all active:bg-slate-50 text-left group"
              >
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {museum.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{museum.name}</h3>
                  <div className="flex items-center text-sm text-slate-500 gap-1 mt-1">
                      <MapPin size={12} className="shrink-0" />
                      <span className="truncate">{museum.address}</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center pt-10 text-slate-400 text-center">
              <Search size={48} className="mb-4 opacity-20" />
              <p className="font-medium">Ничего не найдено</p>
              <p className="text-sm mt-1">Попробуйте изменить запрос</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListDrawer;