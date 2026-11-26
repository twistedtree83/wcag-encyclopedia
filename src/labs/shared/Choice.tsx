/** A radio group of named options: the control row most labs use. */
export function Choice<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="nrv-choice">
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
