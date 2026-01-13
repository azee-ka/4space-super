import { useEffect, useRef, forwardRef } from "react";

interface CustomTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  maxHeight?: number;
  minHeight?: number;
  className?: string;
}

const CustomTextarea = forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  (
    {
      value,
      onChange,
      placeholder = "Type your message...",
      maxHeight = 120,
      minHeight = 40,
      className = "",
      ...props
    },
    ref
  ) => {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    
    // Use callback ref to handle both forwarded ref and internal ref
    const setRef = (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      }
    };

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;

      // Preserve focus when value changes (especially when clearing)
      const wasFocused = document.activeElement === el;

      el.style.height = "auto";

      const scrollHeight = el.scrollHeight;
      const finalHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
      el.style.height = `${finalHeight}px`;

      // Restore focus if it was focused before (helps with rapid sending)
      if (wasFocused && document.activeElement !== el) {
        requestAnimationFrame(() => {
          el?.focus();
        });
      }
    }, [value, maxHeight, minHeight]);

    return (
      <textarea
        ref={setRef}
        className={className}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={1}
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeight}px`,
          overflowY: "auto",
          resize: "none",
          boxSizing: "border-box"
        }}
        {...props}
      />
    );
  }
);

CustomTextarea.displayName = 'CustomTextarea';

export default CustomTextarea;
