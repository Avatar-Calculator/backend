import { getAuth } from 'firebase-admin/auth'

// @ts-ignore: Unreachable code error
export const isAuthenticated = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        const userInfo = await getAuth().verifyIdToken(authorization);
        res.locals.uid = userInfo.uid;
        return next();
    } catch (e) {
        return res
            .status(401)
            .send({ error: 'You are not authorized to make this request' });
    }
}
