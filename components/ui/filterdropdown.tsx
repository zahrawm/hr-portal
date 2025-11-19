"use client";

import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DropdownItem {
  id: string;
  name: string;
  flag?: string;
}

interface FilterDropdownProps {
  items: DropdownItem[];
  title?: string;
  placeholder?: string;
  onApply?: (selectedIds: string[]) => void;
  multiSelect?: boolean;
}

const FilterDropdown = ({
  items,
  title = "Select options",
  placeholder = "Select",
  onApply,
  multiSelect = true,
}: FilterDropdownProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleSelect = (itemId: string) => {
    if (multiSelect) {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });
    } else {
      setSelectedIds(new Set([itemId]));
      setOpen(false);
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply(Array.from(selectedIds));
    }
    setOpen(false);
  };

  const getDisplayText = () => {
    if (selectedIds.size === 0)
      return <h1 className="font-bold">{placeholder}</h1>;
    if (selectedIds.size === items.length)
      return <h1 className="font-bold">{placeholder}</h1>;
    if (selectedIds.size === 1) {
      const item = items.find((i) => i.id === Array.from(selectedIds)[0]);
      return <h1 className="font-bold">{item?.name || placeholder}</h1>;
    }
    return `${selectedIds.size} selected`;
  };

  return (
    <div ref={dropdownRef} className="relative mb-5 h-[44px] w-[162px] p-2.5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
      >
        <span className="truncate">{getDisplayText()}</span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 transform text-[#68798F] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="top-15 absolute left-0 z-50 mt-1 w-full rounded-[6px] border border-[#5D616B] bg-white px-2.5 py-4 shadow-lg">
          <h1 className="mb-2 text-[12px] font-normal text-[#343A46]">
            {title}
          </h1>
          <div className="max-h-[200px] overflow-y-auto">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className="flex w-full items-center gap-2 rounded py-2 text-left text-sm hover:bg-gray-50"
              >
                <div
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-all ${
                    selectedIds.has(item.id)
                      ? "border-yellow-500 bg-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {selectedIds.has(item.id) && (
                    <Check size={14} className="text-[#FFB733]" />
                  )}
                </div>

                <span className="truncate">{item.name}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center">
            <Button
              onClick={handleApply}
              className="px-15 mb-0 h-10 w-[142px] py-4"
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
