import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./verifyJwt";

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
}