const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'agricargas_access_secret_2024';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'agricargas_refresh_secret_2024';

const ACCESS_TOKEN_EXPIRY = '15m';   // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';   // 7 days

/**
 * Generate access token (short-lived)
 */
function generateAccessToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
}

/**
 * Generate refresh token (long-lived)
 */
function generateRefreshToken(user) {
    return jwt.sign(
        { id: user.id },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
}

/**
 * Verify access token
 */
function verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
}

/**
 * Auth middleware — protects routes
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token de acesso não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyAccessToken(token);
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ message: 'Token inválido' });
    }
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    authMiddleware,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY,
};
