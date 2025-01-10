import {
  ariaDescribedByIds,
  enumOptionsDeselectValue,
  enumOptionsIsSelected,
  enumOptionsSelectValue,
  enumOptionsValueForIndex,
  FormContextType,
  optionId,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from "@rjsf/utils";
import React from "react";
import { ChangeEvent, FocusEvent } from "react";

export default function CheckboxesWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({
  id,
  disabled,
  options,
  value,
  autofocus,
  readonly,
  required,
  onChange,
  onBlur,
  onFocus,
}: WidgetProps<T, S, F>) {
  const { enumOptions, enumDisabled, inline, emptyValue } = options;
  const checkboxesValues = Array.isArray(value) ? value : [value];

  const _onChange =
    (index: number) =>
    ({ target: { checked } }: ChangeEvent<HTMLInputElement>) => {
      if (checked) {
        onChange(
          enumOptionsSelectValue<S>(index, checkboxesValues, enumOptions)
        );
      } else {
        onChange(
          enumOptionsDeselectValue<S>(index, checkboxesValues, enumOptions)
        );
      }
    };

  const _onBlur = ({ target: { value } }: FocusEvent<HTMLInputElement>) =>
    onBlur(id, enumOptionsValueForIndex<S>(value, enumOptions, emptyValue));
  const _onFocus = ({ target: { value } }: FocusEvent<HTMLInputElement>) =>
    onFocus(id, enumOptionsValueForIndex<S>(value, enumOptions, emptyValue));

  return (
    <div className="plug-tg-space-y-4">
      {Array.isArray(enumOptions) &&
        enumOptions.map((option, index: number) => {
          const checked = enumOptionsIsSelected<S>(
            option.value,
            checkboxesValues
          );
          const itemDisabled =
            Array.isArray(enumDisabled) &&
            enumDisabled.indexOf(option.value) !== -1;

          return (
            <div
              key={option.value}
              className={`plug-tg-flex plug-tg-items-center ${
                inline ? "plug-tg-space-x-2" : ""
              }`}
            >
              <input
                type="checkbox"
                id={optionId(id, index)}
                name={id}
                className="plug-tg-checkbox-primary plug-tg-checkbox plug-tg-border-0 plug-tg-bg-transparent"
                required={required}
                checked={checked}
                autoFocus={autofocus && index === 0}
                onChange={_onChange(index)}
                onBlur={_onBlur}
                onFocus={_onFocus}
                disabled={disabled || itemDisabled || readonly}
                aria-describedby={ariaDescribedByIds<T>(id)}
              />
              <label
                htmlFor={optionId(id, index)}
                className="plug-tg-cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          );
        })}
    </div>
  );
}
