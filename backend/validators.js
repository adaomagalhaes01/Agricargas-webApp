/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * - At least 6 characters
 */
function isValidPassword(password) {
    return typeof password === 'string' && password.length >= 6;
}

/**
 * Validate phone number (optional, basic check)
 */
function isValidPhone(phone) {
    if (!phone) return true; // phone is optional
    const phoneRegex = /^[\d\s\-+()]{7,20}$/;
    return phoneRegex.test(phone);
}

/**
 * Validate name
 */
function isValidName(name) {
    return typeof name === 'string' && name.trim().length >= 2;
}

/**
 * Validate registration input
 */
function validateRegistration(body) {
    const errors = [];
    const { name, email, password, phone } = body;

    if (!name || !isValidName(name)) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (!email || !isValidEmail(email)) {
        errors.push('Email inválido');
    }

    if (!password || !isValidPassword(password)) {
        errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (phone && !isValidPhone(phone)) {
        errors.push('Número de telefone inválido');
    }

    return errors;
}

/**
 * Validate login input
 */
function validateLogin(body) {
    const errors = [];
    const { email, password } = body;

    if (!email || !isValidEmail(email)) {
        errors.push('Email inválido');
    }

    if (!password) {
        errors.push('Senha é obrigatória');
    }

    return errors;
}

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidPhone,
    isValidName,
    validateRegistration,
    validateLogin,
};
