// Mock database (frontend-only, no backend needed)
const MOCK_DB = {
    users: [
        { id: 1, name: "Demo User", email: "demo@test.com", password: "demo123" },
        { id: 2, name: "John Doe", email: "john@example.com", password: "password123" }
    ],
    conversions: [
        { id: 1, from: "km", to: "m", factor: 1000, formula: null },
        { id: 2, from: "m", to: "km", factor: 0.001, formula: null },
        { id: 3, from: "m", to: "cm", factor: 100, formula: null },
        { id: 4, from: "cm", to: "m", factor: 0.01, formula: null },
        { id: 5, from: "km", to: "cm", factor: 100000, formula: null },
        { id: 6, from: "cm", to: "km", factor: 0.00001, formula: null },
        
        { id: 7, from: "kg", to: "g", factor: 1000, formula: null },
        { id: 8, from: "g", to: "kg", factor: 0.001, formula: null },
        { id: 9, from: "g", to: "mg", factor: 1000, formula: null },
        { id: 10, from: "mg", to: "g", factor: 0.001, formula: null },
        { id: 11, from: "kg", to: "mg", factor: 1000000, formula: null },
        { id: 12, from: "mg", to: "kg", factor: 0.000001, formula: null },
        
        { id: 13, from: "l", to: "ml", factor: 1000, formula: null },
        { id: 14, from: "ml", to: "l", factor: 0.001, formula: null },
        
        { id: 15, from: "c", to: "f", factor: null, formula: "(x * 9 / 5) + 32" },
        { id: 16, from: "f", to: "c", factor: null, formula: "(x - 32) * 5 / 9" },
        { id: 17, from: "c", to: "k", factor: null, formula: "x + 273.15" },
        { id: 18, from: "k", to: "c", factor: null, formula: "x - 273.15" },
        { id: 19, from: "f", to: "k", factor: null, formula: "((x - 32) * 5 / 9) + 273.15" },
        { id: 20, from: "k", to: "f", factor: null, formula: "((x - 273.15) * 9 / 5) + 32" }
    ]
};

// Generate mock token
function generateToken(userId, email) {
    return `mock-token-${userId}-${Date.now()}`;
}

// Authentication endpoints
export async function register(name, email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Check if user exists
            if (MOCK_DB.users.some(u => u.email === email)) {
                reject(new Error("User already exists"));
                return;
            }
            
            // Create new user
            const newUser = {
                id: Math.max(...MOCK_DB.users.map(u => u.id)) + 1,
                name,
                email,
                password
            };
            
            MOCK_DB.users.push(newUser);
            const token = generateToken(newUser.id, newUser.email);
            localStorage.setItem("qmAuthToken", token);
            
            resolve({
                token,
                user: { id: newUser.id, name: newUser.name, email: newUser.email }
            });
        }, 500); // Simulate network delay
    });
}

export async function login(email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = MOCK_DB.users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                reject(new Error("Invalid email or password"));
                return;
            }
            
            const token = generateToken(user.id, user.email);
            localStorage.setItem("qmAuthToken", token);
            
            resolve({
                token,
                user: { id: user.id, name: user.name, email: user.email }
            });
        }, 500); // Simulate network delay
    });
}


// Helper function to find conversion path
function findConversion(fromUnit, toUnit) {
    const from = fromUnit.toLowerCase();
    const to = toUnit.toLowerCase();
    
    return MOCK_DB.conversions.find(c => c.from === from && c.to === to);
}

// Helper function to convert a value
function convertValue(value, conversion) {
    if (conversion.factor) {
        return value * conversion.factor;
    } else if (conversion.formula) {
        const x = value;
        return eval(conversion.formula);
    }
    return value;
}

// Quantity operations endpoints
export async function compareQuantities(thisQuantity, thatQuantity) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const conversion = findConversion(thisQuantity.unit, thatQuantity.unit);
                
                if (!conversion) {
                    throw new Error("Conversion not supported");
                }
                
                const convertedValue = convertValue(thisQuantity.value, conversion);
                const result = convertedValue === thatQuantity.value ? 0 : 
                               convertedValue > thatQuantity.value ? 1 : -1;
                
                resolve({
                    result,
                    message: result === 0 ? "Equal" : result > 0 ? "Greater" : "Less"
                });
            } catch (error) {
                reject(error);
            }
        }, 300);
    });
}

export async function convertQuantity(quantity, targetUnit) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const conversion = findConversion(quantity.unit, targetUnit);
                
                if (!conversion) {
                    throw new Error("Conversion not supported");
                }
                
                const result = convertValue(quantity.value, conversion);
                
                resolve({ value: result, unit: targetUnit });
            } catch (error) {
                reject(error);
            }
        }, 300);
    });
}

export async function addQuantities(thisQuantity, thatQuantity) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const conversion = findConversion(thatQuantity.unit, thisQuantity.unit);
                
                if (!conversion) {
                    throw new Error("Addition not supported");
                }
                
                const convertedValue = convertValue(thatQuantity.value, conversion);
                const result = thisQuantity.value + convertedValue;
                
                resolve({ value: result, unit: thisQuantity.unit });
            } catch (error) {
                reject(error);
            }
        }, 300);
    });
}

export async function subtractQuantities(thisQuantity, thatQuantity) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const conversion = findConversion(thatQuantity.unit, thisQuantity.unit);
                
                if (!conversion) {
                    throw new Error("Subtraction not supported");
                }
                
                const convertedValue = convertValue(thatQuantity.value, conversion);
                const result = thisQuantity.value - convertedValue;
                
                resolve({ value: result, unit: thisQuantity.unit });
            } catch (error) {
                reject(error);
            }
        }, 300);
    });
}

export async function divideQuantities(thisQuantity, thatQuantity) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const conversion = findConversion(thatQuantity.unit, thisQuantity.unit);
                
                if (!conversion) {
                    throw new Error("Division not supported");
                }
                
                const convertedValue = convertValue(thatQuantity.value, conversion);
                
                if (convertedValue === 0) {
                    throw new Error("Division by zero");
                }
                
                const result = thisQuantity.value / convertedValue;
                
                resolve({ value: result, unit: thisQuantity.unit });
            } catch (error) {
                reject(error);
            }
        }, 300);
    });
}
