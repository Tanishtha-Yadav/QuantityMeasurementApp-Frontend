// import { getConversion } from "./api.js";

function evaluateFormula(formula, value) {
    try {
        const evaluator = new Function("x", "value", `return ${formula};`);
        return evaluator(value, value);
    } catch (error) {
        throw new Error("Invalid conversion formula.");
    }
}

export async function convertValue(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) {
        return value;
    }

    const conversion = await getConversion(fromUnit, toUnit);

    if (!conversion) {
        throw new Error("Conversion not available for this unit pair.");
    }

    const factor = Number(conversion.factor);

    if (Number.isFinite(factor)) {
        return value * factor;
    }

    if (conversion.formula) {
        return evaluateFormula(conversion.formula, value);
    }

    throw new Error("Unsupported conversion config.");
}

export function findBaseUnit(type, units) {
    const defaults = {
        Length: "m",
        Weight: "g",
        Temperature: "c",
        Volume: "ml",
    };

    return defaults[type] || (units[0] ? units[0].symbol : "");
}

export function formatNumber(value) {
    const formatted = Number(value).toPrecision(6);
    return String(Number(formatted));
}
