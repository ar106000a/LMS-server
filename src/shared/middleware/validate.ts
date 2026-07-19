import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

import { ValidationError } from "../../utils/error";

export const validate =
  (schema: ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      // Attach the parsed query data for downstream controllers
      (req as any).validatedQuery = parsed.query;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // 1. Map through the flat list of validation issues
        const errorMessages = error.issues
          .map((issue) => {
            // issue.path looks like ['body', 'password'].
            // Slicing out the first element leaves just 'password' for cleaner API messages.
            const field = issue.path.slice(1).join(".") || issue.path.join(".");
            return `${field}: ${issue.message}`;
          })
          .join(", ");

        // 2. Pass the custom error down to your Express global error handler
        return next(new ValidationError(errorMessages));
      }

      next(error);
    }
  };
