import jwt, {decode} from 'jsonwebtoken';

export const generateToken = (user) => {
    return jwt.sign({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
    },
    process.env.JWT_SECRET,
    {
        expiresIn:'30d',
    });
};

export const isAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log("No token found");
    return res.status(401).send({ message: 'No Token' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      console.log("Invalid or missing decoded payload:", err?.message || 'None');
      return res.status(401).send({ message: 'Invalid Token' });
    }

    // ✅ Now it's safe to use `decoded`
    req.user = decoded;
    next();
  });
};

export const isAdmin = (req, res, next) => {
    if(req.user && req.user.isAdmin){
        next();
    }
    else{
        res.status(401).send({message:'Invalid Admin Token'})
    }
}