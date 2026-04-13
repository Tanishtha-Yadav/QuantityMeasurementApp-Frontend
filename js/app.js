import {
    compareQuantities,
    convertQuantity,
    addQuantities,
    subtractQuantities,
    divideQuantities,
} from "./api.js";
import { state, setAction, setOperator, setType, setUnits } from "./state.js";
import {
    getElements,
    setActive,
    showErrorBanner,
    clearErrorBanner,
    showResult,
    validateNumber,
    populateDropdown,
    renderHistory,
} from "./ui.js";

const elements = getElements();

// Define available units for each measurement type
const AVAILABLE_UNITS = {
    Length: ["FEET", "INCHES", "YARDS", "CENTIMETERS"],
    Weight: ["MILLIGRAM", "GRAM", "KILOGRAM", "POUND", "TONNE"],
    Temperature: ["CELSIUS", "FAHRENHEIT", "KELVIN"],
    Volume: ["LITRE", "MILLILITRE", "GALLON"],
};

function requireAuth() {
    const authToken = localStorage.getItem("qmAuthToken");
    const raw = localStorage.getItem("qmCurrentUser");

    if (!authToken || !raw) {
        window.location.href = "auth.html";
        return null;
    }

    try {
        const user = JSON.parse(raw);
        elements.userBadge.textContent = user.name || user.email || "User";
        return user;
    } catch (error) {
        window.location.href = "auth.html";
        return null;
    }
}

function clearValidation() {
    elements.fromValueError.textContent = "";
    elements.toValueError.textContent = "";
    elements.fromValueInput.classList.remove("input-error");
    elements.toValueInput.classList.remove("input-error");
}

function resetInputs() {
    elements.fromValueInput.value = "1";
    elements.toValueInput.value = "1000";
    elements.resultUnitSelect.innerHTML = "";
    elements.resultUnitWrap.classList.add("hidden");
    clearValidation();
    showResult(elements.resultText, "No calculation yet.");
}

function updateActionUI() {
    elements.operatorWrap.classList.toggle("hidden", state.selectedAction !== "Arithmetic");
    elements.inputZone.classList.toggle("with-operator", state.selectedAction === "Arithmetic");

    if (state.selectedAction === "Arithmetic") {
        elements.fromValueLabel.textContent = "VALUE 1";
        elements.toValueLabel.textContent = "VALUE 2";
        elements.resultUnitWrap.classList.remove("hidden");
        elements.resultBox.classList.remove("hidden");
    } else if (state.selectedAction === "Comparison") {
        elements.fromValueLabel.textContent = "FROM";
        elements.toValueLabel.textContent = "TO";
        elements.resultUnitWrap.classList.add("hidden");
        elements.resultBox.classList.remove("hidden");
    } else {
        elements.fromValueLabel.textContent = "FROM";
        elements.toValueLabel.textContent = "TO";
        elements.resultUnitWrap.classList.add("hidden");
        elements.resultBox.classList.remove("hidden");
    }

    showResult(elements.resultText, "No calculation yet.");
}

async function loadUnits(type) {
    try {
        clearErrorBanner(elements.errorBanner);
        const units = AVAILABLE_UNITS[type] || [];
        setUnits(units);

        if (!units.length) {
            showErrorBanner(elements.errorBanner, "No units available for this type.");
        }

        populateDropdown(elements.fromUnitSelect, units);
        populateDropdown(elements.toUnitSelect, units);
        elements.calculateBtn.disabled = !units.length;
    } catch (error) {
        setUnits([]);
        populateDropdown(elements.fromUnitSelect, []);
        populateDropdown(elements.toUnitSelect, []);
        elements.calculateBtn.disabled = true;
        showErrorBanner(elements.errorBanner, "Could not load units. Is backend running at http://localhost:8080?");
    }
}

// History functions disabled - backend doesn't have history endpoints
async function loadHistoryItems() {
    try {
        renderHistory(elements.historyList, []);
    } catch (error) {
        renderHistory(elements.historyList, []);
        console.warn("History load failed", error);
    }
}

async function saveHistory(expression, result) {
    try {
        // History not saved to backend yet
        console.log("History:", expression, result);
    } catch (error) {
        console.warn("History save failed", error);
    }
}

function buildExpression(fromValue, fromUnit, toValue, toUnit) {
    if (state.selectedAction === "Conversion") {
        return `${fromValue} ${fromUnit} -> ${toUnit}`;
    }

    if (state.selectedAction === "Comparison") {
        return `${fromValue} ${fromUnit} vs ${toValue} ${toUnit}`;
    }

    return `${fromValue} ${fromUnit} ${state.operator} ${toValue} ${toUnit}`;
}

