
import { Injectable, NestInterceptor } from "@nestjs/common";
import { ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from "express";

interface ApiResponse<T> { success: boolean; status: number; data: T; }

@Injectable()
export default class TransformResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<ApiResponse<T>> {

    const response = context.switchToHttp().getResponse<Response>();

    return next
      .handle()
      .pipe(map(data => ({
        success: true, status: response.statusCode, data
      }))
      );
  }
}
