package com.jobtrack.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handle(Exception ex) {

        ex.printStackTrace();

        return new ResponseEntity<>(
                ex.getClass().getName() + " : " + ex.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}