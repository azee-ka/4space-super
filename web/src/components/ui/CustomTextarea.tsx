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
    // Use forwarded ref if provided, otherwise use inner ref
    const textareaRef = ref || innerRef;

    // Auto-resize on value change
    useEffect(() => {
      const el = (textareaRef as React.RefObject<HTMLTextAreaElement>).current;
      if (!el) return;
      
      el.style.height = "auto";
      const scrollHeight = el.scrollHeight;
      const finalHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
      el.style.height = `${finalHeight}px`;
    }, [value, maxHeight, minHeight, textareaRef]);

    return (
      <textarea
        ref={textareaRef as any}
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