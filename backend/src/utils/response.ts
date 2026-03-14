import { Response } from "express";
import { PaginationMeta } from "../types/api.types";

interface SuccessPayload<T> {
  status: "success";
  data: T;
  message?: string;
}

interface PaginatedPayload<T> extends SuccessPayload<T[]> {
  pagination: PaginationMeta;
}

interface ErrorPayload {
  status: "error";
  message: string;
  code?: string;
  errors?: unknown;
}

export class ApiResponse {
  static ok<T>(res: Response, data: T, message?: string): Response {
    const body: SuccessPayload<T> = { status: "success", data };
    if (message) body.message = message;
    return res.status(200).json(body);
  }

  static created<T>(res: Response, data: T, message?: string): Response {
    const body: SuccessPayload<T> = { status: "success", data };
    if (message) body.message = message;
    return res.status(201).json(body);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta
  ): Response {
    const body: PaginatedPayload<T> = {
      status: "success",
      data,
      pagination,
    };
    return res.status(200).json(body);
  }

  static error(
    res: Response,
    statusCode: number,
    message: string,
    code?: string,
    errors?: unknown
  ): Response {
    const body: ErrorPayload = { status: "error", message };
    if (code) body.code = code;
    if (errors !== undefined) body.errors = errors;
    return res.status(statusCode).json(body);
  }
}