async function calculate() {
    clearErrorBanner(elements.errorBanner);

    const fromCheck = validateNumber(elements.fromValueInput, elements.fromValueError);
    const toCheck = validateNumber(elements.toValueInput, elements.toValueError);

    if (!fromCheck.valid || !toCheck.valid) {
        showResult(elements.resultText, "Invalid input. Please fix errors.");
        return;
    }

    const fromUnit = elements.fromUnitSelect.value;
    const toUnit = elements.toUnitSelect.value;

    if (!fromUnit || !toUnit) {
        showErrorBanner(elements.errorBanner, "Please select both units.");
        return;
    }

    const fromValue = fromCheck.value;
    const toValue = toCheck.value;

    try {
        let output = "";

        if (state.selectedAction === "Conversion") {
            const result = await convertQuantity(
                { value: fromValue, unit: fromUnit },
                toUnit
            );
            output = `${formatNumber(result.value)} ${result.unit}`;
            elements.resultUnitWrap.classList.remove("hidden");
            elements.resultUnitSelect.innerHTML = `<option>${result.unit}</option>`;
        } else if (state.selectedAction === "Comparison") {
            const isEqual = await compareQuantities(
                { value: fromValue, unit: fromUnit },
                { value: toValue, unit: toUnit }
            );

            if (isEqual) {
                output = `${fromValue} ${fromUnit} = ${toValue} ${toUnit}`;
            } else {
                // Try to determine which is greater by converting both to the same unit
                try {
                    const convertedRight = await convertQuantity(
                        { value: toValue, unit: toUnit },
                        fromUnit
                    );
                    if (fromValue > convertedRight.value) {
                        output = `${fromValue} ${fromUnit} > ${toValue} ${toUnit}`;
                    } else {
                        output = `${fromValue} ${fromUnit} < ${toValue} ${toUnit}`;
                    }
                } catch {
                    output = `${fromValue} ${fromUnit} ≠ ${toValue} ${toUnit}`;
                }
            }

            elements.resultUnitWrap.classList.add("hidden");
        } else if (state.selectedAction === "Arithmetic") {
            let result;
            if (state.operator === "+") {
                result = await addQuantities(
                    { value: fromValue, unit: fromUnit },
                    { value: toValue, unit: toUnit }
                );
            } else if (state.operator === "-") {
                result = await subtractQuantities(
                    { value: fromValue, unit: fromUnit },
                    { value: toValue, unit: toUnit }
                );
            } else if (state.operator === "*") {
                // For multiplication, convert second value to first unit and multiply
                const convertedRight = await convertQuantity(
                    { value: toValue, unit: toUnit },
                    fromUnit
                );
                result = {
                    value: fromValue * convertedRight.value,
                    unit: fromUnit
                };
            } else if (state.operator === "/") {
                if (toValue === 0) {
                    showResult(elements.resultText, "Cannot divide by zero.");
                    return;
                }
                result = await divideQuantities(
                    { value: fromValue, unit: fromUnit },
                    { value: toValue, unit: toUnit }
                );
            }

            output = `${formatNumber(result.value)} ${result.unit || fromUnit}`;
            elements.resultUnitWrap.classList.remove("hidden");
            elements.resultUnitSelect.innerHTML = `<option>${result.unit || fromUnit}</option>`;
        }

        showResult(elements.resultText, output);

        const expression = buildExpression(fromValue, fromUnit, toValue, toUnit);
        await saveHistory(expression, output);
    } catch (error) {
        showResult(elements.resultText, "Invalid calculation.");
        showErrorBanner(elements.errorBanner, error.message || "Calculation failed.");
        console.error("Calculation error:", error);
    }
}

function formatNumber(num) {
    if (typeof num !== "number") return String(num);
    return Math.round(num * 100) / 100;
}

function bindEvents() {
    elements.typeButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const type = button.dataset.type;
            if (type === state.selectedType) {
                return;
            }

            setType(type);
            setActive(elements.typeButtons, "type", state.selectedType);
            resetInputs();
            await loadUnits(state.selectedType);
        });
    });

    elements.actionButtons.forEach((button) => {
        button.addEventListener("click", () => {
            setAction(button.dataset.action);
            setActive(elements.actionButtons, "action", state.selectedAction);

        localStorage.removeItem("qmAuthToken");
            if (state.selectedAction === "Arithmetic") {
                setOperator("+");
                setActive(elements.operatorButtons, "op", state.operator);
            }

            updateActionUI();
        });
    });

    elements.operatorButtons.forEach((button) => {
        button.addEventListener("click", () => {
            setOperator(button.dataset.op);
            setActive(elements.operatorButtons, "op", state.operator);
        });
    });

    [elements.fromValueInput, elements.toValueInput].forEach((input) => {
        input.addEventListener("input", () => {
            if (input === elements.fromValueInput) {
                validateNumber(elements.fromValueInput, elements.fromValueError);
            } else {
                validateNumber(elements.toValueInput, elements.toValueError);
            }
        });
    });

    elements.calculateBtn.addEventListener("click", calculate);
    elements.refreshHistoryBtn.addEventListener("click", loadHistoryItems);

    elements.resetBtn.addEventListener("click", () => {
        resetInputs();
        clearErrorBanner(elements.errorBanner);
    });

    elements.logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("qmCurrentUser");
        window.location.href = "auth.html";
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const user = requireAuth();

    if (!user) {
        return;
    }

    setActive(elements.typeButtons, "type", state.selectedType);
    setActive(elements.actionButtons, "action", state.selectedAction);
    setActive(elements.operatorButtons, "op", state.operator);

    updateActionUI();
    bindEvents();

    await loadUnits(state.selectedType);
    await loadHistoryItems();
});
