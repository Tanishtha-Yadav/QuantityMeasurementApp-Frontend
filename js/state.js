export const state = {
    selectedType: "Length",
    selectedAction: "Comparison",
    operator: "+",
    units: [],
};

export function setType(type) {
    state.selectedType = type;
}

export function setAction(action) {
    state.selectedAction = action;
}

export function setOperator(operator) {
    state.operator = operator;
}

export function setUnits(units) {
    state.units = units;
}
