import * as React from "react";
import { cn } from "../../lib/utils";
import { Input } from "./input";
import { Label } from "./label";

const DatePicker = React.forwardRef(
  ({ className, onChange, value, ...props }, ref) => {
    const handleChange = (e) => {
      // HTML date input 값은 문자열이므로 Date 객체로 변환
      const date = e.target.value ? new Date(e.target.value) : null;
      if (onChange) {
        onChange(date);
      }
    };

    // Date 객체를 input date 형식(YYYY-MM-DD)으로 변환
    const formatDateForInput = (date) => {
      if (!date) return "";
      const d = new Date(date);
      let month = "" + (d.getMonth() + 1);
      let day = "" + d.getDate();
      const year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      return [year, month, day].join("-");
    };

    return (
      <Input
        type="date"
        className={cn("w-full", className)}
        value={formatDateForInput(value)}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    );
  }
);

DatePicker.displayName = "DatePicker";

export { DatePicker }; 