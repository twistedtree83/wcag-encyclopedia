/** A labelled range with its value in words. Used by the 2.4.7, 2.4.1 and 2.4.11 labs (#46). */
export function Slider({
  id,
  label,
  value,
  text,
  onChange,
  min = 0,
  max,
  step = 1,
}: {
  id: string;
  label: string;
  value: number;
  text: string;
  onChange: (v: number) => void;
  min?: number;
  max: number;
  step?: number;
}) {
  return (
    <div className="slide">
      <label htmlFor={id}>
        <span>{label}</span>
        <span>{text}</span>
      </label>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={text}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
      />
    </div>
  );
}
