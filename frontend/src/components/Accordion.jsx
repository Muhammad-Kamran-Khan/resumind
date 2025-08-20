import React, { createContext, useContext, useState } from "react";
import { cn } from "../lib/utils";

// --- Accordion Context and Hook ---
const AccordionContext = createContext(undefined);

const useAccordion = () => {
    const context = useContext(AccordionContext);
    if (!context) {
        throw new Error("Accordion components must be used within an Accordion");
    }
    return context;
};

// --- Accordion Main Component ---
export const Accordion = ({
    children,
    defaultOpen,
    allowMultiple = false,
    className = "",
}) => {
    const [activeItems, setActiveItems] = useState(
        defaultOpen ? [defaultOpen] : []
    );

    const toggleItem = (id) => {
        setActiveItems((prev) => {
            if (allowMultiple) {
                return prev.includes(id) ?
                    prev.filter((item) => item !== id) :
                    [...prev, id];
            } else {
                return prev.includes(id) ? [] : [id];
            }
        });
    };

    const isItemActive = (id) => activeItems.includes(id);

    return (
        <AccordionContext.Provider
            value={{ activeItems, toggleItem, isItemActive }}
        >
            <div className={`space-y-2 ${className}`}>{children}</div>
        </AccordionContext.Provider>
    );
};

// --- Accordion Item Component ---
export const AccordionItem = ({
    id,
    children,
    className = "",
}) => {
    return (
        <div className={`overflow-hidden border-b border-gray-200 ${className}`}>
            {children}
        </div>
    );
};

// --- Accordion Header Component ---
export const AccordionHeader = ({
    itemId,
    children,
    className = "",
    icon,
    iconPosition = "right",
}) => {
    const { toggleItem, isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);

    const defaultIcon = (
        <svg
            className={cn("w-5 h-5 transition-transform duration-200", {
                "rotate-180": isActive,
            })}
            fill="none"
            stroke="#98A2B3"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
            />
        </svg>
    );

    const handleClick = () => {
        toggleItem(itemId);
    };

    return (
        <button
            onClick={handleClick}
            className={`
                w-full px-4 py-3 text-left
                focus:outline-none
                transition-colors duration-200 flex items-center justify-between cursor-pointer
                ${className}
            `}
        >
            <div className="flex items-center space-x-3">
                {iconPosition === "left" && (icon || defaultIcon)}
                <div className="flex-1">{children}</div>
            </div>
            {iconPosition === "right" && (icon || defaultIcon)}
        </button>
    );
};

// --- Accordion Content Component ---
export const AccordionContent = ({
    itemId,
    children,
    className = "",
}) => {
    const { isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);

    return (
        <div
            className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${isActive ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                ${className}
            `}
        >
            <div className="px-4 py-3 ">{children}</div>
        </div>
    );
};