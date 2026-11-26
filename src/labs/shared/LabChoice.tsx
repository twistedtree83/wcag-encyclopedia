/**
 * A radio group for a lab's controls (#48): a fieldset with a legend, one radio per option.
 * Radio groups rather than selects, so arrow keys drive them by keyboard (and in e2e).
 * `value` may be `null` when no option matches, e.g. alt text the reader wrote themselves.
 */
export function LabChoice<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  readonly name: string;
  readonly legend: string;
  readonly options: readonly { readonly value: T; readonly label: string }[];
  readonly value: T | null;
  readonly onChange: (v: T) => void;
}) {
  return (
    <fieldset className="sem-choice">
      <legend>{legend}</legend>
      {options.map((o) => (
        <label key={o.value}>
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}
