import React, { useState } from 'react';

export default function DragDropContainer({ items, slotsCount = 4, onComplete }) {
  const [availableItems, setAvailableItems] = useState(items);
  const [slots, setSlots] = useState(Array(slotsCount).fill(null));
  const [draggingItem, setDraggingItem] = useState(null); // { source: 'pool' | 'slot', item, slotIndex? }
  const [dragOverSlot, setDragOverSlot] = useState(null);

  const placeIntoSlot = (targetIndex) => {
    if (!draggingItem) return;

    const { source, item, slotIndex } = draggingItem;
    const newSlots = [...slots];
    let newAvailable = [...availableItems];

    if (source === 'slot') {
      if (slotIndex === targetIndex) {
        setDraggingItem(null);
        setDragOverSlot(null);
        return;
      }
      newSlots[slotIndex] = null;
    } else {
      newAvailable = newAvailable.filter((poolItem) => poolItem.id !== item.id);
    }

    const previousItem = newSlots[targetIndex];
    if (previousItem && previousItem.id !== item.id) {
      newAvailable.push(previousItem);
    }

    newSlots[targetIndex] = item;

    setSlots(newSlots);
    setAvailableItems(newAvailable);
    setDraggingItem(null);
    setDragOverSlot(null);

    if (newSlots.every((slot) => slot !== null) && onComplete) {
      onComplete(newSlots);
    }
  };

  const returnToPool = () => {
    if (!draggingItem || draggingItem.source !== 'slot') return;
    const newSlots = [...slots];
    newSlots[draggingItem.slotIndex] = null;
    setSlots(newSlots);
    setAvailableItems([...availableItems, draggingItem.item]);
    setDraggingItem(null);
    setDragOverSlot(null);
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 select-none">
      <h3 className="text-center text-sm text-gray-400 mb-4">
        長按並拖曳物品到對應欄位，拖到已填欄位會自動交換
      </h3>
      
      {/* Available Items Pool */}
      <div
        className="flex justify-center gap-3 mb-8 min-h-[80px] p-4 bg-white/5 rounded-2xl border border-white/10"
        onDragOver={(e) => e.preventDefault()}
        onDrop={returnToPool}
      >
        {availableItems.map(item => (
          <button
            key={item.id}
            draggable
            onDragStart={() => setDraggingItem({ source: 'pool', item })}
            onDragEnd={() => {
              setDraggingItem(null);
              setDragOverSlot(null);
            }}
            className={`
              w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-transform duration-200 shadow-xl
              hover:scale-105 active:scale-95
            `}
            style={{ backgroundColor: item.color || '#1A1D2E' }}
          >
            {item.imageSrc ? (
              <img src={item.imageSrc} alt={item.label || item.id} className="w-10 h-10 object-contain drop-shadow-md" />
            ) : (
              item.content
            )}
          </button>
        ))}
        {availableItems.length === 0 && (
          <div className="w-full flex items-center justify-center text-gray-500 text-sm">
            已全數放置完成
          </div>
        )}
      </div>

      {/* Target Slots */}
      <div className="flex flex-col gap-3">
        {slots.map((slot, index) => (
          <div 
            key={`slot-${index}`} 
            className="flex items-center"
          >
            <span className="w-8 text-center font-bold text-gray-500 mr-2">{index + 1}.</span>
            
            <button
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverSlot(index);
              }}
              onDragLeave={() => setDragOverSlot((prev) => (prev === index ? null : prev))}
              onDrop={(e) => {
                e.preventDefault();
                placeIntoSlot(index);
              }}
              draggable={Boolean(slot)}
              onDragStart={() => {
                if (slot) {
                  setDraggingItem({ source: 'slot', item: slot, slotIndex: index });
                }
              }}
              onDragEnd={() => {
                setDraggingItem(null);
                setDragOverSlot(null);
              }}
              className={`
                flex-1 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all duration-300 relative overflow-hidden
                ${slot ? 'border-transparent' : 'border-dashed border-gray-600 bg-gray-800/30'}
                ${dragOverSlot === index ? 'bg-[#7C5CFC]/20 border-[#7C5CFC]/50' : ''}
              `}
              style={{ backgroundColor: slot ? (slot.color || '#1A1D2E') : '' }}
            >
              {slot && (
                slot.imageSrc ? (
                  <img src={slot.imageSrc} alt={slot.label || slot.id} className="w-9 h-9 object-contain drop-shadow-lg" />
                ) : (
                  <span className="drop-shadow-lg">{slot.content}</span>
                )
              )}
              {!slot && dragOverSlot === index && <div className="text-sm text-[#7C5CFC]">放開以放置</div>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
