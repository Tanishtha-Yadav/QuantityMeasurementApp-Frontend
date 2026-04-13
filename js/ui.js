export function getElements() {
    return {
        typeButtons: document.querySelectorAll(".type-btn"),
        actionButtons: document.querySelectorAll(".action-btn"),
        operatorButtons: document.querySelectorAll(".operator-btn"),
        inputZone: document.querySelector(".input-zone"),
        fromValueInput: document.getElementById("fromValue"),
        toValueInput: document.getElementById("toValue"),
        fromValueLabel: document.getElementById("fromValueLabel"),
        toValueLabel: document.getElementById("toValueLabel"),
        fromUnitSelect: document.getElementById("fromUnit"),
        toUnitSelect: document.getElementById("toUnit"),
        resultUnitSelect: document.getElementById("resultUnit"),
        resultUnitWrap: document.getElementById("resultUnitWrap"),
        fromValueError: document.getElementById("fromValueError"),
        toValueError: document.getElementById("toValueError"),
        errorBanner: document.getElementById("errorBanner"),
        calculateBtn: document.getElementById("calculateBtn"),
        resetBtn: document.getElementById("resetBtn"),
        refreshHistoryBtn: document.getElementById("refreshHistoryBtn"),
        operatorWrap: document.getElementById("operatorWrap"),
        resultText: document.getElementById("resultText"),
        resultBox: document.getElementById("resultBox"),
        historyList: document.getElementById("historyList"),
        logoutBtn: document.getElementById("logoutBtn"),
        userBadge: document.getElementById("userBadge"),
    };
}

export function setActive(buttons, key, value) {
    buttons.forEach((button) => {
        button.classList.toggle("active", button.dataset[key] === value);
    });
}

export function showErrorBanner(errorBanner, message) {
    errorBanner.textContent = message;
}

export function clearErrorBanner(errorBanner) {
    errorBanner.textContent = "";
}

export function showResult(resultText, text) {
    resultText.textContent = text;
}

export function validateNumber(inputElement, errorElement) {
    const raw = inputElement.value.trim();

    if (raw === "") {
        inputElement.classList.add("input-error");
        errorElement.textContent = "This field is required.";
        return { valid: false };
    }

    const numeric = Number(raw);

    if (!Number.isFinite(numeric)) {
        inputElement.classList.add("input-error");
        errorElement.textContent = "Please enter a valid number.";
        return { valid: false };
    }

    inputElement.classList.remove("input-error");
    errorElement.textContent = "";
    return { valid: true, value: numeric };
}

export function populateDropdown(selectElement, units) {
    selectElement.innerHTML = "";

    if (!units.length) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Unavailable";
        selectElement.appendChild(option);
        selectElement.disabled = true;
        return;
    }

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select Unit";
    placeholder.disabled = true;
    selectElement.appendChild(placeholder);

    units.forEach((unit) => {
        const option = document.createElement("option");
        option.value = unit.symbol;
        option.textContent = unit.label;
        selectElement.appendChild(option);
    });

    selectElement.disabled = false;
    selectElement.selectedIndex = 1;
}

export function renderHistory(historyList, rows) {
    historyList.innerHTML = "";

    if (!rows.length) {
        const item = document.createElement("li");
        item.className = "history-item";
        item.textContent = "No calculations yet.";
        historyList.appendChild(item);
        return;
    }

    rows.forEach((row) => {
        const item = document.createElement("li");
        item.className = "history-item";
        const time = row.timestamp ? new Date(row.timestamp).toLocaleString() : "No timestamp";
        item.innerHTML = `
            <p>${row.expression} = ${row.result}</p>
            <small>${time}</small>
        `;
        historyList.appendChild(item);
    });
}
