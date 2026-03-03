import { useState } from 'react';
import './NumberInput.css';

function NumberInput({ integerOnly, onChange, defaultValue = 0, label, min, max }) {
	const [hasDecimal, setHasDecimal] = useState(false);

	const id = crypto.randomUUID();

	function handleChange(e) {
		const val = e.target.value;

		if (val === '') {
			e.target.value = '0';
			onChange(0);
			return;
		}

		const integerOnlyRegex = /^\d+$/;
		const decimalRegex = /^\d+(\.\d+)?$/;

		const regex = integerOnly ? integerOnlyRegex : decimalRegex;

		const lastCharIsDecimal = val.charAt(val.length - 1) === '.';

		if (lastCharIsDecimal && val.slice(0, val.length - 1).includes('.')) {
			onChange(defaultValue);
			return;
		}

		const decimalIndex = String(defaultValue).indexOf('.');
		const prevHasDecimal = decimalIndex !== -1;

		if (!integerOnly && lastCharIsDecimal && prevHasDecimal) {
			setHasDecimal(true);
			onChange(Number(String(defaultValue).slice(0, decimalIndex)));
		}

		if (!integerOnly && !lastCharIsDecimal && hasDecimal) {
			setHasDecimal(false);
		}

		if (!integerOnly && integerOnlyRegex.test(val.slice(0, val.length - 1)) && lastCharIsDecimal) {
			setHasDecimal(true);
			return;
		}

		if (!regex.test(val)) {
			e.target.value = val.slice(0, val.length - 1);
			onChange(defaultValue);
			return;
		}

		if (min && Number(val) < min) {
			onChange(defaultValue);
			return;
		}

		if (max && Number(val) > max) {
			onChange(defaultValue);
			return;
		}

		onChange(Number(val));
	}

	const stringValue = String(defaultValue);
	let displayValue;
	if (integerOnly) {
		displayValue = Math.round(defaultValue);
	} else {
		displayValue = stringValue + (hasDecimal ? '.' : '');
	}

	return (
		<>
			{label ? (
				<label htmlFor={id} className="number-input__label">
					{label}
				</label>
			) : null}
			<input id={id} className="number-input__field" type="text" value={displayValue} onChange={handleChange} />
		</>
	);
}

export default NumberInput;
