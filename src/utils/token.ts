import jwt from "jsonwebtoken";

type TokenUser = {
  id: string;
  role: string;
};

export function generateToken(user: TokenUser) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" },
  );
}
